# KISSEval - Keyword Interactive Search System Evaluator
KISSEval is a web-based application that allows the user to explore, evaluate and test different text-based models with different settings based on provided datasets. It is also used for collecting data from real users through this web UI.

KISSEval as a whole consists of this Node.js server that serves mostly as GUI and the evaluation library ([KISSEval Core](https://github.com/FrankMejzlik/kisseval-core)) written in C++ that is used by Node.js as a native addon. In addition, it also needs some data in specific formats to work with. 

## Prerequisites
- [GIT](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) v (v12 or higher)
- C++ compiler complying with the C++17 standard
    - Tested with [MSVC v141, v142](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and [GCC 8.4](https://gcc.gnu.org/)


## Build
Now that you have Node.js and C++ compiler ready it is time to build the application.

```
# Clone (with submodules) from the online repository
git clone --recurse-submodules https://github.com/FrankMejzlik/kisseval-coreapp && cd kisseval

# Install all dependency packages
npm install

# Start the application
npm run start
```

Once the application is initialized you can go to `http://localhost:8080` to start using the app.

Congratulations, now you should have KISSEval running with tiny ITEC dataset in action. 

By defalt access credentials are "admin" for both username and password and password for switching to eval mode is "eval". This can be changed in `./config/credentials.json`.
