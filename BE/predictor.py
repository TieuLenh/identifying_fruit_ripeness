import os

import torch
import torch.nn as nn

from PIL import Image
from torchvision import transforms, models

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available()
    else "cpu"
)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "..",
    "BT",
    "dataset",
    "train"
) # Đường dẫn đến thư mục chứa dataset đã được xử lý, khớp với Train_Model_V2.py

print(f"Dataset path: {DATASET_PATH}")

CLASS_NAMES = sorted(os.listdir(DATASET_PATH))
NUM_CLASSES = len(CLASS_NAMES)

print('Model classes: ', CLASS_NAMES)


MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "BT",
    "output",
    "best_model_v2.pt"
) # Đường dẫn đến model đã train xong

print(f"Model path: {MODEL_PATH}")

model = models.mobilenet_v2(
    weights=None
)

model.classifier[1] = nn.Linear(
    model.last_channel,
    NUM_CLASSES
)

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )
)

model.to(DEVICE)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


def predict_image(image):

    image = transform(image)

    image = image.unsqueeze(0)

    image = image.to(DEVICE)

    with torch.no_grad():

        outputs = model(image)

        probs = torch.softmax(
            outputs,
            dim=1
        )

        confidence, pred = torch.max(
            probs,
            1
        )

    return {
        "class": CLASS_NAMES[pred.item()],
        "confidence": round(
            confidence.item() * 100,
            2
        )
    }