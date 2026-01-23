@echo off
cd /d C:\dev\derp\backend
python -m uvicorn main:app --reload --port 8000
