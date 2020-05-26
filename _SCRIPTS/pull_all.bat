@echo off

echo Pulling this repo with all subrepos

set BASE_DIR=.

set FRONTEND_REMOTE=origin
set FRONTEND_BRANCH=dev
set BACKEND_REMOTE=origin
set BACKEND_BRANCH=dev

cd %BASE_DIR%\..

git checkout -- .
git checkout %FRONTEND_BRANCH%
git pull %FRONTEND_REMOTE% %FRONTEND_BRANCH%

cd .\cppsrc\ImageRankerWrapper\ImageRanker\
git checkout -- .
git checkout %BACKEND_BRANCH%
git pull %BACKEND_REMOTE% %BACKEND_BRANCH%

echo Done!
pause