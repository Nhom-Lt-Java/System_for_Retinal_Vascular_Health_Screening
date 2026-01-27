import torch
import torch.nn as nn
import torch.nn.functional as F

class RecurrentBlock(nn.Module):
    def __init__(self, ch, t=2):
        super().__init__()
        self.t = t
        self.conv = nn.Sequential(
            nn.Conv2d(ch, ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        x1 = self.conv(x)
        for _ in range(self.t - 1):
            x1 = self.conv(x + x1)
        return x1

class RRCNNBlock(nn.Module):
    def __init__(self, ch_in, ch_out, t=2):
        super().__init__()
        self.conv_1x1 = nn.Conv2d(ch_in, ch_out, 1, bias=False)
        self.rcnn = nn.Sequential(
            RecurrentBlock(ch_out, t=t),
            RecurrentBlock(ch_out, t=t),
        )

    def forward(self, x):
        x = self.conv_1x1(x)
        x1 = self.rcnn(x)
        return x + x1

class AttentionBlock(nn.Module):
    def __init__(self, F_g, F_l, F_int):
        super().__init__()
        self.W_g = nn.Sequential(
            nn.Conv2d(F_g, F_int, 1, bias=False),
            nn.BatchNorm2d(F_int),
        )
        self.W_x = nn.Sequential(
            nn.Conv2d(F_l, F_int, 1, bias=False),
            nn.BatchNorm2d(F_int),
        )
        self.psi = nn.Sequential(
            nn.Conv2d(F_int, 1, 1, bias=False),
            nn.BatchNorm2d(1),
            nn.Sigmoid(),
        )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, g, x):
        # g: gating (decoder), x: skip (encoder)
        psi = self.relu(self.W_g(g) + self.W_x(x))
        psi = self.psi(psi)
        return x * psi

class UpConv(nn.Module):
    def __init__(self, ch_in, ch_out):
        super().__init__()
        self.up = nn.Sequential(
            nn.Upsample(scale_factor=2, mode="bilinear", align_corners=False),
            nn.Conv2d(ch_in, ch_out, 3, padding=1, bias=False),
            nn.BatchNorm2d(ch_out),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.up(x)

class AttentionR2UNet(nn.Module):
    def __init__(self, in_channels=3, out_channels=1, base=64, t=2):
        super().__init__()
        # Encoder
        self.RRCNN1 = RRCNNBlock(in_channels, base, t=t)
        self.RRCNN2 = RRCNNBlock(base, base*2, t=t)
        self.RRCNN3 = RRCNNBlock(base*2, base*4, t=t)
        self.RRCNN4 = RRCNNBlock(base*4, base*8, t=t)
        self.RRCNN5 = RRCNNBlock(base*8, base*16, t=t)

        self.MaxPool = nn.MaxPool2d(2, 2)

        # Decoder
        self.Up5 = UpConv(base*16, base*8)
        self.Att5 = AttentionBlock(F_g=base*8, F_l=base*8, F_int=base*4)
        self.Up_RRCNN5 = RRCNNBlock(base*16, base*8, t=t)

        self.Up4 = UpConv(base*8, base*4)
        self.Att4 = AttentionBlock(F_g=base*4, F_l=base*4, F_int=base*2)
        self.Up_RRCNN4 = RRCNNBlock(base*8, base*4, t=t)

        self.Up3 = UpConv(base*4, base*2)
        self.Att3 = AttentionBlock(F_g=base*2, F_l=base*2, F_int=base)
        self.Up_RRCNN3 = RRCNNBlock(base*4, base*2, t=t)

        self.Up2 = UpConv(base*2, base)
        self.Att2 = AttentionBlock(F_g=base, F_l=base, F_int=base//2)
        self.Up_RRCNN2 = RRCNNBlock(base*2, base, t=t)

        self.out_conv = nn.Conv2d(base, out_channels, 1)

    def forward(self, x):
        # Encoder
        x1 = self.RRCNN1(x)
        x2 = self.RRCNN2(self.MaxPool(x1))
        x3 = self.RRCNN3(self.MaxPool(x2))
        x4 = self.RRCNN4(self.MaxPool(x3))
        x5 = self.RRCNN5(self.MaxPool(x4))

        # Decoder + Attention skips
        d5 = self.Up5(x5)
        x4a = self.Att5(g=d5, x=x4)
        d5 = self.Up_RRCNN5(torch.cat([x4a, d5], dim=1))

        d4 = self.Up4(d5)
        x3a = self.Att4(g=d4, x=x3)
        d4 = self.Up_RRCNN4(torch.cat([x3a, d4], dim=1))

        d3 = self.Up3(d4)
        x2a = self.Att3(g=d3, x=x2)
        d3 = self.Up_RRCNN3(torch.cat([x2a, d3], dim=1))

        d2 = self.Up2(d3)
        x1a = self.Att2(g=d2, x=x1)
        d2 = self.Up_RRCNN2(torch.cat([x1a, d2], dim=1))

        return self.out_conv(d2)  # logits
