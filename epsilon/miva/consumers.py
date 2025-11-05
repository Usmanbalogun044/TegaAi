"""
WebSocket consumer for handling chat messages with file uploads
"""
import json
import base64
import asyncio
import aiohttp
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User

try:
    import PyPDF2
    from io import BytesIO
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False
    print("Warning: PyPDF2 not installed. PDF support disabled.")


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer that handles chat messages and file uploads.
    Forwards messages to external AI engine at epsilonmivaaiengine.onrender.com
    """
    
    async def connect(self):
        """Accept WebSocket connection"""
        await self.accept()
        self.ai_ws = None
        self.ai_session = None
        
        # Connect to external AI engine
        try:
            self.ai_session = aiohttp.ClientSession()
            self.ai_ws = await self.ai_session.ws_connect(
                'wss://epsilonmivaaiengine.onrender.com/ws/chat'
            )
            print("Connected to AI engine WebSocket")
        except Exception as e:
            print(f"Failed to connect to AI engine: {e}")
    
    async def disconnect(self, close_code):
        """Clean up on disconnect"""
        if self.ai_ws:
            await self.ai_ws.close()
        if self.ai_session:
            await self.ai_session.close()
    
    async def receive(self, text_data):
        """
        Receive message from WebSocket.
        Process files if present, then forward to AI engine.
        """
        try:
            data = json.loads(text_data)
            message = data.get('message', '')
            unique_id = data.get('unique_id', None)
            file_data = data.get('file', None)
            
            # Process file if present
            if file_data:
                processed_message = await self.process_file(file_data, message)
                
                # Send processed message to AI engine
                if self.ai_ws:
                    await self.ai_ws.send_json({
                        'message': processed_message,
                        'type': 'chat',
                        'unique_id': unique_id
                    })
                    
                    # Wait for AI response
                    response = await self.ai_ws.receive_json()
                    
                    # Forward AI response to client
                    await self.send(text_data=json.dumps(response))
                else:
                    await self.send(text_data=json.dumps({
                        'error': 'AI engine not connected'
                    }))
            else:
                # No file, just forward message to AI engine
                if self.ai_ws:
                    await self.ai_ws.send_json(data)
                    
                    # Wait for AI response
                    response = await self.ai_ws.receive_json()
                    
                    # Forward AI response to client
                    await self.send(text_data=json.dumps(response))
                else:
                    await self.send(text_data=json.dumps({
                        'error': 'AI engine not connected'
                    }))
                    
        except Exception as e:
            print(f"Error in receive: {e}")
            await self.send(text_data=json.dumps({
                'error': f'Error processing message: {str(e)}'
            }))
    
    async def process_file(self, file_data, user_message):
        """
        Process uploaded file and extract text content.
        Returns a combined message with file content.
        """
        file_name = file_data.get('name', 'unknown')
        file_type = file_data.get('type', '')
        base64_content = file_data.get('content', '')
        
        try:
            # Decode base64 content
            file_bytes = base64.b64decode(base64_content)
            
            # Process based on file type
            if file_type == 'application/pdf':
                text_content = await self.extract_pdf_text(file_bytes, file_name)
            elif file_type == 'text/plain':
                text_content = file_bytes.decode('utf-8', errors='ignore')
            else:
                text_content = f"[Unsupported file type: {file_type}]"
            
            # Combine user message with file content
            combined_message = f"{user_message}\n\n--- File Content: {file_name} ---\n{text_content}\n--- End of File ---"
            
            return combined_message
            
        except Exception as e:
            print(f"Error processing file {file_name}: {e}")
            return f"{user_message}\n\n[Error processing file: {str(e)}]"
    
    async def extract_pdf_text(self, file_bytes, file_name):
        """
        Extract text from PDF file using PyPDF2.
        """
        if not PDF_SUPPORT:
            return "[PDF processing not available - PyPDF2 not installed]"
        
        try:
            # Run PDF extraction in thread pool to avoid blocking
            return await asyncio.to_thread(self._extract_pdf_sync, file_bytes)
        except Exception as e:
            print(f"Error extracting PDF text from {file_name}: {e}")
            return f"[Error extracting PDF text: {str(e)}]"
    
    def _extract_pdf_sync(self, file_bytes):
        """
        Synchronous PDF text extraction (runs in thread pool).
        """
        pdf_file = BytesIO(file_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page_num, page in enumerate(pdf_reader.pages):
            try:
                page_text = page.extract_text()
                text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
            except Exception as e:
                text += f"\n--- Page {page_num + 1}: Error extracting text ---\n"
        
        return text.strip()
