# ImageRankerApp (KISSEval)
KISSEval is a web-based application that allows the user to explore, evaluate and test different text-based models with different settings based on provided datasets. It is also used for collecting data from real users through this web UI.

KISSEval as a whole consists of this Node.js server that serves mostly as GUI and the evaluation library ([ImageRanker](https://gitlab.mff.cuni.cz/mejzlikf/imageranker)) written in C++ that is used by Node.js as a native addon. In addition, it also needs some data in specific formats to work with. 

## Online running version
The full version with all the data and extracted data packs is available at [http://herkules.ms.mff.cuni.cz:8080](http://herkules.ms.mff.cuni.cz:8080).

### Access credentials
Username: **mff**

Password: **2nKfmnVWVrQrNExP**

### Evaluator mode
Password: **Xe5yHH9NdxLXyELt**


## Prerequisites
- [GIT](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) v (v12 or higher)
- C++ compiler complying with the C++17 standard
    - Tested with [MSVC v141, v142](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and [GCC 8.4](https://gcc.gnu.org/)


## Build
Now that you have Node.js and C++ compiler ready alongside with data files correctly set up in the `data_config.json` file it is time to building the application.

```
# Clone (with submodules) from the online repository
git clone --recurse-submodules https://gitlab.mff.cuni.cz/mejzlikf/imagerankerapp

# OR

# Copy directory `ImageRankerApp` provided in the thesis attachments to desired location

# Enter the directory
cd ImageRankerApp

# Install all dependency packages
npm install

# Build `ImageRanker` as native C++ addon using the default system C++ compiler
npm run build

# Start the application
npm run start
```

Once the application is initialized you can go to `http://localhost:8080` to start using the app.

Congratulations, now you should have KISSEval running with tiny ITEC dataset in action. 