@echo off
echo Starting Fourie InternKatta Local Development Environment...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev:local"
cd ..

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm run dev:local"
cd ..

echo.
echo Both servers are starting up...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this launcher...
pause > nul
