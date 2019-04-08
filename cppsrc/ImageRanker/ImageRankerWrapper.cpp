#include "ImageRankerWrapper.h"

Napi::FunctionReference ImageRankerWrapper::constructor;

Napi::Object ImageRankerWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "ImageRankerWrapper", {
    InstanceMethod("GetNearKeywords", &ImageRankerWrapper::GetNearKeywords),
    InstanceMethod("GetRandomImage", &ImageRankerWrapper::GetRandomImage),
    InstanceMethod("SubmitUserQueriesWithResults", &ImageRankerWrapper::SubmitUserQueriesWithResults),
    InstanceMethod("GetRelevantImages", &ImageRankerWrapper::GetRelevantImages)
  });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("ImageRankerWrapper", func);
 
  return exports;
}

ImageRankerWrapper::ImageRankerWrapper(const Napi::CallbackInfo& info) : Napi::ObjectWrap<ImageRankerWrapper>(info)  {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  
  if (length != 9) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }


  Napi::String imagesPath = info[0].As<Napi::String>();
  Napi::String probabilityVectorFilepath = info[1].As<Napi::String>();
  Napi::String deepFeaturesFilepath = info[2].As<Napi::String>();
  Napi::String keywordClassesFilepath = info[3].As<Napi::String>();
  Napi::String imagesDirList = info[4].As<Napi::String>();
  Napi::Number columnIndexOfFilename = info[5].As<Napi::Number>();
  Napi::Number imagesDirListFileLineLength = info[6].As<Napi::Number>();
  Napi::Number numRows = info[7].As<Napi::Number>();
  Napi::Number idOffset = info[8].As<Napi::Number>();

  std::cout << imagesPath.Utf8Value() << std::endl;
  std::cout << probabilityVectorFilepath.Utf8Value() << std::endl;
  std::cout << deepFeaturesFilepath.Utf8Value() << std::endl;
  std::cout << keywordClassesFilepath.Utf8Value() << std::endl;
  std::cout << imagesDirList.Utf8Value() << std::endl;

  std::cout << columnIndexOfFilename.Int64Value() << std::endl;
  std::cout << imagesDirListFileLineLength.Int64Value() << std::endl;
  std::cout << numRows.Int64Value() << std::endl;
  std::cout << idOffset.Int64Value() << std::endl;


  this->actualClass_ = new ImageRanker(
    imagesPath.Utf8Value(),
    probabilityVectorFilepath.Utf8Value(),
    deepFeaturesFilepath.Utf8Value(),
    keywordClassesFilepath.Utf8Value(),
    imagesDirList.Utf8Value(),
    columnIndexOfFilename.Int64Value(),
    imagesDirListFileLineLength.Int64Value(),
    numRows.Int64Value(),
    idOffset.Int64Value()
  );
}


Napi::Value ImageRankerWrapper::SubmitUserQueriesWithResults(const Napi::CallbackInfo& info)
{
  // Parameters: SessionID, ImageID, string query
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 4)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::SubmitUserQueriesWithResults)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C
  Napi::String sessionId = info[0].As<Napi::String>();
  Napi::Number imageId = info[1].As<Napi::Number>();
  Napi::String stringQuery = info[2].As<Napi::String>();
  Napi::Number queryType = info[3].As<Napi::Number>();

  // Initialize input structure
  std::vector<ImageRanker::GameSessionInputQuery> methodInput;
  methodInput.push_back(ImageRanker::GameSessionInputQuery(sessionId.Utf8Value(), imageId.Int64Value(), stringQuery.Utf8Value()));
  size_t queryOrigin = queryType.Int64Value();

  // Call native method
  // RETURN: std::tuple<size_t, std::string, std::vector<std::string>, std::vector<std::pair<std::string, float>>>
  std::vector<ImageRanker::GameSessionQueryResult> queryResults{ this->actualClass_->SubmitUserQueriesWithResults(methodInput, static_cast<ImageRanker::QueryOrigin>(queryOrigin)) };

  // Construct NAPI return object 
  napi_value resultArray;
  napi_create_array(env, &resultArray);

  // Process all results
  size_t i = 0ULL;
  for (auto&& gameResult : queryResults)
  {
    // Initialize GameSessionResult obejct
    napi_value gameSessionResult;
    napi_create_object(env, &gameSessionResult);

    // Set "sessionId"
    {
      napi_value key;
      napi_create_string_utf8(env, "sessionId", 9, &key);
      napi_value value;
      napi_create_string_utf8(env, std::get<0>(gameResult).data(), std::get<0>(gameResult).size(), &value);

      napi_set_property(env, gameSessionResult, key, value);
    }

    // Set "imageId"
    {
      std::string keyString{"imageFilename"};
      napi_value key;
      napi_create_string_utf8(env, keyString.data(), keyString.size(), &key);
      napi_value value;
      napi_create_string_utf8(env, std::get<1>(gameResult).data(),std::get<1>(gameResult).size(), &value);

      napi_set_property(env, gameSessionResult, key, value);
    }

    // Set "keywords" array
    {
      napi_value keywordsArray;
      napi_create_array(env, &keywordsArray);

      size_t j = 0ULL;
      for (auto&& keyword : std::get<2>(gameResult))
      {
        napi_value value;
        napi_create_string_utf8(env, keyword.data(), keyword.size(), &value);

        napi_set_element(env, keywordsArray, j, value);

        ++j;
      }

      napi_value key;
      napi_create_string_utf8(env, "keywords", 8, &key);

      napi_set_property(env, gameSessionResult, key, keywordsArray);
    }
      
    // Set "netProbabilites" array
    {
      napi_value netProbabilitesArray;
      napi_create_array(env, &netProbabilitesArray);

      size_t j = 0ULL;
      for (auto&& keyword : std::get<3>(gameResult))
      {
        napi_value netProbObject;
        napi_create_object(env, &netProbObject);

        // Set "netKeyword"
        {
          napi_value key;
          napi_create_string_utf8(env, "netKeyword", 10, &key);
          napi_value value;
          napi_create_string_utf8(env, keyword.first.data(), keyword.first.size(), &value);

          napi_set_property(env, netProbObject, key, value);
        }

        // Set "netProbability"
        {
          napi_value key;
          napi_create_string_utf8(env, "netProbability", 14, &key);
          napi_value value;
          napi_create_double(env, keyword.second, &value);

          napi_set_property(env, netProbObject, key, value);
        }


        // Insert into net probability array
        napi_set_element(env, netProbabilitesArray, j, netProbObject);

        ++j;
      }
      napi_value key;
      napi_create_string_utf8(env, "netProbabilites", 15, &key);

      napi_set_property(env, gameSessionResult, key, netProbabilitesArray);
    }

    // Set this value to result array
    napi_set_element(env, resultArray, i, gameSessionResult);
    
    ++i;
  }

  /* RETURN OBJECT:
    [
      {
        "sessionId": "1h2rr3e4",
        "imageFilename": "file2.jpg",
        "keywords": [ "k1", "k2" ,... ]
        "netProbabilites": [
            {
              "netKeyword": 1222,
              "netProbability": 0.444,
            },
            ...
        ]

      }
      ...
    ]
  */
  return Napi::Object(env, resultArray);
}

Napi::Value ImageRankerWrapper::GetRandomImage(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 0)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  // Call native method
  ImageRanker::ImageReference image{ this->actualClass_->GetRandomImage() };

  // Construct NAPI return object 
  napi_value result;
  napi_create_object(env, &result);

  // Set "imageId"
  {
    napi_value imageIdKey;
    napi_create_string_utf8(env, "imageId", 7, &imageIdKey);
    napi_value imageId;
    napi_create_uint32(env, std::get<0>(image), &imageId);

    napi_set_property(env, result, imageIdKey, imageId);
  }

  // Set "filename"
  {
    napi_value filenameKey;
    napi_create_string_utf8(env, "filename", 8, &filenameKey);
    napi_value filename;
    napi_create_string_utf8(env, std::get<1>(image).data(), std::get<1>(image).size(), &filename);

    napi_set_property(env, result, filenameKey, filename);
  }

  return Napi::Object(env, result);
}


Napi::Value ImageRankerWrapper::GetNearKeywords(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();

  if (length != 1) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }
  
  Napi::String prefix = info[0].As<Napi::String>();

  // Get suggested keywords
  std::vector< std::tuple<size_t, std::string, std::string> > keywordData = this->actualClass_->GetNearKeywords(prefix);

  // Final return structure
  napi_value result;
  napi_create_array(env, &result);

  size_t i = 0ULL;
  // Iterate through all results
  for (auto&& keyword : keywordData) 
  {
      // Temp array structure
      napi_value tempArray;
      napi_create_array(env, &tempArray);

      napi_value wordnetId;
      napi_value word;
      napi_value description;

      napi_create_uint32(env, std::get<0>(keyword), &wordnetId);
      napi_create_string_utf8(env, std::get<1>(keyword).data(), std::get<1>(keyword).size(), &word);
      napi_create_string_utf8(env, std::get<2>(keyword).data(), std::get<2>(keyword).size(), &description);

      napi_set_element(env, tempArray, 0, wordnetId);
      napi_set_element(env, tempArray, 1, word);
      napi_set_element(env, tempArray, 2, description);

      napi_set_element(env, result, i, tempArray);

      ++i;
  }

  return Napi::Object(env, result);
}



Napi::Value ImageRankerWrapper::GetRelevantImages(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 1)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C args
  Napi::String query = info[0].As<Napi::String>();

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetRelevantImages' with args:" << std::endl;
  std::cout << query.Utf8Value() << std::endl;
  std::cout << "===================" << std::endl;

#endif

  // Call native method: Get vector of relevant images
  std::vector<ImageRanker::ImageReference> images{ this->actualClass_->GetRelevantImages(query.Utf8Value()) };

  napi_value result;
  napi_create_array(env, &result);
  {

    size_t i{0ULL};
    for (auto&& image : images)
    {

      // Construct NAPI return object 
      napi_value imageItem;
      napi_create_object(env, &imageItem);

      // Set "imageId"
      {
        napi_value imageIdKey;
        napi_create_string_utf8(env, "imageId", 7, &imageIdKey);
        napi_value imageId;
        napi_create_uint32(env, std::get<0>(image), &imageId);

        napi_set_property(env, imageItem, imageIdKey, imageId);
      }

      // Set "filename"
      {
        napi_value filenameKey;
        napi_create_string_utf8(env, "filename", 8, &filenameKey);
        napi_value filename;
        napi_create_string_utf8(env, std::get<1>(image).data(), std::get<1>(image).size(), &filename);

        napi_set_property(env, imageItem, filenameKey, filename);
      }

      napi_set_element(env, result, i, imageItem);

      ++i;
    }
  }

  return Napi::Object(env, result);
}

