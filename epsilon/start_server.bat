@echo off
echo ========================================
echo  PDF-Enabled WebSocket Server Setup
echo ========================================
echo.
echo This script will:
echo 1. Stop any running Django servers
echo 2. Run migrations
echo 3. Start the server with WebSocket support
echo.
pause

echo.
echo Step 1: Running migrations...
python manage.py migrate

echo.
echo Step 2: Starting Django development server...
echo The server will now support:
echo  - WebSocket connections at ws://localhost:8000/ws/chat/
echo  - PDF file upload and text extraction
echo  - Forwarding to external AI engine
echo.
echo Open your browser to: http://127.0.0.1:8000
echo.
python manage.py runserver
