@echo off
echo Starting Odin's Almanac Server...
cd /d "C:\Users\huffs\Odins-Almanac-site\server"
echo Current directory: %CD%
echo.
echo Installing dependencies if needed...
"C:\nvm\v20.9.0\npm.cmd" install --silent
echo.
echo Starting Node.js server...
"C:\nvm\v20.9.0\node.exe" index.js
pause