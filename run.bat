@echo off
cd /d "c:\Users\Thinkpad T14\Documents\TENNIS PKBL CHAMPIONSHIP"
echo Starting local tournament server...
start http://localhost:5173
cmd /k "npm run dev"
