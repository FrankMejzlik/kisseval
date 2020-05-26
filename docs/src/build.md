@page build Building KISSEval

@section build_prereq Prerequisites
- [GIT](https://git-scm.com/)
- [nodeJS](https://nodejs.org/en/) v (v12 or higher)
- C++ compiler complying with the C++17 standard
    - Tested with [MSVC v141, v142](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and [GCC 8.4](https://gcc.gnu.org/)




@section build_n_run Build & run
Now that you have nodeJS and C++ compiler ready alongside with data files correctly set up in the `data_config.json` file it is time to building the application.

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

Congratulations, now you should have KISSEval running with tiny ITEC dataset in action (also with small ammount of data collected inside the database so you can see `Model Tested`). 

@section prep_data Using custom data packs
In order to run KISSEval on top of different data packs, you have to prepare than and setup `data_config.json` accordingly. Please follow instructions how to prepare the data on the \ref data page.