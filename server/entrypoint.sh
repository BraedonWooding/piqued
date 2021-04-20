#!/bin/bash
# Prepare log files and start outputting logs to stdout
export LANG="en_US.UTF-8"
export LC_ALL=C.UTF-8
export DJANGO_SETTINGS_MODULE=src.settings

gunicorn src.asgi:application --bind 0.0.0.0:8000 -w 1 -k uvicorn.workers.UvicornWorker
# daphne src.asgi:application --port 8000 --bind 0.0.0.0 -v 0