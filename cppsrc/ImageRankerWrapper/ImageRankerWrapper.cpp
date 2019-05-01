#include "ImageRankerWrapper.h"

Napi::FunctionReference ImageRankerWrapper::constructor;

Napi::Object ImageRankerWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "ImageRankerWrapper", {
    
    InstanceMethod("Initialize", &ImageRankerWrapper::Initialize),
    InstanceMethod("GetGridTestProgress", &ImageRankerWrapper::GetGridTestProgress),
    InstanceMethod("RunGridTest", &ImageRankerWrapper::RunGridTest),
    InstanceMethod("GetNearKeywords", &ImageRankerWrapper::GetNearKeywords),
    InstanceMethod("GetRandomImage", &ImageRankerWrapper::GetRandomImage),
    InstanceMethod("SubmitUserQueriesWithResults", &ImageRankerWrapper::SubmitUserQueriesWithResults),
    InstanceMethod("GetRelevantImages", &ImageRankerWrapper::GetRelevantImages),
    InstanceMethod("GetImageDataById", &ImageRankerWrapper::GetImageDataById),
    InstanceMethod("GetKeywordByVectorIndex", &ImageRankerWrapper::GetKeywordByVectorIndex),
    InstanceMethod("RunModelTest", &ImageRankerWrapper::RunModelTest)

    
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
  
  if (length != 7) {
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
  std::cout << "===================================" << std::endl;

#endif



  this->actualClass_ = new ImageRanker(
    imagesPath,
    rawNetRankingFilepath,
    keywordClassesFilepath,
    softmaxFilepath,
    deepFeaturesFilepath,
    imageToIdMapFilepath,
    idOffset
  );




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
  
  this->actualClass_->Initialize();

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

  std::vector<ImageRanker::TestSettings> gridTestSettings;


  Napi::Array gridTestSettingsArray = info[0].As<Napi::Array>();
  for (size_t i = 0; i < gridTestSettingsArray.Length(); i++)
  {
    std::tuple<ImageRanker::Aggregation, ImageRanker::RankingModel, ImageRanker::QueryOrigin, std::vector<std::string>> metaResult;

    Napi::Value v = gridTestSettingsArray[i];

    Napi::Array innerArr = v.As<Napi::Array>();
    for (size_t j = 0; j < innerArr.Length(); j++)
    {

      // Aggregation
      if (j == 0)
      {
        if (v.IsNumber())
        {
          ImageRanker::Aggregation agg = static_cast<ImageRanker::Aggregation>((uint32_t)v.As<Napi::Number>().Uint32Value());

          std::get<0>(metaResult) = agg;
        }
      }
      // Ranking Mode
      else if (j == 1)
      {
        if (v.IsNumber())
        {
          ImageRanker::RankingModel rankModel = static_cast<ImageRanker::RankingModel>((uint32_t)v.As<Napi::Number>().Uint32Value());

          std::get<1>(metaResult) = rankModel;
        }
      }
      // Query origin
      else if (j == 2)
      {
        if (v.IsNumber())
        {
          ImageRanker::QueryOrigin queryOrigin = static_cast<ImageRanker::QueryOrigin>((uint32_t)v.As<Napi::Number>().Uint32Value());

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
      std::cout << "Aggregation = " << std::get<0>(settings) << std::endl;
      std::cout << "RankingModel = " << std::get<1>(settings) << std::endl;
      std::cout << "QueryOrigin = " << std::get<2>(settings) << std::endl;

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
  std::vector<std::pair<ImageRanker::TestSettings, ImageRanker::ChartData>> gridTestResult{
    this->actualClass_->RunGridTest(gridTestSettings)
  };


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
  if (length != 4)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::RunModelTest)").ThrowAsJavaScriptException();
  }

  Napi::Number aggFn = info[0].As<Napi::Number>();
  Napi::Number modelType = info[1].As<Napi::Number>();
  Napi::Number dataSource = info[2].As<Napi::Number>();

  // Get settings vector
  std::vector<std::string> settings;

  Napi::Array settingsArray = info[3].As<Napi::Array>();
  for(size_t i = 0; i < settingsArray.Length(); i++)
  {
    Napi::Value v = settingsArray[i];
    if (v.IsString())
    {
      std::string value = (std::string)v.As<Napi::String>();
      settings.push_back(value);
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

  std::cout << "===================" << std::endl;

  #endif

  // Call native method
  ImageRanker::ChartData chartDataPairs{ 
    this->actualClass_->RunModelTest(
      (ImageRanker::Aggregation)aggFn.Uint32Value(),
      (ImageRanker::RankingModel)modelType.Uint32Value(), 
      (ImageRanker::QueryOrigin)dataSource.Uint32Value(),
      settings
    ) 
  };

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
  std::string keyword{ this->actualClass_->GetKeywordByVectorIndex(keywordVectorIndex.Uint32Value()) };

  // Construct NAPI return object 
  napi_value result;
  napi_create_string_utf8(env, keyword.data(), keyword.size(), &result);


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
  Image image{ this->actualClass_->GetImageDataById(imageId.Uint32Value()) };

  // Construct NAPI return object 
  napi_value result;
  napi_create_object(env, &result);

  // Set "imageId"
  {
    napi_value imageIdKey;
    napi_create_string_utf8(env, "imageId", 7, &imageIdKey);
    napi_value imageId;
    napi_create_uint32(env, image.m_imageId, &imageId);

    napi_set_property(env, result, imageIdKey, imageId);
  }

  // Set "filename"
  {
    napi_value filenameKey;
    napi_create_string_utf8(env, "filename", 8, &filenameKey);
    napi_value filename;
    napi_create_string_utf8(env, image.m_filename.data(), image.m_filename.size(), &filename);

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
      for (auto&& probPair : image.m_rawNetRankingSorted)
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

  std::cout << "CALLING NATIVE 'GetRelevantImages' with args:" << std::endl;

  // Process arguments
  int length = info.Length();
  if (length != 4)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C args
  Napi::String query = info[0].As<Napi::String>();
  Napi::Number numResults = info[1].As<Napi::Number>();
  Napi::Number rankingModel = info[2].As<Napi::Number>();
  Napi::Number imageId = info[3].As<Napi::Number>();

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetRelevantImages' with args:" << std::endl;
  std::cout << query.Utf8Value() << std::endl;
  std::cout << numResults.Uint32Value() << std::endl;
  std::cout << rankingModel.Uint32Value() << std::endl;
  std::cout << imageId.Uint32Value() << std::endl;
  std::cout << "===================" << std::endl;

#endif

  // Call native method: Get vector of relevant images
  std::pair<std::vector<ImageRanker::ImageReference>, ImageRanker::QueryResult> images{ this->actualClass_->GetRelevantImages(
    query.Utf8Value(), numResults.Uint32Value(), 
    ImageRanker::Aggregation::cMinMaxLinear, (ImageRanker::RankingModel)rankingModel.Uint32Value(), 
    std::vector<std::string>({"0.01"}),
    imageId.Uint32Value()) 
  };

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetRelevantImages' with result:" << std::endl;
  std::cout << images.second.m_targetImageRank << std::endl;
  std::cout << "numImages = " << images.first.size() << std::endl;
  std::cout << "===================" << std::endl;

#endif



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

