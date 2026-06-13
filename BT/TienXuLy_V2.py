import cv2
import numpy as np
import os
from pathlib import Path


# ===========================================================
# CẤU HÌNH
# ===========================================================
INPUT_DIR  = r"D:\ảnh\BT\dataset"
OUTPUT_DIR = r"D:\ảnh\BT\dataset_processed"


# ===========================================================
# FIX UNICODE: đọc/ghi ảnh đường dẫn tiếng Việt
# ===========================================================
def imread_unicode(path):
    stream = np.fromfile(str(path), dtype=np.uint8)
    return cv2.imdecode(stream, cv2.IMREAD_COLOR)

def imwrite_unicode(path, img):
    ext = os.path.splitext(str(path))[1]
    _, buf = cv2.imencode(ext, img)
    buf.tofile(str(path))


# ===========================================================
# HÀM TIỀN XỬ LÝ ẢNH V2
# ===========================================================
def preprocess_image(image_path, target_size=(224, 224)):
    img = imread_unicode(image_path)
    if img is None:
        return None

    img_filtered = cv2.medianBlur(img, 3)

    lab = cv2.cvtColor(img_filtered, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    img_clahe = cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2BGR)

    hsv = cv2.cvtColor(img_clahe, cv2.COLOR_BGR2HSV)
    lower_bound = np.array([0, 40, 40])
    upper_bound = np.array([179, 255, 255])
    raw_mask = cv2.inRange(hsv, lower_bound, upper_bound)

    clean_mask = np.zeros_like(raw_mask)
    contours, _ = cv2.findContours(raw_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
        cv2.drawContours(clean_mask, [largest_contour], -1, 255, -1)

    kernel = np.ones((5, 5), np.uint8)
    clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    clean_mask = cv2.GaussianBlur(clean_mask, (5, 5), 0)

    img_segmented = cv2.bitwise_and(img_clahe, img_clahe, mask=clean_mask)
    img_resized = cv2.resize(img_segmented, target_size, interpolation=cv2.INTER_AREA)

    return img_resized


# ===========================================================
# XỬ LÝ TOÀN BỘ DATASET
# ===========================================================
def process_dataset(input_dir, output_dir):
    input_path  = Path(input_dir)
    output_path = Path(output_dir)
    splits = ['train', 'val', 'test']
    total_success, total_fail = 0, 0

    for split in splits:
        split_dir = input_path / split
        if not split_dir.exists():
            print(f"[!] Không tìm thấy: {split_dir}")
            continue

        for class_dir in sorted(split_dir.iterdir()):
            if not class_dir.is_dir():
                continue

            out_class_dir = output_path / split / class_dir.name
            out_class_dir.mkdir(parents=True, exist_ok=True)

            img_files = [f for f in class_dir.glob('*')
                         if f.suffix.lower() in ['.png', '.jpg', '.jpeg']]

            success, fail = 0, 0
            for img_file in img_files:
                processed = preprocess_image(img_file)
                if processed is not None:
                    imwrite_unicode(out_class_dir / img_file.name, processed)
                    success += 1
                else:
                    fail += 1

            total_success += success
            total_fail    += fail
            print(f"  [{split}] {class_dir.name:.<25} {success} ảnh ✓  {fail} lỗi")

    print("-" * 50)
    print(f"Hoàn tất! Thành công: {total_success} | Lỗi: {total_fail}")


# ===========================================================
# MAIN
# ===========================================================
if __name__ == "__main__":
    print("Bắt đầu tiền xử lý dataset V2...")
    print(f"Input : {INPUT_DIR}")
    print(f"Output: {OUTPUT_DIR}\n")
    process_dataset(INPUT_DIR, OUTPUT_DIR)
    print("\ndataset_processed sẵn sàng để train!")