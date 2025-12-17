import os, argparse, torch
from ml.models.vessel_unet import build_unet

def main(weights_path: str, out_path: str):
    ckpt = torch.load(weights_path, map_location="cpu")
    cfg = ckpt.get("config", {})
    mcfg = cfg.get("model", {})
    model = build_unet(encoder_name=mcfg.get("encoder","resnet34"), encoder_weights=None)
    model.load_state_dict(ckpt["state_dict"], strict=False)
    model.eval()
    dummy = torch.randn(1, 3, 512, 512)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    torch.onnx.export(model, dummy, out_path, opset_version=17, input_names=["image"], output_names=["logits"])
    print("exported:", out_path)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--weights", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    main(args.weights, args.out)
