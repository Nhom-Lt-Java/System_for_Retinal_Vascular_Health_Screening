# ml/models/disease_classifier.py
from __future__ import annotations
from typing import Optional
import torch
import torch.nn as nn
from torchvision import models


def _replace_first_conv(model: nn.Module, in_channels: int) -> nn.Module:
    """
    Replace the first Conv2d of a torchvision model to support in_channels != 3.
    Keeps pretrained weights by copying/averaging when possible.
    """
    if in_channels == 3:
        return model

    first_name = None
    first_conv = None

    for name, m in model.named_modules():
        if isinstance(m, nn.Conv2d):
            first_name, first_conv = name, m
            break

    if first_conv is None:
        raise RuntimeError("No Conv2d layer found to replace.")

    new_conv = nn.Conv2d(
        in_channels=in_channels,
        out_channels=first_conv.out_channels,
        kernel_size=first_conv.kernel_size,
        stride=first_conv.stride,
        padding=first_conv.padding,
        dilation=first_conv.dilation,
        groups=first_conv.groups,
        bias=(first_conv.bias is not None),
        padding_mode=first_conv.padding_mode,
    )

    # init weights from old conv if possible
    with torch.no_grad():
        if first_conv.weight.shape[1] == 3:
            w = first_conv.weight  # (out, 3, k, k)
            if in_channels > 3:
                # copy RGB then extra channels = mean(RGB)
                new_conv.weight[:, :3] = w
                mean_w = w.mean(dim=1, keepdim=True)  # (out,1,k,k)
                for c in range(3, in_channels):
                    new_conv.weight[:, c:c+1] = mean_w
            else:
                # in_channels = 1 or 2 => take mean of RGB then slice
                mean_w = w.mean(dim=1, keepdim=True)
                new_conv.weight[:, :in_channels] = mean_w.repeat(1, in_channels, 1, 1)
        else:
            # fallback random init (rare)
            nn.init.kaiming_normal_(new_conv.weight, mode="fan_out", nonlinearity="relu")

        if new_conv.bias is not None:
            nn.init.zeros_(new_conv.bias)

    # set into model by name
    parent = model
    parts = first_name.split(".")
    for p in parts[:-1]:
        parent = getattr(parent, p)
    setattr(parent, parts[-1], new_conv)

    return model


def build_disease_classifier(
    name: str,
    num_classes: int,
    pretrained: bool = True,
    in_channels: int = 3,
) -> nn.Module:
    """
    Supported: efficientnet_b0, resnet50, convnext_tiny
    """
    name = name.lower().strip()

    if name == "efficientnet_b0":
        weights = models.EfficientNet_B0_Weights.IMAGENET1K_V1 if pretrained else None
        m = models.efficientnet_b0(weights=weights)
        m = _replace_first_conv(m, in_channels)
        in_f = m.classifier[1].in_features
        m.classifier[1] = nn.Linear(in_f, num_classes)
        return m

    if name == "resnet50":
        weights = models.ResNet50_Weights.IMAGENET1K_V2 if pretrained else None
        m = models.resnet50(weights=weights)
        m = _replace_first_conv(m, in_channels)
        in_f = m.fc.in_features
        m.fc = nn.Linear(in_f, num_classes)
        return m

    if name == "convnext_tiny":
        weights = models.ConvNeXt_Tiny_Weights.IMAGENET1K_V1 if pretrained else None
        m = models.convnext_tiny(weights=weights)
        m = _replace_first_conv(m, in_channels)
        in_f = m.classifier[2].in_features
        m.classifier[2] = nn.Linear(in_f, num_classes)
        return m

    raise ValueError(f"Unsupported model: {name}. Use efficientnet_b0/resnet50/convnext_tiny")
