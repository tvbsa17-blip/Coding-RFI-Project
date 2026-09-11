# 專案管理與 RFI 追蹤系統 - PowerShell 伺服器關閉腳本
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
