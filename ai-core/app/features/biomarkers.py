import numpy as np

def compute_biomarkers(mask: np.ndarray) -> dict:
    mask = (mask > 0).astype(np.uint8)
    h, w = mask.shape[:2]
    total = max(1, h * w)
    vessel_density = float(mask.sum() / total)

    edges = (np.abs(np.diff(mask.astype(np.int16), axis=0)).sum() +
             np.abs(np.diff(mask.astype(np.int16), axis=1)).sum())
    edge_density_proxy = float(edges / total)

    return {
        "vessel_density": vessel_density,
        "edge_density_proxy": edge_density_proxy,
    }
