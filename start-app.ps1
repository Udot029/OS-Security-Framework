$ErrorActionPreference = "Stop"

function Test-PortOpen {
    param(
        [string]$HostName,
        [int]$Port
    )

    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $connection = $client.BeginConnect($HostName, $Port, $null, $null)
        if (-not $connection.AsyncWaitHandle.WaitOne(800)) {
            return $false
        }

        $client.EndConnect($connection)
        return $true
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

function Import-EnvFile {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
            return
        }

        $name, $value = $line.Split("=", 2)
        $name = $name.Trim()
        $value = $value.Trim().Trim('"').Trim("'")
        if ($name) {
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
Import-EnvFile -Path (Join-Path $root ".env")

Write-Host ""
Write-Host "OS Security Framework" -ForegroundColor Cyan
Write-Host "Checking local servers..." -ForegroundColor Cyan
Write-Host ""

if ($env:GEMINI_API_KEY) {
    Write-Host "[OK] Gemini chatbot API configured" -ForegroundColor Green
} else {
    Write-Host "[INFO] GEMINI_API_KEY not set. Chatbot will use local fallback replies." -ForegroundColor DarkGray
}

if (Test-PortOpen -HostName "127.0.0.1" -Port 5000) {
    Write-Host "[OK] Backend already running on http://127.0.0.1:5000" -ForegroundColor Green
} else {
    Write-Host "[START] Backend on http://127.0.0.1:5000" -ForegroundColor Yellow
    Start-Process -FilePath "python" -ArgumentList @("backend/api/server.py") -WorkingDirectory $root -WindowStyle Hidden
    Start-Sleep -Seconds 2

    if (Test-PortOpen -HostName "127.0.0.1" -Port 5000) {
        Write-Host "[OK] Backend started" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Backend did not start. Run: python backend/api/server.py" -ForegroundColor Red
        exit 1
    }
}

if (Test-PortOpen -HostName "127.0.0.1" -Port 8080) {
    Write-Host "[OK] Frontend already running on http://127.0.0.1:8080" -ForegroundColor Green
} else {
    Write-Host "[START] Frontend on http://127.0.0.1:8080" -ForegroundColor Yellow
    Start-Process -FilePath "python" -ArgumentList @("-m", "http.server", "8080", "--directory", "frontend") -WorkingDirectory $root -WindowStyle Hidden
    Start-Sleep -Seconds 2

    if (Test-PortOpen -HostName "127.0.0.1" -Port 8080) {
        Write-Host "[OK] Frontend started" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Frontend did not start. Run: npm run start:frontend" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Open: http://127.0.0.1:8080" -ForegroundColor Cyan
Write-Host "Keep this terminal if you want the status message; the servers are running in the background." -ForegroundColor DarkGray
