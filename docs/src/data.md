
@page data Data
What data will be loaded is specified inside JSON file `data_info.json` that should be placed at the location pointed to by variable `dataInfoFpth` in `config.json`. In the `data_info.json` there is flag `active` for each data pack that determines whether this data pack will be loaded or not.

Three data pack types are supported:
- `VIRET_based` - classification data from neural networks
- `Google_based` - classification done by Google Vision AI 
- `W2VV_based` - data for W2VV++ model

@section data_viret_based Data of type 'VIRET_based'
TBU

### Example configuration in `data_info.json`
@code{.json}
{
    "active": true,
    "ID": "NasNet2019",
    "name": "NasNet2019",
    "description": "VIRET_based",
    "model_options": "model=mult-sum-max;transform=linear_01;model_operations=mult-sum;model_ignore_treshold=0.0",
    "vocabulary": {
        "ID": "VIRET_WordNet2019",
        "description": "With ~1300 phrases.",
        "keyword_synsets_fpth": "./imageset_V3C1_20k/VIRET/keyword_classes.txt"
    },
    "data": {
        "target_dataset": "V3C1_20k",
        "presoftmax_scorings_fpth": "./imageset_V3C1_20k/VIRET/NasNet2019/Studenti_NasNetLarge.pre-softmax",
        "softmax_scorings_fpth": "./imageset_V3C1_20k/VIRET/NasNet2019/Studenti_NasNetLarge.softmax",
        "deep_features_fpth": "./imageset_V3C1_20k/VIRET/NasNet2019/Studenti_NasNetLarge.deep-features"
    }
}
@endcode

@section data_google_based Data of type 'Google_based'
TBU

### Example configuration in `data_info.json`
@code{.json}
{
    "active": false,
    "ID": "GoogleVisionAi_Sep2019",
    "name": "GoogleVisionAi_Sep2019",
    "description": "Google_based",
    "model_options": "model=mult-sum-max;transform=linear_01;model_operations=mult-sum;model_ignore_treshold=0.0",
    "vocabulary": {
        "ID": "Google_AI_2019",
        "description": "With ~5000 phrases.",
        "keyword_synsets_fpth": "./imageset_V3C1_20k/Google/keyword_classes.google_vision_ai.txt"
    },
    "data": {
        "target_dataset": "V3C1_20k",
        "presoftmax_scorings_fpth": "./imageset_V3C1_20k/Google/extracted_sep_2019/scorings.google_vision_ai.bin"
    }
}
@endcode

@section data_w2vv_based Data of type 'W2VV_based'
TBU

@code{.json}
{
    "active": false,
    "ID": "W2VV_BoW_Dec2019",
    "name": "W2VV_BoW_Dec2019",
    "description": "W2VV_based",
    "model_options": "model=w2vv_bow_plain;model_sub_PCA_mean=true;",
    "vocabulary": {
        "ID": "native_language",
        "description": "Supported ~12k words.",
        "keyword_synsets_fpth": "./imageset_V3C1_20k/W2VV/W2VV_BoW_Dec2019/keyword_classes.bow2019.txt",
        "keyword_features_fpth": "./imageset_V3C1_20k/W2VV/W2VV_BoW_Dec2019/txt_weight-11147x2048floats.bin",
        "keyword_features_dim": 2048,
        "keyword_features_data_offset": 0,
        "keyword_bias_vec_fpth": "./imageset_V3C1_20k/W2VV/W2VV_BoW_Dec2019/txt_bias-2048floats.bin",
        "keyword_bias_vec_dim": 2048,
        "keyword_bias_vec_data_offset": 0,
        "keyword_PCA_mat_fpth": "./imageset_V3C1_20k/W2VV/W2VV_BoW_Dec2019/keyword_PCA_matrix.resnext152_resnext101.w2vv_bow.bin",
        "keyword_PCA_mat_dim": 2048,
        "keyword_PCA_mat_data_offset": 0,
        "keyword_PCA_mean_vec_fpth": "./imageset_V3C1_20k/W2VV/W2VV_BoW_Dec2019/keyword_PCA_mean.resnext152_resnext101.w2vv_bow.bin",
        "keyword_PCA_mean_vec_dim": 2048,
        "keyword_PCA_mean_vec_offset": 0
    },
    "data": {
        "target_dataset": "V3C1_20k",
        "deep_features_fpth": "./imageset_V3C1_20k/W2VV/W2VV_BoW_Dec2019/frame_features.resnext152_resnext101.w2vv_bow.bin",
        "deep_features_dim": 2048,
        "deep_features_data_offset": 0
    }
}
@endcode