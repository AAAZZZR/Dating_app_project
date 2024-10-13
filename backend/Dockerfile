FROM python:3.11-slim

WORKDIR /backend

COPY requirements.txt requirements.txt


RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000 5001


RUN apt-get update && apt-get install -y supervisor


COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]