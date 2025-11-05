# File Upload Implementation for Chat

## Overview
Updated the chat page to accept PDF and TXT file uploads, converting them to base64 before sending via WebSocket.

## Changes Made

### 1. Chat Template (`templates/chat.html`)
- Added file input element (hidden)
- Added file upload button (📎 icon)
- Added file preview area showing selected file with remove option
- Updated cache versions to v16

### 2. JavaScript (`assets/app.js`)
- **File Upload Button Handler**: Opens file picker when clicked
- **File Validation**: 
  - Only accepts `.pdf` and `.txt` files
  - Maximum file size: 10MB
  - Shows alert if validation fails
- **File Preview**: Displays selected filename with remove button
- **Base64 Conversion**: Converts file to base64 using FileReader API
- **WebSocket Integration**: Sends message with file data in JSON format

### 3. CSS (`assets/styles.css`)
- Added `.file-upload-btn` styles (green gradient, paperclip icon)
- Added `.file-preview` styles (blue background with file info)
- Added `.file-remove-btn` styles (red remove button)
- Positioned file upload button before voice input button

## WebSocket Message Format

### Without File
```json
{
  "message": "User's message text",
  "type": "chat",
  "unique_id": "user-uuid-here"
}
```

### With File
```json
{
  "message": "User's message text",
  "type": "chat",
  "unique_id": "user-uuid-here",
  "file": {
    "name": "document.pdf",
    "type": "application/pdf",
    "content": "base64-encoded-file-content-here"
  }
}
```

## How It Works

1. **User clicks file upload button (📎)**
   - Opens file picker dialog
   - User selects PDF or TXT file

2. **File Validation**
   - Checks file type (must be PDF or TXT)
   - Checks file size (must be < 10MB)
   - Shows error alert if validation fails

3. **File Preview**
   - Displays filename in preview area
   - Shows remove button (×) to clear selection

4. **Sending Message**
   - User types message (optional) and clicks send
   - File is converted to base64 using FileReader
   - Message + base64 file sent via WebSocket
   - File preview is cleared after sending

5. **Backend Processing**
   - WebSocket receives JSON with message and file object
   - Backend can decode base64 to get original file content
   - Send file content to AI model for processing
   - AI model returns response based on file content

## File Size Limit Rationale
- 10MB limit balances:
  - Most PDFs and text documents are under 10MB
  - Prevents memory issues with base64 encoding
  - WebSocket payload size limitations
  - Server processing time

## User Experience
1. Click paperclip icon to attach file
2. Select PDF or TXT file
3. See filename appear in blue preview box
4. Type optional message
5. Click send
6. File automatically clears after sending

## Error Handling
- Invalid file type: Alert shown, file cleared
- File too large: Alert shown, file cleared
- WebSocket disconnected: Error message shown to user
- File read error: Console warning, graceful fallback

## Future Enhancements
1. Support for more file types (DOCX, images)
2. Drag-and-drop file upload
3. Multiple file uploads
4. File upload progress indicator
5. Thumbnail preview for images
6. File compression before sending
