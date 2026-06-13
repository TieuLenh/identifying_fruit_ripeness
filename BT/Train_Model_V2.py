import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt
import matplotlib
import seaborn as sns
import numpy as np

matplotlib.use('Agg')

# ===========================================================
# CẤU HÌNH
# ===========================================================
DATA_DIR   = r"./dataset_processed"
OUTPUT_DIR = r"./output"

MODEL_SAVE_PATH = os.path.join(OUTPUT_DIR, "best_model_v2.pt")
PLOT_SAVE_PATH  = os.path.join(OUTPUT_DIR, "learning_curve_v2.png")
CM_SAVE_PATH    = os.path.join(OUTPUT_DIR, "confusion_matrix_v2.png")

os.makedirs(OUTPUT_DIR, exist_ok=True)

IMG_SIZE    = 224       # Chuẩn ImageNet, khớp với TienXuLy_V2
BATCH_SIZE  = 32
EPOCHS_P1   = 10        # Freeze backbone
EPOCHS_P2   = 20        # Fine-tune toàn bộ
LR_P1       = 1e-3
LR_P2       = 1e-5

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Thiết bị: {device}")
if device.type == 'cuda':
    print(f"  GPU: {torch.cuda.get_device_name(0)}")


# ===========================================================
# DATA LOADING
# ===========================================================
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

print("\nĐang load dataset...")
train_ds = datasets.ImageFolder(os.path.join(DATA_DIR, 'train'), transform=train_transform)
val_ds   = datasets.ImageFolder(os.path.join(DATA_DIR, 'val'),   transform=val_transform)
test_ds  = datasets.ImageFolder(os.path.join(DATA_DIR, 'test'),  transform=val_transform)

CLASS_NAMES = train_ds.classes
NUM_CLASSES = len(CLASS_NAMES)

print(f"Số class   : {NUM_CLASSES} → {CLASS_NAMES}")
print(f"Train      : {len(train_ds)} ảnh")
print(f"Val        : {len(val_ds)} ảnh")
print(f"Test       : {len(test_ds)} ảnh")

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0, pin_memory=True)
val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=True)
test_loader  = DataLoader(test_ds,  batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=True)


# ===========================================================
# MODEL
# ===========================================================
print("\nKhởi tạo MobileNetV2 pretrained...")
model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
model.classifier[1] = nn.Linear(model.last_channel, NUM_CLASSES)
model = model.to(device)
print(f"Tổng tham số: {sum(p.numel() for p in model.parameters()):,}")


# ===========================================================
# HÀM TRAIN / EVALUATE
# ===========================================================
def train_one_epoch(model, loader, criterion, optimizer):
    model.train()
    running_loss, correct, total = 0.0, 0, 0
    for inputs, labels in loader:
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * inputs.size(0)
        _, preds = torch.max(outputs, 1)
        correct  += (preds == labels).sum().item()
        total    += labels.size(0)
    return running_loss / total, correct / total


def evaluate(model, loader, criterion):
    model.eval()
    running_loss, correct, total = 0.0, 0, 0
    all_preds, all_labels = [], []
    with torch.no_grad():
        for inputs, labels in loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            running_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            correct  += (preds == labels).sum().item()
            total    += labels.size(0)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
    return running_loss / total, correct / total, all_preds, all_labels


# ===========================================================
# GIAI ĐOẠN 1 — FREEZE BACKBONE
# ===========================================================
print("\n" + "="*55)
print("GIAI ĐOẠN 1: Freeze backbone — train classifier")
print("="*55)

for param in model.features.parameters():
    param.requires_grad = False

criterion  = nn.CrossEntropyLoss()
optimizer1 = optim.Adam(filter(lambda p: p.requires_grad, model.parameters()), lr=LR_P1)
scheduler1 = optim.lr_scheduler.ReduceLROnPlateau(optimizer1, mode='max', factor=0.5, patience=3)

history = {'train_loss': [], 'val_loss': [], 'train_acc': [], 'val_acc': []}
best_val_acc = 0.0

for epoch in range(1, EPOCHS_P1 + 1):
    tr_loss, tr_acc = train_one_epoch(model, train_loader, criterion, optimizer1)
    vl_loss, vl_acc, _, _ = evaluate(model, val_loader, criterion)
    history['train_loss'].append(tr_loss)
    history['val_loss'].append(vl_loss)
    history['train_acc'].append(tr_acc)
    history['val_acc'].append(vl_acc)
    scheduler1.step(vl_acc)
    tag = ""
    if vl_acc > best_val_acc:
        best_val_acc = vl_acc
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        tag = "  ✓ Lưu"
    print(f"[P1] Epoch {epoch:02d}/{EPOCHS_P1} | "
          f"Train Loss: {tr_loss:.4f} Acc: {tr_acc:.4f} | "
          f"Val Loss: {vl_loss:.4f} Acc: {vl_acc:.4f}{tag}")


# ===========================================================
# GIAI ĐOẠN 2 — FINE-TUNE TOÀN BỘ
# ===========================================================
print("\n" + "="*55)
print("GIAI ĐOẠN 2: Unfreeze — fine-tune toàn bộ mạng")
print("="*55)

for param in model.parameters():
    param.requires_grad = True

optimizer2 = optim.Adam(model.parameters(), lr=LR_P2)
scheduler2 = optim.lr_scheduler.ReduceLROnPlateau(optimizer2, mode='max', factor=0.5, patience=5)

for epoch in range(1, EPOCHS_P2 + 1):
    tr_loss, tr_acc = train_one_epoch(model, train_loader, criterion, optimizer2)
    vl_loss, vl_acc, _, _ = evaluate(model, val_loader, criterion)
    history['train_loss'].append(tr_loss)
    history['val_loss'].append(vl_loss)
    history['train_acc'].append(tr_acc)
    history['val_acc'].append(vl_acc)
    scheduler2.step(vl_acc)
    tag = ""
    if vl_acc > best_val_acc:
        best_val_acc = vl_acc
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        tag = "  ✓ Lưu"
    print(f"[P2] Epoch {epoch:02d}/{EPOCHS_P2} | "
          f"Train Loss: {tr_loss:.4f} Acc: {tr_acc:.4f} | "
          f"Val Loss: {vl_loss:.4f} Acc: {vl_acc:.4f}{tag}")


# ===========================================================
# ĐÁNH GIÁ TEST SET
# ===========================================================
print("\n" + "="*55)
print("ĐÁNH GIÁ TRÊN TẬP TEST (best checkpoint)")
print("="*55)

model.load_state_dict(torch.load(MODEL_SAVE_PATH))
_, test_acc, preds, labels = evaluate(model, test_loader, criterion)

print(f"\nTest Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")
print("\nClassification Report:")
print(classification_report(labels, preds, target_names=CLASS_NAMES))


# ===========================================================
# LEARNING CURVE
# ===========================================================
total_epochs = EPOCHS_P1 + EPOCHS_P2
epochs_range = range(1, total_epochs + 1)

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle('Learning Curve — Fruit Classification V2', fontsize=14)

axes[0].plot(epochs_range, history['train_loss'], label='Train Loss')
axes[0].plot(epochs_range, history['val_loss'],   label='Val Loss')
axes[0].axvline(x=EPOCHS_P1 + 0.5, color='gray', linestyle='--', alpha=0.6, label='Fine-tune bắt đầu')
axes[0].set_title('Loss'); axes[0].set_xlabel('Epoch'); axes[0].legend(); axes[0].grid(True, alpha=0.3)

axes[1].plot(epochs_range, history['train_acc'], label='Train Acc')
axes[1].plot(epochs_range, history['val_acc'],   label='Val Acc')
axes[1].axvline(x=EPOCHS_P1 + 0.5, color='gray', linestyle='--', alpha=0.6, label='Fine-tune bắt đầu')
axes[1].set_title('Accuracy'); axes[1].set_xlabel('Epoch'); axes[1].legend(); axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(PLOT_SAVE_PATH, dpi=150, bbox_inches='tight')
print(f"\nĐã lưu learning curve: {PLOT_SAVE_PATH}")


# ===========================================================
# CONFUSION MATRIX
# ===========================================================
cm = confusion_matrix(labels, preds)
fig, ax = plt.subplots(figsize=(9, 7))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES, ax=ax)
ax.set_title('Confusion Matrix — Test Set V2', fontsize=13)
ax.set_xlabel('Predicted Label')
ax.set_ylabel('True Label')
plt.xticks(rotation=30, ha='right')
plt.tight_layout()
plt.savefig(CM_SAVE_PATH, dpi=150, bbox_inches='tight')
print(f"Đã lưu confusion matrix: {CM_SAVE_PATH}")

print("\n✅ Hoàn tất! Model tốt nhất:", MODEL_SAVE_PATH)
