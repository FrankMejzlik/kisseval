#include "ImageRankerWrapper.h"

#include <stdexcept>

Napi::FunctionReference ImageRankerWrapper::constructor;

Napi::Object ImageRankerWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "ImageRankerWrapper", {
    
    InstanceMethod("Initialize", &ImageRankerWrapper::Initialize),
    InstanceMethod("GetGridTestProgress", &ImageRankerWrapper::GetGridTestProgress),
    InstanceMethod("RunGridTest", &ImageRankerWrapper::RunGridTest),
    InstanceMethod("GetNearKeywords", &ImageRankerWrapper::GetNearKeywords),
    InstanceMethod("GetRandomImage", &ImageRankerWrapper::GetRandomImage),
    InstanceMethod("GetRandomImageSequence", &ImageRankerWrapper::GetRandomImageSequence),
    InstanceMethod("SubmitUserQueriesWithResults", &ImageRankerWrapper::SubmitUserQueriesWithResults),
    InstanceMethod("GetRelevantImagesPlainQuery", &ImageRankerWrapper::GetRelevantImagesPlainQuery),
    InstanceMethod("TrecvidGetRelevantShots", &ImageRankerWrapper::TrecvidGetRelevantShots),
    InstanceMethod("GetImageDataById", &ImageRankerWrapper::GetImageDataById),
    InstanceMethod("GetImageKeywordsForInteractiveSearch", &ImageRankerWrapper::GetImageKeywordsForInteractiveSearch),
    InstanceMethod("GetKeywordByVectorIndex", &ImageRankerWrapper::GetKeywordByVectorIndex),
    InstanceMethod("RunModelTest", &ImageRankerWrapper::RunModelTest),
    InstanceMethod("GetStatisticsUserKeywordAccuracy", &ImageRankerWrapper::GetStatisticsUserKeywordAccuracy),
    InstanceMethod("GetRelevantImagesWithSuggestedPlainQuery", &ImageRankerWrapper::GetRelevantImagesWithSuggestedPlainQuery),
    InstanceMethod("SubmitInteractiveSearchSubmit", &ImageRankerWrapper::SubmitInteractiveSearchSubmit)
    
    

    
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
  
  if (length != 8) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

  // Convert arguments
  std::string imagesPath = info[0].As<Napi::String>().Utf8Value();
  std::string rawNetRankingFilepath = info[1].As<Napi::String>().Utf8Value();
  std::string keywordClassesFilepath = info[2].As<Napi::String>().Utf8Value();
  std::string softmaxFilepath = info[3].As<Napi::String>().Utf8Value();
  std::string deepFeaturesFilepath = info[4].As<Napi::String>().Utf8Value();
  std::string imageToIdMapFilepath = info[5].As<Napi::String>().Utf8Value();
  size_t idOffset = info[6].As<Napi::Number>().Uint32Value();
  ImageRanker::Mode mode = static_cast<ImageRanker::Mode>(info[7].As<Napi::Number>().Uint32Value());

#if LOG_CALLS

  std::cout << "===================================" << std::endl;
  std::cout << "CALL: ImageRanker() with arguments:" << std::endl;
  std::cout << "\t imagesPath = " << imagesPath << std::endl;
  std::cout << "\t rawNetRankingFilepath = " << rawNetRankingFilepath << std::endl;
  std::cout << "\t keywordClassesFilepath = " << keywordClassesFilepath << std::endl;
  std::cout << "\t softmaxFilepath = " << softmaxFilepath << std::endl;
  std::cout << "\t deepFeaturesFilepath = " << deepFeaturesFilepath << std::endl;
  std::cout << "\t imageToIdMapFilepath = " << imageToIdMapFilepath << std::endl;
  std::cout << "\t idOffset = " << idOffset << std::endl;
  std::cout << "\t mode = " << (size_t)mode << std::endl;
  std::cout << "===================================" << std::endl;

#endif


  try {
    this->actualClass_ = new ImageRanker(
      imagesPath,
      rawNetRankingFilepath,
      keywordClassesFilepath,
      softmaxFilepath,
      deepFeaturesFilepath,
      imageToIdMapFilepath,
      idOffset,
      mode
    );
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }
}

Napi::Value ImageRankerWrapper::Initialize(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();

  if (length != 0) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

#if LOG_CALLS

  std::cout << "===================================" << std::endl;
  std::cout << "CALL: ImageRanker::Initialize() with arguments:" << std::endl;
  std::cout << "===================================" << std::endl;

#endif

  try {
    this->actualClass_->Initialize();
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }
  

  napi_value result;  
  napi_create_uint32(env, 0ULL, &result);

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::GetGridTestProgress(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();

  if (length != 0) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

#if LOG_CALLS

  std::cout << "===================================" << std::endl;
  std::cout << "CALL: ImageRanker::GetGridTestProgress() with arguments:" << std::endl;
  std::cout << "===================================" << std::endl;

#endif

  auto compTotalPair = this->actualClass_->GetGridTestProgress();
  

  napi_value result;
  napi_create_object(env, &result);

  // "numCompletedTests": 244
  {
    std::string keyString{"numCompletedTests"s};
    napi_value key;
    napi_create_string_utf8(env, keyString.data(), keyString.size(), &key);

    napi_value value;
    napi_create_uint32(env, compTotalPair.first, &value);

    napi_set_property(env, result, key, value);
  }

  // "numTests": 500
  {
    std::string keyString{ "numTests"s };
    napi_value key;
    napi_create_string_utf8(env, keyString.data(), keyString.size(), &key);

    napi_value value;
    napi_create_uint32(env, compTotalPair.second, &value);

    napi_set_property(env, result, key, value);
  }

  return Napi::Object(env, result);
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
  std::vector<GameSessionInputQuery> methodInput;
  methodInput.push_back(GameSessionInputQuery(sessionId.Utf8Value(), imageId.Int64Value(), stringQuery.Utf8Value()));
  size_t queryOrigin = queryType.Int64Value();

  // Call native method
  std::vector<GameSessionQueryResult> queryResults;
  try {
    // RETURN: std::tuple<size_t, std::string, std::vector<std::string>, std::vector<std::pair<std::string, float>>>
    queryResults = this->actualClass_->SubmitUserQueriesWithResults(methodInput, static_cast<QueryOriginId>(queryOrigin));
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }


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
  ImageReference image;
  try {
    image =  this->actualClass_->GetRandomImage();
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

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

Napi::Value ImageRankerWrapper::GetRandomImageSequence(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 1)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  size_t seqLength = info[0].As<Napi::Number>().Uint32Value();  

  // Call native method
  std::vector<ImageReference> images;
  try {
    images =  this->actualClass_->GetRandomImageSequence(seqLength);
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Construct NAPI return object 
  napi_value totalResult;
  napi_create_array(env, &totalResult);

  size_t i{0ULL};
  for (auto&& image : images)
  {
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

    // Set this value to result array
    napi_set_element(env, totalResult, i, result);
    
    ++i;
  }

  return Napi::Object(env, totalResult);
}


Napi::Value ImageRankerWrapper::RunGridTest(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 1)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::RunGridTest)").ThrowAsJavaScriptException();
  }

  std::vector<TestSettings> gridTestSettings;


  Napi::Array gridTestSettingsArray = info[0].As<Napi::Array>();
  for (size_t i = 0; i < gridTestSettingsArray.Length(); i++)
  {
    std::tuple<NetDataTransformation, RankingModelId, QueryOriginId, std::vector<std::string>, std::vector<std::string>> metaResult;

    Napi::Value v = gridTestSettingsArray[i];

    Napi::Array innerArr = v.As<Napi::Array>();
    for (size_t j = 0; j < innerArr.Length(); j++)
    {

      // Aggregation
      if (j == 0)
      {
        if (v.IsNumber())
        {
          NetDataTransformation agg = static_cast<NetDataTransformation>((uint32_t)v.As<Napi::Number>().Uint32Value());

          std::get<0>(metaResult) = agg;
        }
      }
      // Ranking Mode
      else if (j == 1)
      {
        if (v.IsNumber())
        {
          RankingModelId rankModel = static_cast<RankingModelId>((uint32_t)v.As<Napi::Number>().Uint32Value());

          std::get<1>(metaResult) = rankModel;
        }
      }
      // Query origin
      else if (j == 2)
      {
        if (v.IsNumber())
        {
          QueryOriginId queryOrigin = static_cast<QueryOriginId>((uint32_t)v.As<Napi::Number>().Uint32Value());

          std::get<2>(metaResult) = queryOrigin;
        }
      }
      // RankingModelOptions
      else if (j == 3)
      {
        // Get settings vector
        std::vector<std::string> settings;

        Napi::Array settingsArray = v.As<Napi::Array>();
        for (size_t k = 0; k < settingsArray.Length(); k++)
        {
          Napi::Value val = settingsArray[k];
          if (val.IsString())
          {
            std::string value = (std::string)val.As<Napi::String>().Utf8Value();
            settings.push_back(value);
          }
        }
        std::get<3>(metaResult) = std::move(settings);

      }
      // Aggregation options
      else if (j == 4)
      {
        // Get settings vector
        std::vector<std::string> settings;

        Napi::Array settingsArray = v.As<Napi::Array>();
        for (size_t k = 0; k < settingsArray.Length(); k++)
        {
          Napi::Value val = settingsArray[k];
          if (val.IsString())
          {
            std::string value = (std::string)val.As<Napi::String>().Utf8Value();
            settings.push_back(value);
          }
        }
        std::get<4>(metaResult) = std::move(settings);

      }

    }


    // Push final one settings 
    gridTestSettings.push_back(std::move(metaResult));
  }

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'RunGridTest' with args:" << std::endl;

  {
    size_t i{ 0ULL };
    for (auto&& settings : gridTestSettings)
    {
      std::cout << i << ": " << std::endl;
      std::cout << "NetDataTransformation = " << (size_t)std::get<0>(settings) << std::endl;
      std::cout << "RankingModelId = " << (size_t)std::get<1>(settings) << std::endl;
      std::cout << "QueryOriginId = " << (size_t)std::get<2>(settings) << std::endl;

      std::cout << "\t settings =" << std::endl;
      for (auto&& modelOpt : std::get<3>(settings))
      {
        std::cout << "\t\t" << modelOpt << std::endl;
      }

      ++i;
    }
    std::cout << "===================" << std::endl;
  }
#endif

  // Call native method
  std::vector<std::pair<TestSettings, ChartData>> gridTestResult;
  try {
    gridTestResult = this->actualClass_->RunGridTest(gridTestSettings);
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }


  napi_value finalResult;
  napi_create_array(env, &finalResult);

  size_t i{ 0ULL };
  for (auto&& pair : gridTestResult)
  {
    std::cout << "RESULT " << i << std::endl;
    // Pair
    {
      napi_value testSetChartDataPair;
      napi_create_object(env, &testSetChartDataPair);

      // "testSettings"
      {
        std::string keyString{ "testSettings"s };
        napi_value key;
        napi_create_string_utf8(env, keyString.data(), keyString.size(), &key);

        napi_value testSettings;
        napi_create_object(env, &testSettings);

        // Set "aggregation"
        {
          std::string keyString{ "aggregation"s };
          napi_value key;
          napi_create_string_utf8(env, keyString.data(), keyString.size(), &key);
          napi_value value;
          napi_create_uint32(env, (uint32_t)std::get<0>(pair.first), &value);

          std::cout << "aggregation = " << (uint32_t)std::get<0>(pair.first) << std::endl;

          napi_set_property(env, testSettings, key, value);
        }

        // Set "rankingModel"
        {
          std::string keyString{ "rankingModel"s };
          napi_value key;
          napi_create_string_utf8(env, keyString.data(), keyString.size(), &key);
          napi_value value;
          napi_create_uint32(env, (uint32_t)std::get<1>(pair.first), &value);

          std::cout << "rankingModel = " << (uint32_t)std::get<1>(pair.first) << std::endl;

          napi_set_property(env, testSettings, key, value);
        }

        // Set "queryOrigin"
        {
          std::string keyString{ "queryOrigin"s };
          napi_value key;
          napi_create_string_utf8(env, keyString.data(), keyString.size(), &key);
          napi_value value;
          napi_create_uint32(env, (uint32_t)std::get<2>(pair.first), &value);

          std::cout << "queryOrigin = " << (uint32_t)std::get<2>(pair.first) << std::endl;

          napi_set_property(env, testSettings, key, value);
        }

        // "modelOptions"
        {
          std::string keyString{ "modelOptions"s };
          napi_value key;
          napi_create_string_utf8(env, keyString.data(), keyString.size(), &key);

          napi_value arrOpts;
          napi_create_array(env, &arrOpts);

          std::cout << "modelOptions:" << std::endl;

          size_t ii{0ULL};
          for (auto&& opt : std::get<3>(pair.first))
          {
            napi_value optString;
            napi_create_string_utf8(env, opt.data(), opt.size(), &optString);

            std::cout << optString <<  std::endl;

            napi_set_element(env, arrOpts, ii, optString);

            ++ii;
          }

          napi_set_property(env, testSettings, key, arrOpts);
        }

        napi_set_property(env, testSetChartDataPair, key, testSettings);
      }

      // "chartData"
      {
        std::string keyString{ "chartData"s };
        napi_value key;
        napi_create_string_utf8(env, keyString.data(), keyString.size(), &key);

        napi_value chartDataArray;
        napi_create_array(env, &chartDataArray);

        std::cout << "CHARTDATA:" << std::endl;

        size_t iii{ 0ULL };
        for (auto&& pairIndexValue : pair.second)
        {
          napi_value indValPair;
          napi_create_object(env, &indValPair);

          std::cout << "iii = " << iii << std::endl;

          // Set "index"
          {
            napi_value key;
            napi_create_string_utf8(env, "index", 5, &key);

            napi_value value;
            napi_create_uint32(env, pairIndexValue.first, &value);

            std::cout << "index = " << pairIndexValue.first << std::endl;

            napi_set_property(env, indValPair, key, value);
          }

          // Set "value"
          {
            napi_value key;
            napi_create_string_utf8(env, "value", 5, &key);
            napi_value value;
            napi_create_uint32(env, pairIndexValue.second, &value);

            std::cout << "value = " << pairIndexValue.second << std::endl;

            napi_set_property(env, indValPair, key, value);
          }

          napi_set_element(env, chartDataArray, iii, indValPair);
          ++iii;
        }

        napi_set_property(env, testSetChartDataPair, key, chartDataArray);
      }

      napi_set_element(env, finalResult, i, testSetChartDataPair);
    } // pair
    ++i;
  } 

  return Napi::Array(env, finalResult);
}

Napi::Value ImageRankerWrapper::RunModelTest(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 6)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::RunModelTest)").ThrowAsJavaScriptException();
  }

  Napi::Number aggFn = info[0].As<Napi::Number>();
  Napi::Number modelType = info[1].As<Napi::Number>();
  Napi::Number dataSource = info[2].As<Napi::Number>();

  //
  // Get simulated user settings vector
  //
  std::vector<std::string> simulatedUserSettings;

  Napi::Array simulatedUsersettingsArray = info[3].As<Napi::Array>();
  for(size_t i = 0; i < simulatedUsersettingsArray.Length(); i++)
  {
    Napi::Value v = simulatedUsersettingsArray[i];
    if (v.IsString())
    {
      std::string value = (std::string)v.As<Napi::String>();
      simulatedUserSettings.push_back(value);
    }
  }


  //
  // Get settings vector
  //
  std::vector<std::string> settings;

  Napi::Array settingsArray = info[4].As<Napi::Array>();
  for(size_t i = 0; i < settingsArray.Length(); i++)
  {
    Napi::Value v = settingsArray[i];
    if (v.IsString())
    {
      std::string value = (std::string)v.As<Napi::String>();
      settings.push_back(value);
    }
  }

  // Aggregation settings
  std::vector<std::string> aggSettings;

  Napi::Array aggSettingsArray = info[5].As<Napi::Array>();
  for (size_t k{0ULL}; k < aggSettingsArray.Length(); k++)
  {
    Napi::Value val = aggSettingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      aggSettings.push_back(value);
    }
  }



  #if LOG_CALLS

  std::cout << "CALLING NATIVE 'RunModelTest' with args:" << std::endl;
  std::cout << aggFn.Uint32Value() << std::endl;
  std::cout << modelType.Uint32Value() << std::endl;
  std::cout << dataSource.Uint32Value() << std::endl;
  std::cout << "settings:" << std::endl;

  for (auto&& s : settings) 
  {
    std::cout << s << std::endl;
  }

  for (auto&& s : aggSettings) 
  {
    std::cout << s << std::endl;
  }

  std::cout << "===================" << std::endl;

  #endif

  // Call native method
  
  ChartData chartDataPairs;
  try {
    chartDataPairs = this->actualClass_->RunModelTestWrapper(
      (NetDataTransformation)aggFn.Uint32Value(),
      (RankingModelId)modelType.Uint32Value(), 
      (QueryOriginId)dataSource.Uint32Value(),
      simulatedUserSettings, settings, aggSettings
    );
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Construct NAPI return object 
  napi_value result;
  napi_create_array(env, &result);

  size_t i{ 0ULL };
  for (auto&& pairIndexValue : chartDataPairs)
  {
    napi_value pair;
    napi_create_object(env, &pair);

    // Set "index"
    {
      napi_value key;
      napi_create_string_utf8(env, "index", 5, &key);
      napi_value value;
      napi_create_uint32(env, pairIndexValue.first, &value);

      napi_set_property(env, pair, key, value);
    }

    // Set "value"
    {
      napi_value key;
      napi_create_string_utf8(env, "value", 5, &key);
      napi_value value;
      napi_create_uint32(env, pairIndexValue.second, &value);

      napi_set_property(env, pair, key, value);
    }

    napi_set_element(env, result, i, pair);
    ++i;
  }

  return Napi::Object(env, result);
}



Napi::Value ImageRankerWrapper::SubmitInteractiveSearchSubmit(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 12)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::SubmitInteractiveSearchSubmit)").ThrowAsJavaScriptException();
  }

  size_t originType = info[0].As<Napi::Number>().Uint32Value();
  size_t targetImageId = info[1].As<Napi::Number>().Uint32Value();
  size_t modelId = info[2].As<Napi::Number>().Uint32Value();
  size_t transformationId = info[3].As<Napi::Number>().Uint32Value();

  // Get settings vector
  std::vector<std::string> modelSettings;

  Napi::Array settingsArray = info[4].As<Napi::Array>();
  for (size_t i = 0; i < settingsArray.Length(); i++)
  {
    Napi::Value v = settingsArray[i];
    if (v.IsString())
    {
      std::string value = (std::string)v.As<Napi::String>();
      modelSettings.push_back(value);
    }
  }

  // Aggregation settings
  std::vector<std::string> transformationSettings;

  Napi::Array aggSettingsArray = info[5].As<Napi::Array>();
  for (size_t k{ 0ULL }; k < aggSettingsArray.Length(); k++)
  {
    Napi::Value val = aggSettingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      transformationSettings.push_back(value);
    }
  }

  std::string sessionId = info[6].As<Napi::String>().Utf8Value();
  size_t searchSessionId = info[7].As<Napi::Number>().Uint32Value();
  size_t endStatus = info[8].As<Napi::Number>().Uint32Value();
  size_t sessionDuration = info[9].As<Napi::Number>().Uint32Value();

  // Actions array
  std::vector<std::tuple<size_t, size_t, size_t>> actions;

  Napi::Array actionsArray = info[10].As<Napi::Array>();
  for (size_t k{ 0ULL }; k < actionsArray.Length(); k++)
  {
    // action:stri, operand:stri, score:num
    Napi::Value actionObject = actionsArray[k];
    if (actionObject.IsObject())
    {
      Napi::Object object = actionObject.As<Napi::Object>();

      size_t action = object.Get("action").As<Napi::Number>().Uint32Value();
      size_t score = object.Get("score").As<Napi::Number>().Uint32Value();
      size_t operand = object.Get("operand").As<Napi::Number>().Uint32Value();
      
      actions.emplace_back(action, score, operand);
    }
  }
  size_t userId = info[11].As<Napi::Number>().Uint32Value();

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'SubmitInteractiveSearchSubmit' with args:" << std::endl;
  std::cout << "originType = " << originType << std::endl;
  std::cout << "targetImageId = " << targetImageId << std::endl;
  std::cout << "modelId = " << modelId << std::endl;
  std::cout << "transformationId = " << transformationId << std::endl;
  std::cout << "modelSettings:" << std::endl;

  for (auto&& s : modelSettings)
  {
    std::cout << s << std::endl;
  }

  std::cout << "transformationSettings:" << std::endl;
  for (auto&& s : transformationSettings)
  {
    std::cout << s << std::endl;
  }

  std::cout << "sessionId = " << sessionId << std::endl;
  std::cout << "searchSessionId = " << searchSessionId << std::endl;
  std::cout << "endStatus = " << endStatus << std::endl;
  std::cout << "sessionDuration = " << sessionDuration << std::endl;
  
  std::cout << "actions:" << std::endl;
  
  for (auto&& act : actions)
  {
    std::cout << "A: action = " << std::get<0>(act) << ", score = " << std::get<1>(act) << ", operand = " << std::get<2>(act) << std::endl;
  }
  std::cout << "modelSettings:" << std::endl;
  std::cout << "userId = " << userId << std::endl;

  std::cout << "===================" << std::endl;
#endif

  // Call native method

  
  try {
    this->actualClass_->SubmitInteractiveSearchSubmit(
      (InteractiveSearchOrigin)originType, targetImageId, 
      (RankingModelId)modelId, (NetDataTransformation)transformationId,
      modelSettings, transformationSettings,
      sessionId, searchSessionId, endStatus, sessionDuration,
      actions, userId
    );
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  return Napi::Object();
}

Napi::Value ImageRankerWrapper::GetStatisticsUserKeywordAccuracy(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 1)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetStatisticsUserKeywordAccuracy)").ThrowAsJavaScriptException();
  }

  size_t querySource = info[0].As<Napi::Number>().Uint32Value();


#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetStatisticsUserKeywordAccuracy' with args:" << std::endl;
  std::cout << querySource << std::endl;
  std::cout << "===================" << std::endl;

#endif

  // Call native method

  std::tuple<UserAccuracyChartData, UserAccuracyChartData> chartDataPairs;
  try 
  {
    chartDataPairs = this->actualClass_->GetStatisticsUserKeywordAccuracy((QueryOriginId)querySource);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }



  auto nonhypers{ std::get<0>(chartDataPairs) };
  auto hypers{ std::get<1>(chartDataPairs) };

  napi_value resultPairObject;
  napi_create_object(env, &resultPairObject);

  // Nonhypers
  {
    auto misc{ nonhypers.first};
    auto data{ nonhypers.second };

    napi_value keyOutter2;
    napi_create_string_utf8(env, "nonhyper", NAPI_AUTO_LENGTH, &keyOutter2);
    napi_value kwCont;
    napi_create_object(env, &kwCont);

    // Misc
    {
      napi_value keyOutter;
      napi_create_string_utf8(env, "misc", NAPI_AUTO_LENGTH, &keyOutter);
      napi_value miscObj;
      napi_create_object(env, &miscObj);

      // Set "querySource"
      {
        napi_value key;
        napi_create_string_utf8(env, "querySource", NAPI_AUTO_LENGTH, &key);
        napi_value value;
        napi_create_uint32(env, std::get<0>(misc), &value);

        napi_set_property(env, miscObj, key, value);
      }

      // Set "percentage"
      {
        napi_value key;
        napi_create_string_utf8(env, "percentage", NAPI_AUTO_LENGTH, &key);
        napi_value value;
        napi_create_double(env, std::get<1>(misc), &value);

        napi_set_property(env, miscObj, key, value);
      }

      napi_set_property(env, kwCont, keyOutter, miscObj);
    }


    // Chart data
    {
      napi_value keyOutter;
      napi_create_string_utf8(env, "chartData", NAPI_AUTO_LENGTH, &keyOutter);
      napi_value nonHyperChartDataArray;
      napi_create_array(env, &nonHyperChartDataArray);

      size_t i{ 0ULL };
      for (auto&& pairIndexValue : data)
      {
        napi_value pair;
        napi_create_object(env, &pair);

        // Set "index"
        {
          napi_value key;
          napi_create_string_utf8(env, "index", 5, &key);
          napi_value value;
          napi_create_uint32(env, pairIndexValue.first, &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "value"
        {
          napi_value key;
          napi_create_string_utf8(env, "value", 5, &key);
          napi_value value;
          napi_create_uint32(env, pairIndexValue.second, &value);

          napi_set_property(env, pair, key, value);
        }

        napi_set_element(env, nonHyperChartDataArray, i, pair);
        ++i;
      }

      napi_set_property(env, kwCont, keyOutter, nonHyperChartDataArray);
    }

    napi_set_property(env, resultPairObject, keyOutter2, kwCont);
  }

  // Hypers
  {
    auto misc{ hypers.first };
    auto data{ hypers.second };

    napi_value keyOutter2;
    napi_create_string_utf8(env, "hyper", NAPI_AUTO_LENGTH, &keyOutter2);
    napi_value kwCont;
    napi_create_object(env, &kwCont);

    // Misc
    {
      napi_value keyOutter;
      napi_create_string_utf8(env, "misc", NAPI_AUTO_LENGTH, &keyOutter);
      napi_value miscObj;
      napi_create_object(env, &miscObj);

      // Set "querySource"
      {
        napi_value key;
        napi_create_string_utf8(env, "querySource", NAPI_AUTO_LENGTH, &key);
        napi_value value;
        napi_create_uint32(env, std::get<0>(misc), &value);

        napi_set_property(env, miscObj, key, value);
      }

      // Set "percentage"
      {
        napi_value key;
        napi_create_string_utf8(env, "percentage", NAPI_AUTO_LENGTH, &key);
        napi_value value;
        napi_create_double(env, std::get<1>(misc), &value);

        napi_set_property(env, miscObj, key, value);
      }

      napi_set_property(env, kwCont, keyOutter, miscObj);
    }


    // Chart data
    {
      napi_value keyOutter;
      napi_create_string_utf8(env, "chartData", NAPI_AUTO_LENGTH, &keyOutter);
      napi_value nonHyperChartDataArray;
      napi_create_array(env, &nonHyperChartDataArray);

      size_t i{ 0ULL };
      for (auto&& pairIndexValue : data)
      {
        napi_value pair;
        napi_create_object(env, &pair);

        // Set "index"
        {
          napi_value key;
          napi_create_string_utf8(env, "index", 5, &key);
          napi_value value;
          napi_create_uint32(env, pairIndexValue.first, &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "value"
        {
          napi_value key;
          napi_create_string_utf8(env, "value", 5, &key);
          napi_value value;
          napi_create_uint32(env, pairIndexValue.second, &value);

          napi_set_property(env, pair, key, value);
        }

        napi_set_element(env, nonHyperChartDataArray, i, pair);
        ++i;
      }

      napi_set_property(env, kwCont, keyOutter, nonHyperChartDataArray);
    }

    napi_set_property(env, resultPairObject, keyOutter2, kwCont);
  }

  return Napi::Object(env, resultPairObject);
}



Napi::Value ImageRankerWrapper::GetKeywordByVectorIndex(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 1)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetKeywordByVectorIndex)").ThrowAsJavaScriptException();
  }

  Napi::Number keywordVectorIndex = info[0].As<Napi::Number>();

  // Call native method
  
  KeywordData keyword;
  try {
    // using KeywordData = std::tuple<size_t, std::string, std::string>;
    keyword = this->actualClass_->GetKeywordByVectorIndex(keywordVectorIndex.Uint32Value());
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Construct NAPI return object 
  napi_value result;
  napi_create_string_utf8(env, std::get<1>(keyword).data(), std::get<1>(keyword).size(), &result);


  return Napi::String(env, result);
}


Napi::Value ImageRankerWrapper::GetImageDataById(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 1)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  Napi::Number imageId = info[0].As<Napi::Number>();

  // Call native method
  const Image* image;
  try {
    image = this->actualClass_->GetImageDataById(imageId.Uint32Value());
  } 
  catch (const std::exception& e)
  {
    image = nullptr;
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }


  // Construct NAPI return object 
  napi_value result;
  napi_create_object(env, &result);

  // Set "imageId"
  {
    napi_value imageIdKey;
    napi_create_string_utf8(env, "imageId", 7, &imageIdKey);
    napi_value imageId;
    napi_create_uint32(env, image->m_imageId, &imageId);

    napi_set_property(env, result, imageIdKey, imageId);
  }

  // Set "filename"
  {
    napi_value filenameKey;
    napi_create_string_utf8(env, "filename", 8, &filenameKey);
    napi_value filename;
    napi_create_string_utf8(env, image->m_filename.data(), image->m_filename.size(), &filename);

    napi_set_property(env, result, filenameKey, filename);
  }

  // Set "probabilityVector"
  {
    std::string probVecKeyString{ "probabilityVector" };
    napi_value probVecKey;
    napi_create_string_utf8(env, probVecKeyString.data(), probVecKeyString.size(), &probVecKey);

    // Create array
    napi_value probVecArr;
    napi_create_array(env, &probVecArr);
    {
      size_t i{ 0ULL };
      for (auto&& probPair : image->m_rawNetRankingSorted)
      {
        napi_value pair;
        napi_create_object(env, &pair);

        // Set "index"
        {
          napi_value key;
          napi_create_string_utf8(env, "index", 5, &key);
          napi_value value;
          napi_create_uint32(env, probPair.first, &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "prob"
        {
          napi_value key;
          napi_create_string_utf8(env, "prob", 4, &key);
          napi_value value;
          napi_create_double(env, probPair.second, &value);

          napi_set_property(env, pair, key, value);
        }

        napi_set_element(env, probVecArr, i, pair);

        ++i;
      }
      
    }
    napi_set_property(env, result, probVecKey, probVecArr);
  }

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::GetImageKeywordsForInteractiveSearch(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 2)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetImageKeywordsForInteractiveSearch)").ThrowAsJavaScriptException();
  }

  Napi::Number imageId = info[0].As<Napi::Number>();
  Napi::Number numResults = info[1].As<Napi::Number>();

  // Call native method
  /*std::pair<std::vector<std::tuple<size_t, std::string, float>>, std::vector<std::tuple<size_t, std::string, float>>> hypersNonHypersPair;
  try 
  {
    hypersNonHypersPair = this->actualClass_->GetImageKeywordsForInteractiveSearch(imageId.Uint32Value(), numResults.Uint32Value());
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }*/
  std::tuple<
    std::vector<std::tuple<size_t, std::string, float, std::vector<std::string>>>, 
    std::vector<std::tuple<size_t, std::string, float, std::vector<std::string>>>,
    std::vector<std::pair<size_t, std::string>>
  > hypersNonHypersPair;
  try
  {
    hypersNonHypersPair = this->actualClass_->GetImageKeywordsForInteractiveSearchWithExampleImages(imageId.Uint32Value(), numResults.Uint32Value());
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }
    


  // Construct NAPI return object 
  napi_value result;
  napi_create_object(env, &result);

  // Set "imageId"
  {
    napi_value imageIdKey;
    napi_create_string_utf8(env, "imageId", 7, &imageIdKey);
    napi_value imageIds;
    napi_create_uint32(env, imageId.Uint32Value(), &imageIds);

    napi_set_property(env, result, imageIdKey, imageIds);
  }


  // Set "hypernymsArray"
  {
    std::string probVecKeyString{ "hypernymsArray" };
    napi_value probVecKey;
    napi_create_string_utf8(env, probVecKeyString.data(), probVecKeyString.size(), &probVecKey);

    // Create array
    napi_value probVecArr;
    napi_create_array(env, &probVecArr);
    {
      size_t i{ 0ULL };
      for (auto&& probPair : std::get<0>(hypersNonHypersPair))
      {
        napi_value pair;
        napi_create_object(env, &pair);

        // Set "wordnetId"
        {
          napi_value key;
          napi_create_string_utf8(env, "wordnetId", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_uint32(env,  std::get<0>(probPair), &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "word"
        {
          napi_value key;
          napi_create_string_utf8(env, "word", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_string_utf8(env, std::get<1>(probPair).data(), NAPI_AUTO_LENGTH, &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "ranking"
        {
          napi_value key;
          napi_create_string_utf8(env, "ranking", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_double(env,  std::get<2>(probPair), &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "exampleImages"
        {
          napi_value key;
          napi_create_string_utf8(env, "exampleImages", NAPI_AUTO_LENGTH, &key);
          napi_value exampleImagesArr;
          napi_create_array(env, &exampleImagesArr);

          {
            size_t ii{ 0ULL };
            for (auto&& imageFilename : std::get<3>(probPair))
            {
              napi_value filenameNapi;
              napi_create_string_utf8(env, imageFilename.data(), NAPI_AUTO_LENGTH, &filenameNapi);
              napi_set_element(env, exampleImagesArr, ii, filenameNapi);

              ++ii;
            }
          }
          napi_set_property(env, pair, key, exampleImagesArr);
        }

        napi_set_element(env, probVecArr, i, pair);

        ++i;
      }
      
    }
    napi_set_property(env, result, probVecKey, probVecArr);
  }

  // Set "nonHypernymsArray"
  {
    std::string probVecKeyString{ "nonHypernymsArray" };
    napi_value probVecKey;
    napi_create_string_utf8(env, probVecKeyString.data(), probVecKeyString.size(), &probVecKey);

    // Create array
    napi_value probVecArr;
    napi_create_array(env, &probVecArr);
    {
      size_t i{ 0ULL };
      for (auto&& probPair : std::get<1>(hypersNonHypersPair))
      {
        napi_value pair;
        napi_create_object(env, &pair);

        // Set "wordnetId"
        {
          napi_value key;
          napi_create_string_utf8(env, "wordnetId", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_uint32(env, std::get<0>(probPair), &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "word"
        {
          napi_value key;
          napi_create_string_utf8(env, "word", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_string_utf8(env, std::get<1>(probPair).data(), NAPI_AUTO_LENGTH, &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "ranking"
        {
          napi_value key;
          napi_create_string_utf8(env, "ranking", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_double(env, std::get<2>(probPair), &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "exampleImages"
        {
          napi_value key;
          napi_create_string_utf8(env, "exampleImages", NAPI_AUTO_LENGTH, &key);
          napi_value exampleImagesArr;
          napi_create_array(env, &exampleImagesArr);

          {
            size_t ii{ 0ULL };
            for (auto&& imageFilename : std::get<3>(probPair))
            {
              napi_value filenameNapi;
              napi_create_string_utf8(env, imageFilename.data(), NAPI_AUTO_LENGTH, &filenameNapi);
              napi_set_element(env, exampleImagesArr, ii, filenameNapi);

              ++ii;
            }
          }
          napi_set_property(env, pair, key, exampleImagesArr);
        }

        napi_set_element(env, probVecArr, i, pair);

        ++i;
      }
      
    }
    napi_set_property(env, result, probVecKey, probVecArr);
  }

  // Set "shotFrames"
  {
    std::string probVecKeyString{ "shotFrames" };
    napi_value probVecKey;
    napi_create_string_utf8(env, probVecKeyString.data(), probVecKeyString.size(), &probVecKey);

    // Create array
    napi_value probVecArr;
    napi_create_array(env, &probVecArr);
    {
      size_t i{ 0ULL };
      for (auto&& probPair : std::get<2>(hypersNonHypersPair))
      {
        napi_value pair;
        napi_create_object(env, &pair);

        // Set "frameId"
        {
          napi_value key;
          napi_create_string_utf8(env, "frameId", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_uint32(env, probPair.first, &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "frameFilename"
        {
          napi_value key;
          napi_create_string_utf8(env, "frameFilename", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_string_utf8(env, probPair.second.data(), NAPI_AUTO_LENGTH, &value);

          napi_set_property(env, pair, key, value);
        }

        napi_set_element(env, probVecArr, i, pair);

        ++i;
      }
      
    }
    napi_set_property(env, result, probVecKey, probVecArr);
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
  /*std::vector< std::tuple<size_t, std::string, std::string> > keywordData;
  try {
     keywordData = this->actualClass_->GetNearKeywords(prefix);
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }*/

  std::vector<Keyword*> keywordData;
  try {
     keywordData = this->actualClass_->GetNearKeywordsWithImages(prefix);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }




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

      napi_create_uint32(env, keyword->m_wordnetId, &wordnetId);
      napi_create_string_utf8(env, keyword->m_word.data(), NAPI_AUTO_LENGTH, &word);

      std::string descriptionString{ this->actualClass_->GetKeywordDescriptionByWordnetId(keyword->m_wordnetId) };

      napi_create_string_utf8(env, descriptionString.data(), NAPI_AUTO_LENGTH, &description);


      // Create example images array
      napi_value exampleImagesArr;
      napi_create_array(env, &exampleImagesArr);

      size_t ii{ 0ULL };
      for (auto&& imageFilename : keyword->m_exampleImageFilenames)
      {
        napi_value filenameNapi;
        napi_create_string_utf8(env, imageFilename.data(), NAPI_AUTO_LENGTH, &filenameNapi);
        napi_set_element(env, exampleImagesArr, ii, filenameNapi);

        ++ii;
      }


      napi_set_element(env, tempArray, 0, wordnetId);
      napi_set_element(env, tempArray, 1, word);
      napi_set_element(env, tempArray, 2, description);
      napi_set_element(env, tempArray, 3, exampleImagesArr);

      napi_set_element(env, result, i, tempArray);

      ++i;
  }

  return Napi::Object(env, result);
}



Napi::Value ImageRankerWrapper::GetRelevantImagesPlainQuery(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  std::cout << "CALLING NATIVE 'GetRelevantImages' with args:" << std::endl;

  // Process arguments
  int length = info.Length();
  if (length != 7)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C args
  std::vector<std::string> queries;
  Napi::Array queriesArray = info[0].As<Napi::Array>();
  for (size_t k{ 0ULL }; k < queriesArray.Length(); k++)
  {
    Napi::Value val = queriesArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      queries.push_back(value);
    }
  }

  // size_t numResults
  size_t numResults = info[1].As<Napi::Number>().Uint32Value();

  // Aggregation aggFn
  size_t aggregation = info[2].As<Napi::Number>().Uint32Value();

  // RankingModel rankingModel
  size_t rankingModel = info[3].As<Napi::Number>().Uint32Value();

  // const ModelSettings& settings
  std::vector<std::string> settings;

  Napi::Array settingsArray = info[4].As<Napi::Array>();
  for (size_t k{0ULL}; k < settingsArray.Length(); k++)
  {
    Napi::Value val = settingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      settings.push_back(value);
    }
  }

  // Aggregation settings
  std::vector<std::string> aggSettings;

  Napi::Array aggSettingsArray = info[5].As<Napi::Array>();
  for (size_t k{0ULL}; k < aggSettingsArray.Length(); k++)
  {
    Napi::Value val = aggSettingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      aggSettings.push_back(value);
    }
  }


  // size_t imageId = SIZE_T_ERROR_VALUE
  size_t imageId = info[6].As<Napi::Number>().Uint32Value();

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetRelevantImagesWrapper' with args:" << std::endl;
  std::cout << "\t queries = " << std::endl;
  for (auto&& query : queries)
  {
    std::cout << "\t\t" << query << std::endl;
  }
  std::cout << "numResults = " << numResults << std::endl;
  std::cout << "NetDataTransformation = " << aggregation << std::endl;
  std::cout << "rankingModelId = " << rankingModel << std::endl;

  std::cout << "\t modelSettings = " << std::endl;
  for (auto&& modelOpt : settings)
  {
    std::cout << "\t\t" << modelOpt << std::endl;
  }

  std::cout << "\t aggSettings = " << std::endl;
  for (auto&& modelOpt : aggSettings)
  {
    std::cout << "\t\t" << modelOpt << std::endl;
  }

  std::cout << "imageId = " << imageId << std::endl;
  std::cout << "===================" << std::endl;

#endif

  // Call native method: Get vector of relevant images
  std::pair<std::vector<ImageReference>, QueryResult> images;
  try {
     images = this->actualClass_->GetRelevantImagesWrapper(
      queries, numResults, 
      (NetDataTransformation)aggregation, (RankingModelId)rankingModel, 
      settings, aggSettings,
      imageId
    );
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  napi_value result;
  napi_create_object(env, &result);


  // "targetImageRank"
  {
    napi_value key;
    napi_create_string_utf8(env, "targetImageRank", 15, &key);

    napi_value value;
    napi_create_uint32(env, images.second.m_targetImageRank, &value);

    napi_set_property(env, result, key, value);
  }


  // "images"
  {
    napi_value imagesKey;
    napi_create_string_utf8(env, "images", 6, &imagesKey);

    napi_value resultImageArray;
    napi_create_array(env, &resultImageArray);
    {

      size_t i{ 0ULL };
      for (auto&& image : images.first)
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

        napi_set_element(env, resultImageArray, i, imageItem);

        ++i;
      }
    }
    napi_set_property(env, result, imagesKey, resultImageArray);
  }

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::GetRelevantImagesWithSuggestedPlainQuery(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  std::cout << "CALLING NATIVE 'GetRelevantImages' with args:" << std::endl;

  // Process arguments
  int length = info.Length();
  if (length != 7)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRelevantImagesWithSuggestedPlainQuery)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C args
  // const std::string& query
  std::string query{ info[0].As<Napi::String>().Utf8Value() };

  // \todo implement properly
  std::vector<std::string> queries;
  queries.push_back(query);

  // size_t numResults
  size_t numResults = info[1].As<Napi::Number>().Uint32Value();

  // Aggregation aggFn
  size_t aggregation = info[2].As<Napi::Number>().Uint32Value();

  // RankingModel rankingModel
  size_t rankingModel = info[3].As<Napi::Number>().Uint32Value();

  // const ModelSettings& settings
  std::vector<std::string> settings;

  Napi::Array settingsArray = info[4].As<Napi::Array>();
  for (size_t k{ 0ULL }; k < settingsArray.Length(); k++)
  {
    Napi::Value val = settingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      settings.push_back(value);
    }
  }

  // Aggregation settings
  std::vector<std::string> aggSettings;

  Napi::Array aggSettingsArray = info[5].As<Napi::Array>();
  for (size_t k{ 0ULL }; k < aggSettingsArray.Length(); k++)
  {
    Napi::Value val = aggSettingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      aggSettings.push_back(value);
    }
  }


  // size_t imageId = SIZE_T_ERROR_VALUE
  size_t imageId = info[6].As<Napi::Number>().Uint32Value();

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetRelevantImagesWithSuggestedWrapper' with args:" << std::endl;
  std::cout << "query = " << query << std::endl;
  std::cout << "numResults = " << numResults << std::endl;
  std::cout << "NetDataTransformation = " << aggregation << std::endl;
  std::cout << "rankingModelId = " << rankingModel << std::endl;

  std::cout << "\t modelSettings = " << std::endl;
  for (auto&& modelOpt : settings)
  {
    std::cout << "\t\t" << modelOpt << std::endl;
  }

  std::cout << "\t aggSettings = " << std::endl;
  for (auto&& modelOpt : aggSettings)
  {
    std::cout << "\t\t" << modelOpt << std::endl;
  }

  std::cout << "imageId = " << imageId << std::endl;
  std::cout << "===================" << std::endl;

#endif

  // Call native method: Get vector of relevant images
  std::tuple<std::vector<ImageReference>, std::vector<std::tuple<size_t, std::string, float>>, QueryResult> images;
  try {
    images = this->actualClass_->GetRelevantImagesWithSuggestedWrapper(
      queries, numResults,
      (NetDataTransformation)aggregation, (RankingModelId)rankingModel,
      settings, aggSettings,
      imageId
    );
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  napi_value result;
  napi_create_object(env, &result);


  // "targetImageRank"
  {
    napi_value key;
    napi_create_string_utf8(env, "targetImageRank", NAPI_AUTO_LENGTH, &key);

    napi_value value;
    napi_create_uint32(env, std::get<2>(images).m_targetImageRank, &value);

    napi_set_property(env, result, key, value);
  }

  // "suggestedKeywords"
  {
    napi_value imagesKey;
    napi_create_string_utf8(env, "suggestedKeywords", NAPI_AUTO_LENGTH, &imagesKey);

    napi_value suggKeywordsArray;
    napi_create_array(env, &suggKeywordsArray);
    {
      size_t i{ 0ULL };
      for (auto&& kw : std::get<1>(images))
      {

        // Construct NAPI return object 
        napi_value suggKeywordObj;
        napi_create_object(env, &suggKeywordObj);

        // Set "wordnetId"
        {
          napi_value wordnetIdKey;
          napi_create_string_utf8(env, "wordnetId", NAPI_AUTO_LENGTH, &wordnetIdKey);
          napi_value imageId;
          napi_create_uint32(env, std::get<0>(kw), &imageId);

          napi_set_property(env, suggKeywordObj, wordnetIdKey, imageId);
        }

        // Set "word"
        {
          napi_value filenameKey;
          napi_create_string_utf8(env, "word", NAPI_AUTO_LENGTH, &filenameKey);
          napi_value filename;
          napi_create_string_utf8(env, std::get<1>(kw).data(), NAPI_AUTO_LENGTH, &filename);

          napi_set_property(env, suggKeywordObj, filenameKey, filename);
        }

        // Set "frequencyRating"
        {
          napi_value filenameKey;
          napi_create_string_utf8(env, "frequencyRating", NAPI_AUTO_LENGTH, &filenameKey);
          napi_value frequencyRating;
          napi_create_double(env, std::get<2>(kw), &frequencyRating);

          napi_set_property(env, suggKeywordObj, filenameKey, frequencyRating);
        }

        napi_set_element(env, suggKeywordsArray, i, suggKeywordObj);

        ++i;
      }
    }
    napi_set_property(env, result, imagesKey, suggKeywordsArray);
  }

  // "images"
  {
    napi_value imagesKey;
    napi_create_string_utf8(env, "images", NAPI_AUTO_LENGTH, &imagesKey);

    napi_value resultImageArray;
    napi_create_array(env, &resultImageArray);
    {

      size_t i{ 0ULL };
      for (auto&& image : std::get<0>(images))
      {

        // Construct NAPI return object 
        napi_value imageItem;
        napi_create_object(env, &imageItem);

        // Set "imageId"
        {
          napi_value imageIdKey;
          napi_create_string_utf8(env, "imageId", NAPI_AUTO_LENGTH, &imageIdKey);
          napi_value imageId;
          napi_create_uint32(env, std::get<0>(image), &imageId);

          napi_set_property(env, imageItem, imageIdKey, imageId);
        }

        // Set "filename"
        {
          napi_value filenameKey;
          napi_create_string_utf8(env, "filename", NAPI_AUTO_LENGTH, &filenameKey);
          napi_value filename;
          napi_create_string_utf8(env, std::get<1>(image).data(), NAPI_AUTO_LENGTH, &filename);

          napi_set_property(env, imageItem, filenameKey, filename);
        }

        napi_set_element(env, resultImageArray, i, imageItem);

        ++i;
      }
    }
    napi_set_property(env, result, imagesKey, resultImageArray);
  }

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::TrecvidGetRelevantShots(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  std::cout << "CALLING NATIVE 'GetRelevantImages' with args:" << std::endl;

  // Process arguments
  int length = info.Length();
  if (length != 8)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C args
  std::vector<std::string> queries;
  Napi::Array queriesArray = info[0].As<Napi::Array>();
  for (size_t k{ 0ULL }; k < queriesArray.Length(); k++)
  {
    Napi::Value val = queriesArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      queries.push_back(value);
    }
  }

  // size_t numResults
  size_t numResults = info[1].As<Napi::Number>().Uint32Value();

  // Aggregation aggFn
  size_t aggregation = info[2].As<Napi::Number>().Uint32Value();

  // RankingModel rankingModel
  size_t rankingModel = info[3].As<Napi::Number>().Uint32Value();

  // const ModelSettings& settings
  std::vector<std::string> settings;

  Napi::Array settingsArray = info[4].As<Napi::Array>();
  for (size_t k{0ULL}; k < settingsArray.Length(); k++)
  {
    Napi::Value val = settingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      settings.push_back(value);
    }
  }

  // Aggregation settings
  std::vector<std::string> aggSettings;

  Napi::Array aggSettingsArray = info[5].As<Napi::Array>();
  for (size_t k{0ULL}; k < aggSettingsArray.Length(); k++)
  {
    Napi::Value val = aggSettingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      aggSettings.push_back(value);
    }
  }

  size_t sessionDuation = info[6].As<Napi::Number>().FloatValue();

  // size_t imageId = SIZE_T_ERROR_VALUE
  size_t imageId = info[7].As<Napi::Number>().Uint32Value();

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetRelevantImagesWrapper' with args:" << std::endl;
  std::cout << "\t queries = " << std::endl;
  for (auto&& query : queries)
  {
    std::cout << "\t\t" << query << std::endl;
  }
  std::cout << "numResults = " << numResults << std::endl;
  std::cout << "NetDataTransformation = " << aggregation << std::endl;
  std::cout << "rankingModelId = " << rankingModel << std::endl;

  std::cout << "\t modelSettings = " << std::endl;
  for (auto&& modelOpt : settings)
  {
    std::cout << "\t\t" << modelOpt << std::endl;
  }

  std::cout << "\t aggSettings = " << std::endl;
  for (auto&& modelOpt : aggSettings)
  {
    std::cout << "\t\t" << modelOpt << std::endl;
  }

  std::cout << "sessionDuation = " << sessionDuation << std::endl;
  std::cout << "imageId = " << imageId << std::endl;
  std::cout << "===================" << std::endl;

#endif

  // Call native method: Get vector of relevant images
  std::tuple<float, std::vector<std::pair<size_t, size_t>>> durationShotsPair;
  try {
      durationShotsPair = this->actualClass_->TrecvidGetRelevantShots(
      queries, numResults, 
      (NetDataTransformation)aggregation, (RankingModelId)rankingModel, 
      settings, aggSettings,
      sessionDuation,
      imageId
    );
  } 
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  napi_value result;
  napi_create_object(env, &result);


  // // "elapsedTime"
  // {
    
  //   napi_value key;
  //   napi_create_string_utf8(env, "elapsedTime", NAPI_AUTO_LENGTH, &key);

  //   napi_value value;
  //   napi_create_double(env, std::get<0>(durationShotsPair), &value);

  //   napi_set_property(env, result, key, value);
  // }


  // // "shots"
  // {
  //   napi_value imagesKey;
  //   napi_create_string_utf8(env, "shots", NAPI_AUTO_LENGTH, &imagesKey);

  //   napi_value resultImageArray;
  //   napi_create_array(env, &resultImageArray);
  //   {

  //     size_t i{ 0ULL };
  //     for (auto&& [videoId, shotId] : std::get<1>(durationShotsPair))
  //     {

  //       // Construct NAPI return object 
  //       napi_value videoShotIdsPair;
  //       napi_create_object(env, &videoShotIdsPair);

  //       // Set "videoId"
  //       {
  //         napi_value key;
  //         napi_create_string_utf8(env, "videoId", NAPI_AUTO_LENGTH, &key);
  //         napi_value value;
  //         napi_create_uint32(env, videoId, &value);

  //         napi_set_property(env, videoShotIdsPair, key, value);
  //       }

  //       // Set "shotId"
  //       {
  //         napi_value key;
  //         napi_create_string_utf8(env, "shotId", NAPI_AUTO_LENGTH, &key);
  //         napi_value value;
  //         napi_create_uint32(env, shotId, &value);

  //         napi_set_property(env, videoShotIdsPair, key, value);
  //       }

  //       napi_set_element(env, resultImageArray, i, videoShotIdsPair);

  //       ++i;
  //     }
  //   }
  //   napi_set_property(env, result, imagesKey, resultImageArray);
  // }

  return Napi::Object(env, result);
  
}
