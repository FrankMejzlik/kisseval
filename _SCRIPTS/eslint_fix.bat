@ECHO OFF

SET ORIG_DIR=%cd%

cd ..
call eslint --fix --ext .js .
cd %ORIG_DIR%


pause