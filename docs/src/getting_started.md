@page getting_started Getting started

To get started and have KISSEvall running in no time, please read short \ref overview and then follow instructions on the \ref build page.

@section overview Overview
This is a nodeJS application that serves mainly as a GUI for the evaluator library written in C++. This native code is compiled into native NodeJS addon and is used as a JS class for most of the tasks user need. 

The main goal of this project is to provide a user-friendly layer between the user and the library so the user can comfortably use it.

In order to run this app, you also need to build a native C++ evaluation library (see \ref build) and some data packs in specific formats required by the `ImageRanker` library as described on the \ref data page.

The project folder structure looks like this: 
@code
ImageRankerApp/ 
├── bin/ 
│   └── www # This si entry point that nodeJS launches
├── config/  
│   ├── config.json         // NodeJS app config
│   ├── credentials.json    // Config file holding info that should not be shared
│   └── ...
├── cppsrc/ImageRankerWrapper/
│   ├── ImageRanker/                // This is root of the evaluation library repository
│   ├── binding.gyp                 // Config file with instruction how to build C++ evaluation library
│   ├── ImageRankerWrapper.h        // Header file for native library wrapping
│   ├── ImageRankerWrapper.cpp      // Implementation of C++ bindings for nodeJS
│   └── main.cpp                    // Entry point of this native addon
├── docs/                   // Documetation directory
├── public/                 // Directory containing public assets like images, CSSs, client-side scripts etc. (these are accessible from the outside!)
├── routes/                 // Main front-end logic directory where each page has it's own router with it's logic
└── views/                          // Client-side EJS templates
@endcode

@section fut_work Future work
- Make it asynchronous with parallel requests to the library (so main thread isn't blocked with every request).
    - Not (yet) needed since usually just very few users are using it at the same time and sequential processing is sufficient.
- Use proper modern front-end frameworks like React or Vue.js
- Make it sufficient for public
    - No debug info on errors.
    - Make it more secure.

