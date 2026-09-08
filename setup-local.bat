@echo off
echo Setting up Fourie InternKatta for Local Development...
echo.

echo Installing Backend Dependencies...
cd backend
if not exist node_modules (
    npm install
) else (
    echo Backend dependencies already installed.
)
cd ..

echo.
echo Installing Frontend Dependencies...
cd frontend
if not exist node_modules (
    npm install
) else (
    echo Frontend dependencies already installed.
)
cd ..

echo.
echo Setting up Environment Files...

REM Check if backend .env exists
cd backend
if not exist .env (
    if exist env.example (
        copy env.example .env
        echo Created backend/.env from template
    ) else (
        echo Warning: env.example not found in backend directory
    )
) else (
    echo Backend .env already exists
)
cd ..

REM Check if frontend .env exists
cd frontend
if not exist .env (
    if exist env.example (
        copy env.example .env
        echo Created frontend/.env from template
    ) else (
        echo Warning: env.example not found in frontend directory
    )
) else (
    echo Frontend .env already exists
)
cd ..

echo.
echo Setup Complete!
echo.
echo Next Steps:
echo 1. Edit backend/.env with your local configuration
echo 2. Edit frontend/.env with your local configuration
echo 3. Make sure MongoDB is running
echo 4. Run start-local-dev.bat to start both servers
echo.
echo Press any key to exit...
pause > nul
