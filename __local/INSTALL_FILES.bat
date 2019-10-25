@echo off

set PATH1=..\config
set PATH2=..\cppsrc\ImageRankerWrapper\ImageRanker\ImageRanker\src\

echo Copying files to %PATH1%

copy .\files\config.json %PATH1%
copy .\files\credentials.json %PATH1%
copy .\files\settings_ranker.json %PATH1%

echo Copying files to %PATH2%
copy .\files\config.h %PATH2%
copy .\files\credentials.h %PATH2%

echo Done!

pause