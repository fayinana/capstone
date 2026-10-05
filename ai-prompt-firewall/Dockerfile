FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PIP_DISABLE_PIP_VERSION_CHECK=1

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY config /app/config
COPY src /app/src
COPY scripts /app/scripts
COPY .streamlit /app/.streamlit

# ONNX is copied from the repo (already on disk). Startup never downloads weights.
EXPOSE 8080 8501

HEALTHCHECK --interval=5s --timeout=3s --start-period=3s --retries=8 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/health', timeout=2)" || exit 1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]
