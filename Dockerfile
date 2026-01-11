FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# build-essential and libpq-dev removed as we use psycopg2-binary and slim image usually has enough for standard wheels
# If specific compilation is needed later, we can add them back.
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files during build
RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
