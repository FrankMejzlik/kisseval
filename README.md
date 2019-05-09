# How to bild

You need nodeJS installed.

This project uses [ImageRanker](https://gitlab.com/devWeSp/ImageRanker) repository as submodule, therefore you probably need to do `git clone --recurse-submodules` to clone also submodules.

After recursive clone, just run `npm install` this will download and install all packages that are used.
Then run `npm run build` this will compile native C++ code into something.node addon so nodeJS can use it - this compilation is done by GYP module. There is .gyp file where are all settings for compiling - paths, settings etc.
There are settings for VS and Linux.