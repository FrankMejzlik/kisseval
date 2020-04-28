{
    "targets": [{
        "target_name": "image_ranker",
        "sources": [
            "main.cpp",
            "ImageRanker/ImageRanker/src/ImageRanker.cpp",
            "ImageRanker/ImageRanker/src/KeywordsContainer.cpp",
            "ImageRanker/ImageRanker/src/Database.cpp",
            "ImageRanker/ImageRanker/src/DataManager.cpp",
            "ImageRanker/ImageRanker/src/GridTest.cpp",
            "ImageRanker/ImageRanker/src/FileParser.cpp",
            "ImageRanker/ImageRanker/src/SimUser.cpp",
            "ImageRanker/ImageRanker/src/data_packs/VIRET_based/ViretDataPack.cpp",
            "ImageRanker/ImageRanker/src/data_packs/W2VV_based/W2vvDataPack.cpp",
            "ImageRanker/ImageRanker/src/data_packs/Google_based/GoogleVisionDataPack.cpp",
            "ImageRanker/ImageRanker/src/datasets/SelFramesDataset.cpp",
            "ImageRanker/ImageRanker/src/ranking_models/BaseClassificationModel.cpp",
            "ImageRanker/ImageRanker/src/ranking_models/MultSumMaxModel.cpp",
            "ImageRanker/ImageRanker/src/ranking_models/VectorSpaceModel.cpp",
            "ImageRanker/ImageRanker/src/ranking_models/BooleanModel.cpp",
            "ImageRanker/ImageRanker/src/ranking_models/BaseW2vvModel.cpp",
            "ImageRanker/ImageRanker/src/ranking_models/PlainBowModel.cpp",
            "ImageRanker/ImageRanker/src/transformations/BaseVectorTransform.cpp",
            "ImageRanker/ImageRanker/src/transformations/NoTransform.cpp",
            "ImageRanker/ImageRanker/src/transformations/TransformationLinear.cpp",
            "ImageRanker/ImageRanker/src/transformations/TransformationSoftmax.cpp",
            "ImageRankerWrapper.cpp",
        ],

        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")",
            "ImageRanker/ImageRanker/src/",
            "ImageRanker/ImageRanker/src/datasets/"
            "ImageRanker/ImageRanker/src/data_packs/",
            "ImageRanker/ImageRanker/src/transformations/",
            "ImageRanker/ImageRanker/src/ranking_models/",
            "ImageRanker/ImageRanker/external/MariaDB_Connector_C_64-bit/include/",
            "ImageRanker/ImageRanker/external/json"
        ],
        'libraries': [],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        'defines': [ "NAPI_CPP_EXCEPTIONS", "HAS_NAPI_HEADERS", "LOG_CALLS" ],
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
                        "HAS_NAPI_HEADERS",
                        "LOG_CALLS"
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
                                    "../../../cppsrc/ImageRankerWrapper/ImageRanker/ImageRanker/external/MariaDB_Connector_C_64-bit/lib/"
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
                                    "../../../cppsrc/ImageRankerWrapper/ImageRanker/ImageRanker/external/MariaDB_Connector_C_64-bit/lib/"
                                ]
                            }
                        }
                    }
                }
            }]
        ]
    }]
}