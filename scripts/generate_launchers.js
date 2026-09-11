import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const startBatContent = `@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 專案管理與 RFI 追蹤系統 [SCM 2.0] - 本地伺服器啟動器

echo ========================================================
echo   專案管理與 RFI 追蹤系統 [SCM 2.0] - 本地伺服器啟動器
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [錯誤] 找不到 Node.js！請先至 https://nodejs.org 安裝 Node.js。
    pause
    exit /b 1
)

if not exist "node_modules\\" (
    echo [提示] 首次執行，正在安裝專案相依套件 npm install ...
    call npm.cmd install
    if %errorlevel% neq 0 (
        echo [錯誤] 套件安裝失敗，請檢查網路連線。
        pause
        exit /b 1
    )
    echo [成功] 相依套件安裝完成！
    echo.
)

echo [啟動中] 正在啟動 Vite 本地開發伺服器 [Port 3000] ...
echo.
echo 提示: 伺服器將在獨立視窗持續運行，若要關閉請執行 stop.bat 或在伺服器視窗按 Ctrl+C。
echo.

start "Coding-RFI-Project-Server" cmd /k "npm.cmd run dev"

ping 127.0.0.1 -n 3 >nul
start http://localhost:3000

echo [完成] 伺服器啟動程序已完成，瀏覽器已開啟！
ping 127.0.0.1 -n 3 >nul
`;

const stopBatContent = `@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 關閉專案管理與 RFI 追蹤系統伺服器

echo ========================================================
echo   專案管理與 RFI 追蹤系統 - 本地伺服器關閉程式
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$found = $false; $conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if ($conns) { foreach ($c in $conns) { $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue; if ($p) { Write-Host ('[終止程序] 正在關閉 ' + $p.ProcessName + ' (PID: ' + $p.Id + ') ...') -ForegroundColor Yellow; Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue; $found = $true } } }; if ($found) { Write-Host '[成功] 本地伺服器已安全停止 (Port 3000 已釋放)！' -ForegroundColor Green } else { Write-Host '[提示] 目前未偵測到正在運行於 Port 3000 的伺服器程序。' -ForegroundColor Cyan }"

taskkill /F /FI "WINDOWTITLE eq Coding-RFI-Project-Server*" /T >nul 2>nul

echo.
ping 127.0.0.1 -n 3 >nul
`;

const startPs1Content = `\uFEFF# 專案管理與 RFI 追蹤系統 - PowerShell 伺服器啟動腳本
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
if (-not (Test-Path "$PSScriptRoot\\node_modules")) {
    Write-Host "[提示] 首次執行，正在安裝專案相依套件 (npm install)..." -ForegroundColor Yellow
    cmd.exe /c "npm.cmd install"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[錯誤] 套件安裝失敗，請檢查網路連線。" -ForegroundColor Red
        Read-Host "按 Enter 鍵結束"
        exit 1
    }
    Write-Host "[成功] 相依套件安裝完成！\`n" -ForegroundColor Green
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
Write-Host "說明: 伺服器將在獨立終端視窗運行，若要停止請執行 stop.bat 或 stop.ps1\`n" -ForegroundColor Gray

# 啟動獨立視窗執行 Vite 伺服器
Start-Process -FilePath "cmd.exe" -ArgumentList "/k title Coding-RFI-Project-Server && npm.cmd run dev" -WorkingDirectory "$PSScriptRoot"

# 等待 2 秒伺服器準備好並開啟瀏覽器
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host "[完成] 伺服器已啟動，瀏覽器已開啟！" -ForegroundColor Green
Start-Sleep -Seconds 2
`;

const stopPs1Content = `\uFEFF# 專案管理與 RFI 追蹤系統 - PowerShell 伺服器關閉腳本
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  專案管理與 RFI 追蹤系統 - 本地伺服器關閉程式" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$conns = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$found = $false

if ($conns) {
    foreach ($c in $conns) {
        $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host ("[終止程序] 正在關閉 " + $proc.ProcessName + " (PID: " + $proc.Id + ") ...") -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            $found = $true
        }
    }
}

# 同時關閉伺服器視窗
cmd.exe /c "taskkill /F /FI ""WINDOWTITLE eq Coding-RFI-Project-Server*"" /T >nul 2>nul"

Write-Host ""
if ($found) {
    Write-Host "[成功] 本地伺服器已安全停止 (Port 3000 已釋放)！" -ForegroundColor Green
} else {
    Write-Host "[提示] 目前未偵測到正在運行於 Port 3000 的伺服器程序。" -ForegroundColor Gray
}
Write-Host ""
Start-Sleep -Seconds 2
`;

// Write files with CRLF
function writeWithCRLF(filePath, content) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, normalized, 'utf8');
}

writeWithCRLF(path.join(rootDir, 'start.bat'), startBatContent);
writeWithCRLF(path.join(rootDir, 'stop.bat'), stopBatContent);
writeWithCRLF(path.join(rootDir, 'start.ps1'), startPs1Content);
writeWithCRLF(path.join(rootDir, 'stop.ps1'), stopPs1Content);

console.log('Launchers successfully generated!');
