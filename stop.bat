@echo off
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
