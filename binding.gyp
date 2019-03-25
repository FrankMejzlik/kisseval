{
    "targets": [{
        "target_name": "image_ranker",
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [
            "cppsrc/main.cpp",
            "cppsrc/ImageRanker/src/ImageRanker.cpp",
            "cppsrc/ImageRanker/ImageRankerWrapper.cpp",
        ],

        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        'libraries': [],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
        "cflags_cc": [
            "-std=c++17"
        ],   
        'msvs_settings': {
            'VCCLCompilerTool': {
            'AdditionalOptions': [ '-std:c++17', ],
            },
        },
    }]
}