@ECHO OFF

SET ORIG_DIR=%cd%

cd ..
call prettier --write --config .\.prettierrc .\routes\**\*.js
cd %ORIG_DIR%

pause