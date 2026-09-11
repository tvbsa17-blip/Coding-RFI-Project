@echo off
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

if not exist "node_modules\" (
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
