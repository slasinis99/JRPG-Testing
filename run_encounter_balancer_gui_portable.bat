@echo off
setlocal EnableExtensions

REM JRPG Encounter Balancer - portable/flash-drive friendly launcher
REM This file assumes it is in the same folder as encounter_balancer.py.
REM It first looks for Python on the flash drive, then falls back to Windows Python/py.

cd /d "%~dp0"

set "SCRIPT=%~dp0encounter_balancer.py"
set "PYEXE="

REM 1) Prefer a portable Python copied next to this BAT file.
REM Recommended layouts:
REM   EncounterBalancer\python\python.exe
REM   EncounterBalancer\PortablePython\python.exe
REM   EncounterBalancer\WinPython\python-*-amd64\python.exe

if exist "%~dp0python\python.exe" set "PYEXE=%~dp0python\python.exe"
if not defined PYEXE if exist "%~dp0PortablePython\python.exe" set "PYEXE=%~dp0PortablePython\python.exe"
if not defined PYEXE if exist "%~dp0.venv\Scripts\python.exe" set "PYEXE=%~dp0.venv\Scripts\python.exe"

REM 2) Try common WinPython nested folders.
if not defined PYEXE (
    for /d %%D in ("%~dp0WinPython\python-*-amd64") do (
        if exist "%%~fD\python.exe" set "PYEXE=%%~fD\python.exe"
    )
)
if not defined PYEXE (
    for /d %%D in ("%~dp0WinPython\WPy*\python-*") do (
        if exist "%%~fD\python.exe" set "PYEXE=%%~fD\python.exe"
    )
)

REM 3) Fall back to the Python Launcher or PATH Python if available.
if not defined PYEXE (
    where py >nul 2>nul
    if not errorlevel 1 set "PYEXE=py -3"
)
if not defined PYEXE (
    where python >nul 2>nul
    if not errorlevel 1 set "PYEXE=python"
)

if not exist "%SCRIPT%" (
    echo Could not find encounter_balancer.py next to this launcher.
    echo Expected: "%SCRIPT%"
    echo.
    pause
    exit /b 1
)

if not defined PYEXE (
    echo Python was not found.
    echo.
    echo Because you are running from a flash drive, put a portable Python next to this launcher.
    echo Recommended folder layout:
    echo.
    echo   EncounterBalancer\
    echo     encounter_balancer.py
    echo     run_encounter_balancer_gui_portable.bat
    echo     python\
    echo       python.exe
    echo.
    echo Use a full portable Python distribution that includes Tkinter, such as WinPython.
    echo The official embeddable Python ZIP may not include Tkinter, which this GUI needs.
    echo.
    pause
    exit /b 1
)

echo Using Python: %PYEXE%
echo Starting JRPG Encounter Balancer GUI...
echo.
%PYEXE% "%SCRIPT%" gui

if errorlevel 1 (
    echo.
    echo The application closed with an error.
    echo If the error mentions tkinter, use a full portable Python distribution with Tkinter included.
    echo.
)

pause
