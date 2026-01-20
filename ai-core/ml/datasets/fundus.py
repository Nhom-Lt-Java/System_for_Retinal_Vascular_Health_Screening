import os
import glob
import cv2
import numpy as np
from torch.utils.data import Dataset

class FundusVesselDataset(Dataset):
    def __init__(self, items, transform=None):
        self.items = items
        self.transform = transform

    @staticmethod
    def from_folder(image_dir: str, mask_dir: str):
        imgs = sorted(glob.glob(os.path.join(image_dir, "*.*")))
        items = []
        for p in imgs:
            name = os.path.splitext(os.path.basename(p))[0]
            candidates = [
                os.path.join(mask_dir, name + ".png"),
                os.path.join(mask_dir, name + ".jpg"),
                os.path.join(mask_dir, name + "_mask.png"),
                os.path.join(mask_dir, name + "_manual1.png"),
            ]
            m = next((c for c in candidates if os.path.exists(c)), None)
            if m:
                items.append((p, m))
        return items

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        img_path, mask_path = self.items[idx]
        img = cv2.cvtColor(cv2.imread(img_path), cv2.COLOR_BGR2RGB)
        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
        mask = (mask > 127).astype(np.float32)

        if self.transform:
            aug = self.transform(image=img, mask=mask)
            img, mask = aug["image"], aug["mask"]

        img = img.astype(np.float32) / 255.0
        img = np.transpose(img, (2, 0, 1))
        mask = mask[None, :, :]
        return img, mask
