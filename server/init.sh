#!/bin/bash

set -e

echo "Starting SSH ..."
service ssh start

echo "Starting python app"
# run it on the right host!
gunicorn -w 4 src.wsgi --bind=0.0.0.0 --timeout 600
