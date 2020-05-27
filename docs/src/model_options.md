
@page model_options Model options
Model options are sent to the library using a string that contains semicolon-separated key-value pairs. Keys and values in this string are defined as stated in `./config/models_info.json` file where is specified what options will be offered to the user in 'Model tester' page. Its hierarchical structure determines conditional logic what options are available while some parent value is selected.

Example of such string can be: `"model=mult-sum-max;transform=linear_01;model_operations=mult-sum;model_ignore_treshold=0.0"`. This means that we want to use Mult/Sum/Max model with linear transformation where outer operation is multiplication and inner is addition. Ignore threshold is to 0, which means that all values will be considered and none will be ignored.

On the first level, these options are placed in three supported data pack types - `VIRET_based`, `Google_based` and `W2VV_based`.

## Example configuration for W2VV model
@code{.json}
 "W2VV_based": {
        "options": [
            {
                "key": "model",
                "name": "Model",
                "description": "",
                "input_type": "enum",
                "values": [
                    {
                        "active": true,
                        "ID": "w2vv_bow_plain", // This is the ID of this model
                        "name": "BoW VBS2020",
                        "description": "We embedd text query into the space and find the nearest frames.",
                        "options": [
                                // It has no specific options 
                        ]
                    }
                ]
            }
        ]
    }
@endcode

If you wish to extend options or add some new models, please use existing options as reference.
