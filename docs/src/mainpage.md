ImageRankerApp aka KISSEval {#mainpage}
======

KISSEval is a web-based application that allows the user to explore, evaluate and test different text-based models with different settings based on provided datasets. It is also used for collecting data from real users through this web UI.

KISSEval as a whole consists of this NodeJS server that serves mostly as GUI and the evaluation library ([ImageRanker](https://gitlab.mff.cuni.cz/mejzlikf/imageranker)) written in C++ that is used by nodeJS as a native addon. In addition it also needs some data in specific formats to work with. 

# Online running version
We also provide an [online running version](http://herkules.ms.mff.cuni.cz:8080) (with 4 data packs) that is available after authentication. For authentication credentials, please use credentials found inside the README.md file in the official [repository](https://gitlab.mff.cuni.cz/mejzlikf/imagerankerapp). If you don't have access to the MFF GitLab, please email me at <frankmejzlik@gmail.com>.

# Getting started & building
Please see \ref getting_started and \ref build pages.

# Remarks
- It is NOT the final product, but rather prototype we use for our tasks.
- As of now, all requests are processed sequentially (and are blocking the main thread until they are resolved), this guarantees that no parallel requests are made to the evaluator library (which is NOT thread-safe).
    - This needs to change if this app (ever) goes public.
    - Not priority since usually one (or very few) user uses this app at the same time.
- It is NOT recommended to run this app publically for wide public users!
    - To avoid problems, it is recommended to have this app exposed only to people you know.
    - It is not by any means secure, polished or bug-free.


# License
Copyright 2020 Frantisek Mejzlik <frankmejzlik@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.