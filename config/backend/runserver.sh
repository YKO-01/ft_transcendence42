#!/bin/bash

sleep 3

python3 core/manage.py makemigrations
python3 core/manage.py migrate
python3 core/manage.py runserver '0.0.0.0:8000'
