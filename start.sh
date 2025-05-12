#!/usr/bin/env bash
# exit on error
set -o errexit

cd backend
python -m uvicorn main:app --host 0.0.0.0 --port $PORT 