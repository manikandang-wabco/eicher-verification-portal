@echo off 
@taskkill /im node.exe /F
echo Calling npm start

start cmd /k CALL D:\xampp\htdocs\DCS\eicher_portal\server\call_node.bat 6666

start cmd /k CALL D:\xampp\htdocs\DCS\eicher_portal\call_npm.bat 5555


