FROM	python:latest

ENV	PYTHONDONTWRITEBYTECODE 1
ENV	PYTHONUNBUFFERED 1

WORKDIR	/app

RUN  apt update -y
COPY	requirements.txt .
COPY	core core
COPY	runserver.sh .
RUN	pip install --no-cache-dir -r requirements.txt
RUN	chmod +x runserver.sh

EXPOSE	8000
CMD	["bash", "runserver.sh"]
