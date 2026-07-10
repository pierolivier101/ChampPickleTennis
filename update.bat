@echo off
cd /d "c:\Users\Thinkpad T14\Documents\TENNIS PKBL CHAMPIONSHIP"
echo Preparing updates...
"C:\Program Files\Git\cmd\git.exe" add .

set /p msg="Enter a brief message describing your changes (or press Enter for default): "
if "%msg%"=="" set msg="Update application features"

"C:\Program Files\Git\cmd\git.exe" commit -m "%msg%"
echo.
echo Pushing changes to GitHub...
"C:\Program Files\Git\cmd\git.exe" push origin master

echo.
echo Upload complete! If Vercel is connected, your site is updating in the background.
pause
