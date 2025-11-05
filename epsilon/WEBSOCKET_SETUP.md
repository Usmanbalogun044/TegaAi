# WebSocket Backend Setup for PDF Processing

## What This Does

This implementation creates a Django Channels WebSocket server that:
1. Receives messages and files from the frontend
2. Extracts text from PDF files using PyPDF2
3. Forwards the extracted text + message to your external AI engine
4. Returns the AI's response to the frontend

## Installation Steps

### 1. Install Required Packages

```bash
pip install channels daphne PyPDF2 aiohttp
```

Or install from requirements file:
```bash
pip install -r requirements_websocket.txt
```

### 2. Verify Configuration

The following files have been created/updated:
- ✅ `miva/consumers.py` - WebSocket consumer with PDF processing
- ✅ `miva/routing.py` - WebSocket URL routing
- ✅ `epsilon/asgi.py` - ASGI application configuration
- ✅ `epsilon/settings.py` - Added channels, daphne to INSTALLED_APPS
- ✅ `assets/app.js` - Updated to use local WebSocket

### 3. Run the Server

Instead of `python manage.py runserver`, use:

```bash
python manage.py runserver
```

Or for production:
```bash
daphne -b 0.0.0.0 -p 8000 epsilon.asgi:application
```

### 4. Test the Setup

1. Start the Django server
2. Login to your application
3. Go to the Chat page
4. Upload a PDF file
5. Check the console (F12) for debug messages
6. The AI should now respond with content from the PDF

## How It Works

### Frontend → Backend Flow

1. **User uploads PDF**
   - File converted to base64
   - Sent via WebSocket to `ws://localhost:8000/ws/chat/`

2. **Django Consumer receives file**
   ```python
   {
     "message": "what is inside this pdf?",
     "type": "chat",
     "unique_id": "user-uuid",
     "file": {
       "name": "document.pdf",
       "type": "application/pdf",
       "content": "base64-string"
     }
   }
   ```

3. **PDF Text Extraction**
   - Base64 decoded to bytes
   - PyPDF2 extracts text from each page
   - Text combined with user message

4. **Forward to External AI**
   - Combined message sent to `wss://epsilonmivaaiengine.onrender.com/ws/chat`
   - Format:
   ```json
   {
     "message": "what is inside this pdf?\n\n--- File Content: document.pdf ---\n[extracted text]\n--- End of File ---",
     "type": "chat",
     "unique_id": "user-uuid"
   }
   ```

5. **AI Response**
   - External AI processes the extracted text
   - Sends response back
   - Consumer forwards response to frontend

6. **Frontend displays response**
   - User sees AI's analysis of the PDF

## Troubleshooting

### WebSocket Won't Connect

Check the console for:
```
WebSocket connection established
Connected to: ws://localhost:8000/ws/chat/
```

If you see connection errors:
- Make sure you started the server with `daphne` or Django dev server
- Check that channels is in INSTALLED_APPS
- Verify ASGI_APPLICATION is set in settings.py

### PDF Not Processing

Check server console for:
```
Warning: PyPDF2 not installed. PDF support disabled.
```

Install PyPDF2:
```bash
pip install PyPDF2
```

### External AI Not Responding

The consumer connects to: `wss://epsilonmivaaiengine.onrender.com/ws/chat`

If this is down or has changed:
1. Update the URL in `miva/consumers.py` line 27
2. Restart the Django server

## Architecture Diagram

```
Frontend (app.js)
    ↓ (WebSocket)
Local Django Server (consumers.py)
    ↓ (Extract PDF text)
    ↓ (Forward via WebSocket)
External AI Engine (epsilonmivaaiengine.onrender.com)
    ↓ (AI Response)
Local Django Server
    ↓ (Forward response)
Frontend (Display to user)
```

## File Structure

```
epsilon/
├── miva/
│   ├── consumers.py          # NEW: WebSocket consumer
│   ├── routing.py            # NEW: WebSocket routes
│   └── ...
├── epsilon/
│   ├── asgi.py               # UPDATED: ASGI config
│   ├── settings.py           # UPDATED: Added channels
│   └── ...
├── assets/
│   └── app.js                # UPDATED: Use local WebSocket
└── requirements_websocket.txt # NEW: Package requirements
```

## Next Steps

1. **Test with sample PDF**: Upload a PDF and verify extraction works
2. **Adjust AI prompt**: Modify the message format in `consumers.py` if needed
3. **Add error handling**: Enhance error messages for users
4. **Production deployment**: Use daphne or uvicorn for production
5. **Add Redis**: For production, use Redis channel layer instead of InMemory

## Production Deployment

For production with Redis:

```python
# settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

Install redis:
```bash
pip install channels-redis
```

Run with daphne:
```bash
daphne -u /tmp/daphne.sock epsilon.asgi:application
```

Or with uvicorn:
```bash
uvicorn epsilon.asgi:application --host 0.0.0.0 --port 8000
```
