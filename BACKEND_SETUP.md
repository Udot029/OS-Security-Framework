# Backend Connection Fix Guide

## Issues Found & Fixed

### 1. **Inconsistent Response Format** ✅
**Problem**: Error responses from the backend didn't match the frontend's expected format.
- Frontend expected: `{ allowed, output, error, code }`
- Backend was returning: `{ error }`

**Solution**: Updated `server.py` to always return complete response with all four fields.

### 2. **Missing Fields in Error Responses** ✅
**Problem**: `bridge_manager.py` error responses were missing the `output` field.

**Solution**: Added `output: ""` to all error response objects in `bridge_manager.py`.

### 3. **Server Not Running** ⚠️
**Problem**: The Python Flask server needs to be running for the frontend to connect.

**Solution**: Created startup scripts to easily launch the backend.

---

## How to Run the Backend

### **Option 1: Using Batch File (Windows)**
1. Double-click `start-backend.bat` in the project root folder
2. The script will:
   - Check if Python is installed
   - Install Flask dependencies
   - Start the server on `http://localhost:5000`

### **Option 2: Using PowerShell**
```powershell
.\start-backend.ps1
```

### **Option 3: Manual Start**
```bash
# Navigate to the backend API folder
cd backend\api

# Install dependencies (first time only)
pip install -r ../../requirements.txt

# Run the server
python server.py
```

---

## Verify Connection

Once the server is running, you should see:
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

The frontend dashboard will now show:
- **Backend Status**: Connected ✅ (green badge)
- **Live Simulation**: Shows allow/deny decisions in real-time
- **API Requests**: Successfully evaluate access control policies

---

## API Endpoints

### `POST /check-access`
Evaluates access control decisions based on security policy.

**Request**:
```json
{
  "user": "Uday",
  "file": "file1",
  "action": "read",
  "policy": "bell"
}
```

**Response**:
```json
{
  "allowed": true,
  "output": "allowed",
  "error": "",
  "code": 0
}
```

### `GET /status`
Check if backend is running.

**Response**:
```json
{
  "status": "ok",
  "message": "Backend connected"
}
```

---

## Troubleshooting

### Port 5000 Already in Use
If port 5000 is already occupied:
1. Edit `backend/api/server.py`
2. Change `app.run(debug=True)` to `app.run(debug=True, port=5001)`
3. Update `frontend/services/api_service.ts`: Change `API_BASE` to `"http://localhost:5001"`

### Python Not Found
- Install Python from https://www.python.org
- Make sure to check "Add Python to PATH" during installation
- Restart your terminal/command prompt after installation

### Flask Import Error
```bash
pip install Flask>=2.0
```

### CORS Issues
The server includes CORS headers to allow frontend requests. If you still see CORS errors, check:
- Browser console for detailed error messages
- That the frontend is pointing to the correct `API_BASE` URL

---

## Files Modified
- `backend/api/server.py` - Fixed response format consistency
- `backend/api/bridge_manager.py` - Added missing `output` field to error responses
- `start-backend.bat` - New startup script
- `start-backend.ps1` - New PowerShell startup script
