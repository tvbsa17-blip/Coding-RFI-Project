# 專案管理與 RFI 追蹤系統 - PowerShell 伺服器啟動腳本
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  專案管理與 RFI 追蹤系統 (SCM 2.0) - 本地伺服器啟動器" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 檢查 Node.js 是否安裝
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[錯誤] 找不到 Node.js！請先至 https://nodejs.org 下載安裝。" -ForegroundColor Red
    Read-Host "按 Enter 鍵結束"
    exit 1
}

# 檢查 node_modules
if (-not (Test-Path "$PSScriptRoot\node_modules")) {
    Write-Host "[提示] 首次執行，正在安裝專案相依套件 (npm install)..." -ForegroundColor Yellow
    cmd.exe /c "npm.cmd install"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[錯誤] 套件安裝失敗，請檢查網路連線。" -ForegroundColor Red
        Read-Host "按 Enter 鍵結束"
        exit 1
    }
    Write-Host "[成功] 相依套件安裝完成！`n" -ForegroundColor Green
}

# 檢查 Port 3000 是否已被佔用
$existing = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "[提示] 伺服器已在運行中 (Port 3000)！" -ForegroundColor Yellow
    Write-Host "正在開啟瀏覽器前往 http://localhost:3000 ..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
    Start-Sleep -Seconds 2
    exit 0
}

Write-Host "[啟動中] 正在啟動 Vite 本地開發伺服器..." -ForegroundColor Green
Write-Host "伺服器網址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "說明: 伺服器將在獨立終端視窗運行，若要停止請執行 stop.bat 或 stop.ps1`n" -ForegroundColor Gray

# 啟動獨立視窗執行 Vite 伺服器
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Coding-RFI-Project-Server && npm.cmd run dev" -WorkingDirectory "$PSScriptRoot"

# 等待 2 秒伺服器準備好並開啟瀏覽器
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host "[完成] 伺服器已啟動，瀏覽器已開啟！" -ForegroundColor Green
Start-Sleep -Seconds 2
