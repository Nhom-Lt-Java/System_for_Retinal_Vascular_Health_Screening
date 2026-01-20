FROM python:3.11-slim
WORKDIR /app

# --- BƯỚC QUAN TRỌNG: Cài thư viện hệ thống cho OpenCV ---
# Sửa lỗi "ImportError: libxcb.so.1" và các lỗi đồ họa khác
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libxcb1 \
    libx11-xcb1 \
    libxcb-render0 \
    libxcb-shape0 \
    libxcb-xfixes0 \
    && rm -rf /var/lib/apt/lists/*
# ---------------------------------------------------------

COPY requirements.txt /app/requirements.txt

# Tăng thời gian chờ lên 100.000 giây để không bị đứt mạng
RUN pip install --default-timeout=100000 --no-cache-dir -r /app/requirements.txt

COPY . /app

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]