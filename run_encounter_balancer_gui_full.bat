@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Flash-drive friendly launcher for the GUI-enabled encounter balancer.
REM Put this .bat next to encounter_balancer_gui_full.py.

set "APP_DIR=%~dp0"
set "SCRIPT=%APP_DIR%encounter_balancer_gui_full.py"
set "PYTHON_EXE="

if not exist "%SCRIPT%" (
    echo ERROR: Could not find encounter_balancer_gui_full.py next to this launcher.
    echo Expected: %SCRIPT%
    pause
    exit /b 1
)

REM Prefer portable Python folders next to this launcher.
if exist "%APP_DIR%python\python.exe" set "PYTHON_EXE=%APP_DIR%python\python.exe"
if not defined PYTHON_EXE if exist "%APP_DIR%PortablePython\python.exe" set "PYTHON_EXE=%APP_DIR%PortablePython\python.exe"
if not defined PYTHON_EXE if exist "%APP_DIR%.venv\Scripts\python.exe" set "PYTHON_EXE=%APP_DIR%.venv\Scripts\python.exe"

REM Look for WinPython-style folders if present.
if not defined PYTHON_EXE (
    for /r "%APP_DIR%" %%P in (python.exe) do (
        echo %%~fP | findstr /i "WPy WinPython" >nul
        if not errorlevel 1 if not defined PYTHON_EXE set "PYTHON_EXE=%%~fP"
    )
)

REM Fallback to py launcher or PATH python.
if not defined PYTHON_EXE (
    where py >nul 2>nul
    if not errorlevel 1 set "PYTHON_EXE=py -3"
)
if not defined PYTHON_EXE (
    where python >nul 2>nul
    if not errorlevel 1 set "PYTHON_EXE=python"
)

if not defined PYTHON_EXE (
    echo ERROR: Python was not found.
    echo.
    echo For a flash drive setup, place a full portable Python with Tkinter here:
    echo   %APP_DIR%python\python.exe
    echo.
    echo WinPython is recommended because it includes Tkinter.
    pause
    exit /b 1
)

echo Using Python: %PYTHON_EXE%
echo Starting JRPG Encounter Balancer GUI...
echo.

%PYTHON_EXE% "%SCRIPT%" gui
set "EXITCODE=%ERRORLEVEL%"

if not "%EXITCODE%"=="0" (
    echo.
    echo The application closed with an error.
    echo If the error mentions tkinter, use a full portable Python distribution with Tkinter included.
    echo.
    pause
)

exit /b %EXITCODE%
