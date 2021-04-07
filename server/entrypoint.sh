#!/bin/bash
# Prepare log files and start outputting logs to stdout
export LANG=C.UTF-8
export LC_ALL=C.UTF-8
export DJANGO_SETTINGS_MODULE=src.settings
python manage.py migrate
daphne src.asgi:application --port 8000 --bind 0.0.0.0 -v 0