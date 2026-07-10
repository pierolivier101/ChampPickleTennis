@echo off
cd /d "c:\Users\Thinkpad T14\Documents\TENNIS PKBL CHAMPIONSHIP"
echo Pushing project to GitHub...
"C:\Program Files\Git\cmd\git.exe" push -u origin master --force
echo.
echo Process complete. If you saw a login popup, please authorize it.
pause
