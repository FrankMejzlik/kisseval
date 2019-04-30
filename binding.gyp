{
    "targets": [{
        "target_name": "image_ranker",
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [
            "cppsrc/main.cpp",
            "cppsrc/ImageRankerWrapper/ImageRanker/ImageRanker/src/ImageRanker.cpp",
            "cppsrc/ImageRankerWrapper/ImageRanker/ImageRanker/src/KeywordsContainer.cpp",
            "cppsrc/ImageRankerWrapper/ImageRanker/ImageRanker/src/Database.cpp",
            "cppsrc/ImageRankerWrapper/ImageRankerWrapper.cpp",
        ],

        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")",
            "cppsrc/ImageRankerWrapper/",
            "cppsrc/ImageRankerWrapper/ImageRanker/ImageRanker/src/",
            "cppsrc/ImageRankerWrapper/ImageRanker/ImageRanker/external/MariaDB_Connector_C_64-bit/include/"
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
        "conditions": [
            [
                "OS=='linux'",
                {
                    "defines": [
                    ],
                    "architecture": "i386",

                    "link_settings": {
                        "libraries": [
                            "-lmariadb", "-L/usr/lib64/"
                        ],
                        "configurations": {
                            "Debug": {
                                "xcode_settings": {
                                    "OTHER_LDFLAGS": [
                                        
                                    ]
                                }
                            },
                            "Release": {
                                "xcode_settings": {
                                    "OTHER_LDFLAGS": [
                                        
                                    ]
                                }
                            }
                        }
                    }
                }
            ],
            [
            "OS=='win'",
            {
                "defines": [
                    "_HAS_EXCEPTIONS=1"
                ],
                "link_settings": {
                    "libraries": [
                        "-lmariadbclient.lib",
                        "-lWs2_32.lib",
                        "-lShlwapi.lib"
                    ]
                },
                "configurations": {
                    "Debug": {
                        "msvs_settings": {
                            "VCLinkerTool": {
                                "AdditionalLibraryDirectories": [
                                    "../cppsrc/ImageRankerWrapper/ImageRanker/ImageRankerexternal/MariaDB_Connector_C_64-bit/lib/"
                                ],
                                "AdditionalOptions": [
                                    "/MP /EHsc"
                                ]
                            }
                        }
                    },
                    "Release": {
                        "msvs_settings": {
                            "VCCLCompilerTool": {
                                "RuntimeLibrary": 0,
                                "Optimization": 3,
                                "FavorSizeOrSpeed": 1,
                                "InlineFunctionExpansion": 2,
                                "WholeProgramOptimization": "true",
                                "OmitFramePointers": "true",
                                "EnableFunctionLevelLinking": "true",
                                "EnableIntrinsicFunctions": "true",
                                "RuntimeTypeInfo": "false",
                                "ExceptionHandling": "0",
                                "AdditionalOptions": [
                                    "/MP /EHsc"
                                ]
                            },
                            "VCLinkerTool": {
                                "LinkTimeCodeGeneration": 1,
                                "OptimizeReferences": 2,
                                "EnableCOMDATFolding": 2,
                                "LinkIncremental": 1,
                                "AdditionalLibraryDirectories": [
                                    "../cppsrc/ImageRankerWrapper/ImageRanker/ImageRanker/external/MariaDB_Connector_C_64-bit/lib/"
                                ]
                            }
                        }
                    }
                }
            }]
        ]
    }]
}