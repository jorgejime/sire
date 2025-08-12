@echo off
echo ==========================================================
echo USM-IA Authentication Fix Script
echo ==========================================================
echo.

echo This script will help diagnose and fix authentication issues.
echo.

echo Available options:
echo 1. Run diagnostics only (diagnose-auth.js)
echo 2. Run basic fix (fix-auth.js) 
echo 3. Run advanced fix with service role (fix-auth-service.js)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Running diagnostics...
    node diagnose-auth.js
) else if "%choice%"=="2" (
    echo Running basic authentication fix...
    node fix-auth.js
) else if "%choice%"=="3" (
    echo Running advanced fix with service role...
    echo Note: You will need your Supabase service role key
    echo You can find it in Supabase Dashboard ^> Settings ^> API
    echo.
    node fix-auth-service.js
) else (
    echo Invalid choice. Please run the script again.
)

echo.
echo Press any key to exit...
pause >nul