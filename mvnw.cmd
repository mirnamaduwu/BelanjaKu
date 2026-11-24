@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0.mvn\wrapper\mvnw.ps1" %*
set "WRAPPER_EXIT_CODE=%ERRORLEVEL%"
endlocal & exit /b %WRAPPER_EXIT_CODE%
