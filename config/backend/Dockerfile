FROM	python:latest

ENV	PYTHONDONTWRITEBYTECODE 1
ENV	PYTHONUNBUFFERED 1

WORKDIR	/main

RUN	apt update -y && apt upgrade -y
COPY	requirements.txt .
COPY	runserver.sh .

RUN	pip install --no-cache-dir -r requirements.txt
RUN	chmod +x runserver.sh

EXPOSE	8000
CMD	["./runserver.sh"]
