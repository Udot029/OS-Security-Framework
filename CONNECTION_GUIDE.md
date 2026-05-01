# Stable Backend-Frontend Connection Guide

## ✅ What Was Fixed

### Backend Improvements:
1. **Proper CORS Configuration** - Using `Flask-CORS` library for complete CORS support
2. **Keep-Alive Headers** - Server sends `Connection: keep-alive` to maintain persistent connections
3. **Threading Enabled** - Server can handle multiple concurrent requests without blocking
4. **Debug Mode Disabled** - Prevents automatic server reloads that interrupt connections
5. **Proper Server Configuration** - Host set to `0.0.0.0` to accept connections from anywhere

### Frontend Improvements:
1. **Automatic Retry Logic** - Failed requests automatically retry up to 3 times
2. **Request Timeout** - 10-second timeout prevents hanging requests
3. **Health Check Endpoint** - Uses dedicated `checkBackendHealth()` function
4. **Periodic Status Monitoring** - Backend status checked every 5 seconds automatically
5. **Error Recovery** - Connection status updated immediately on success or failure

## 🚀 How to Run (Guaranteed Connection)

### Step 1: Start the Backend Server

**Option A: Double-click (Easiest)**
```
Double-click: start-backend.bat
```

**Option B: PowerShell**
```powershell
.\start-backend.ps1
```

**Option C: Manual**
```bash
cd backend\api
python server.py
```

You should see:
```
Running on http://0.0.0.0:5000
WARNING: This is a development server. Do not use it in production.
```

### Step 2: Access the Frontend

1. Open `frontend/index.html` in your browser, OR
2. Run a local web server:
   ```bash
   # In the project root folder:
   python -m http.server 8000
   # Then visit: http://localhost:8000/frontend/index.html
   ```

### Step 3: Verify Connection

Look for the **Backend Status Badge** in the dashboard:
- 🟢 **Green "Connected"** - Everything working
- 🟠 **Yellow "Checking..."** - Initial check in progress
- 🔴 **Red "Disconnected"** - Server not running

## 🔄 How the Connection Works

```
Frontend Dashboard
    ↓ (Every 5 seconds)
Health Check Request → http://localhost:5000/status
    ↓ (Returns immediately)
Backend Server
    ↓ (If healthy, 200 OK response)
Update Status Badge to "Connected" ✅
```

## 📝 API Endpoints

### `/status` (GET)
- **Purpose**: Health check
- **Response**: `{ "status": "ok", "message": "Backend connected" }`
- **Frequency**: Checked every 5 seconds automatically
- **Timeout**: 2 retries, 500ms between retries

### `/check-access` (POST)
- **Purpose**: Evaluate access control policy
- **Payload**: `{ "user": "alice", "file": "file1", "action": "read", "policy": "bell" }`
- **Response**: `{ "allowed": true, "output": "...", "error": "", "code": 0 }`
- **Retries**: 3 attempts with 500ms delay between retries
- **Timeout**: 10 seconds per request

## 🛠️ Troubleshooting

### "Backend: Disconnected" Badge
1. Check that `start-backend.bat` is running
2. Verify Python is installed: `python --version`
3. Check for errors in the server terminal
4. Make sure port 5000 is not blocked by firewall

### Port 5000 Already in Use
```bash
# Find what's using port 5000:
netstat -ano | findstr :5000

# Kill the process (replace PID):
taskkill /PID <PID> /F

# Or use different port in server.py:
app.run(host="0.0.0.0", port=5001, ...)
```

### Dependencies Not Installing
```bash
# Make sure you're in the project root:
cd c:\Users\udot\OS-Security-Framework

# Install directly:
pip install Flask>=2.0 Flask-CORS>=4.0
```

### "ModuleNotFoundError: No module named 'flask_cors'"
```bash
# Install Flask-CORS:
pip install Flask-CORS
```

## 📊 Connection Monitoring

The frontend automatically monitors connection health:

- **Initial Check**: On page load
- **Periodic Check**: Every 5 seconds (background)
- **Post-Request Check**: After each API call
- **Immediate Feedback**: Status badge updates in real-time

## 🔐 Security Note

The backend accepts requests from all origins (`"*"`). For production:

```python
CORS(app, resources={
    r"/*": {
        "origins": ["http://yourdomain.com"],  # Restrict to specific origin
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
    }
})
```

## ✨ Features Ensuring Stability

| Feature | Purpose | Status |
|---------|---------|--------|
| Keep-Alive Headers | Persistent TCP connections | ✅ Enabled |
| Thread Pool | Handle concurrent requests | ✅ Enabled |
| Retry Logic (3x) | Handle temporary failures | ✅ Enabled |
| Request Timeout | Prevent hanging | ✅ 10 seconds |
| Health Monitoring | Detect disconnections | ✅ Every 5s |
| Error Handling | Graceful degradation | ✅ Enabled |

## 🎯 Expected Behavior

1. **Start Backend** → Server logs show "Running on..."
2. **Load Frontend** → Dashboard loads with status "Checking..."
3. **5-10 seconds** → Status changes to "Connected" (green)
4. **Select Options** → Live simulation updates in real-time
5. **Click Evaluate** → Request sent with automatic retry on failure
6. **Continuous** → Health check every 5 seconds keeps connection alive

## 📞 Need Help?

If connection issues persist:
1. Check terminal output from `start-backend.bat` for errors
2. Run `ping localhost` to verify network
3. Check Windows Firewall isn't blocking port 5000
4. Try using PowerShell instead of Command Prompt
5. Restart both frontend and backend

---

**Version**: 1.0 (May 2026)
**Last Updated**: Backend and frontend with stable connection improvements
