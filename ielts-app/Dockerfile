FROM python:3.12-alpine
WORKDIR /app
RUN mkdir -p /data
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 80
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:80", "app:app"]
