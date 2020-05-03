#include "common.h"
#include "utility.h"

#include "ImageRankerWrapper.h"

#include <stdexcept>

Napi::FunctionReference ImageRankerWrapper::constructor;

Napi::Object ImageRankerWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "ImageRankerWrapper", {

    InstanceMethod("getLoadedDataPacksInfo", &ImageRankerWrapper::get_loaded_data_packs_info),
    InstanceMethod("getAutocompleteResults", &ImageRankerWrapper::get_autocomplete_results),
    InstanceMethod("getRandomFrameSequence", &ImageRankerWrapper::get_random_frame_sequence),
    InstanceMethod("submitAnnotatorUserQueries", &ImageRankerWrapper::submit_annotator_user_queries),
    InstanceMethod("rankFrames", &ImageRankerWrapper::rank_frames),
    InstanceMethod("runModelTest", &ImageRankerWrapper::run_model_test),


    InstanceMethod("submitSearchSession", &ImageRankerWrapper::submit_search_session), 
    InstanceMethod("getFrameDetailData", &ImageRankerWrapper::get_frame_detail_data)

    // InstanceMethod("GetRandomImageSequence", &ImageRankerWrapper::GetRandomImageSequence),

    // InstanceMethod("GetCouplingImage", &ImageRankerWrapper::GetCouplingImage),
    // InstanceMethod("Initialize", &ImageRankerWrapper::Initialize),
    // InstanceMethod("GetGeneralStatistics", &ImageRankerWrapper::GetGeneralStatistics),
    // InstanceMethod("ExportDataFile", &ImageRankerWrapper::ExportDataFile),
    // InstanceMethod("RunGridTest", &ImageRankerWrapper::RunGridTest),
    // InstanceMethod("RunGridTest", &ImageRankerWrapper::RunGridTest),
    // InstanceMethod("GetNearKeywords", &ImageRankerWrapper::GetNearKeywords),
    // InstanceMethod("GetRandomImage", &ImageRankerWrapper::GetRandomImage),
    // InstanceMethod("GetCouplingImageNative", &ImageRankerWrapper::GetCouplingImageNative),    
    // InstanceMethod("SubmitUserQueriesWithResults", &ImageRankerWrapper::SubmitUserQueriesWithResults),
    // InstanceMethod("SubmitUserDataNativeQueries", &ImageRankerWrapper::SubmitUserDataNativeQueries),
    // InstanceMethod("GetRelevantImagesPlainQuery", &ImageRankerWrapper::GetRelevantImagesPlainQuery),
    // InstanceMethod("TrecvidGetRelevantShots", &ImageRankerWrapper::TrecvidGetRelevantShots),
    // InstanceMethod("GetImageDataById", &ImageRankerWrapper::GetImageDataById),
    // InstanceMethod("GetKeywordDataById", &ImageRankerWrapper::GetKeywordDataById),
    // InstanceMethod("GetKeywordByVectorIndex", &ImageRankerWrapper::GetKeywordByVectorIndex),
    // InstanceMethod("RunModelTest", &ImageRankerWrapper::RunModelTest),
    // InstanceMethod("GetStatisticsUserKeywordAccuracy", &ImageRankerWrapper::GetStatisticsUserKeywordAccuracy),
    // InstanceMethod("GetRelevantImagesWithSuggestedPlainQuery", &ImageRankerWrapper::GetRelevantImagesWithSuggestedPlainQuery),




    });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("ImageRankerWrapper", func);

  return exports;
}

ImageRankerWrapper::ImageRankerWrapper(const Napi::CallbackInfo& info) :
  Napi::ObjectWrap<ImageRankerWrapper>(info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();

  if (length != 2) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

  // Arg1: string
  std::string data_info_fpth = info[0].As<Napi::String>().Utf8Value();

  // Arg2: string
  std::string data_dir = info[1].As<Napi::String>().Utf8Value();

  ImageRanker::Config cfg =
      ImageRanker::parse_data_config_file(ImageRanker::eMode::cFullAnalytical, data_info_fpth, data_dir);

  try {
    this->actualClass_ = new ImageRanker(cfg);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

#if LOG_CALLS
  std::cout << "ImageRanker initialized..." << std::endl;
#endif
}


Napi::Value ImageRankerWrapper::submit_search_session(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 9)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::submit_search_session)").ThrowAsJavaScriptException();
  }

  
  std::string data_pack_ID = info[0].As<Napi::String>().Utf8Value();
  std::string model_commands = info[1].As<Napi::String>().Utf8Value();
  size_t user_level = info[2].As<Napi::Number>().Uint32Value();
  bool with_example_images = info[3].As<Napi::Boolean>().Value();
  bool found = info[4].As<Napi::Boolean>().Value();
  FrameId target_frame_ID = info[5].As<Napi::Number>().Uint32Value();
  size_t duration = info[6].As<Napi::Number>().Uint32Value();

  std::string session_ID = info[7].As<Napi::String>().Utf8Value();
  
  // Actions array
  std::vector<InteractiveSearchAction> actions;

  Napi::Array actionsArray = info[8].As<Napi::Array>();
  for (size_t k{ 0_z }; k < actionsArray.Length(); k++)
  {
    Napi::Value val = actionsArray[k];
    Napi::Object dict = val.As<Napi::Object>();

    size_t query_idx = dict.Get("queryIdx").As<Napi::Number>().Uint32Value();
    std::string action = dict.Get("action").As<Napi::String>().Utf8Value();
    std::string operand = dict.Get("operand").As<Napi::String>().Utf8Value();
    std::string operand_readable = dict.Get("word").As<Napi::String>().Utf8Value();
    size_t final_rank = dict.Get("score").As<Napi::Number>().Uint32Value();
    size_t time = dict.Get("time").As<Napi::Number>().Uint32Value();

    actions.emplace_back( InteractiveSearchAction{ query_idx, action, operand, operand_readable, final_rank, time });
  }
  
  // Call native method
  try {
    this->actualClass_->submit_search_session(
      data_pack_ID,model_commands,user_level, with_example_images, target_frame_ID, eSearchSessionEndStatus(found),duration, session_ID,actions 
      );
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  return Napi::Object();
}


Napi::Value ImageRankerWrapper::get_frame_detail_data(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 5)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetImageKeywordsForInteractiveSearch)").ThrowAsJavaScriptException();
  }

  FrameId frame_ID = info[0].As<Napi::Number>().Uint32Value();
  std::string data_pack_ID = info[1].As<Napi::String>().Utf8Value();
  std::string model_options = info[2].As<Napi::String>().Utf8Value();
  bool with_example_frames = info[3].As<Napi::Boolean>().Value();
  bool accumulated = info[4].As<Napi::Boolean>().Value();

  // Call native method
  FrameDetailData frame_detail_data{};
  try
  {
    frame_detail_data = this->actualClass_->get_frame_detail_data(
      frame_ID, data_pack_ID, model_options, with_example_frames, accumulated
      );
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }



  // Construct NAPI return object 
  napi_value result;
  napi_create_object(env, &result);

  // Set "frameId"
  {
    napi_value key;
    napi_create_string_utf8(env, "frameId", NAPI_AUTO_LENGTH, &key);
    napi_value val;
    napi_create_uint32(env, frame_detail_data.frame_ID, &val);

    napi_set_property(env, result, key, val);
  }

  // Set "dataPackId"
  {
    napi_value key;
    napi_create_string_utf8(env, "dataPackId", NAPI_AUTO_LENGTH, &key);
    napi_value val;
    napi_create_string_utf8(env, frame_detail_data.data_pack_ID.c_str(), NAPI_AUTO_LENGTH, &val);

    napi_set_property(env, result, key, val);
  }

  // Set "modelOptions"
  {
    napi_value key;
    napi_create_string_utf8(env, "modelOptions", NAPI_AUTO_LENGTH, &key);
    napi_value val;
    napi_create_string_utf8(env, frame_detail_data.model_options.c_str(), NAPI_AUTO_LENGTH, &val);

    napi_set_property(env, result, key, val);
  }


  // Set "topClasses"
  {
    napi_value key;
    napi_create_string_utf8(env, "topClassesPureHypernyms", NAPI_AUTO_LENGTH, &key);

    // Create array
    napi_value kws_arr;
    napi_create_array(env, &kws_arr);
    
    napi_set_property(env, result, key, kws_arr);
  }

  // Set "topClassesPureHypernyms"
  {
    napi_value key;
    napi_create_string_utf8(env, "topClasses", NAPI_AUTO_LENGTH, &key);

    // Create array
    napi_value kws_arr;
    napi_create_array(env, &kws_arr);
    {
      size_t i{ 0_z };
      for (auto&& p_kw : frame_detail_data.top_keywords)
      {
        napi_value pair;
        napi_create_object(env, &pair);

        // Set "kewywordId"
        {
          napi_value key;
          napi_create_string_utf8(env, "kewywordId", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_uint32(env, p_kw->ID, &value);

          napi_set_property(env, pair, key, value);
        }

        // Set "word"
        {
          napi_value key;
          napi_create_string_utf8(env, "word", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_string_utf8(env, p_kw->m_word.c_str(), NAPI_AUTO_LENGTH, &value);

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
            for (auto&& filename : p_kw->m_exampleImageFilenames)
            {
              napi_value val;
              napi_create_string_utf8(env, filename.data(), NAPI_AUTO_LENGTH, &val);
              napi_set_element(env, exampleImagesArr, ii, val);

              ++ii;
            }
          }
          napi_set_property(env, pair, key, exampleImagesArr);
        }

        napi_set_element(env, kws_arr, i, pair);

        ++i;
      }
    }

    napi_set_property(env, result, key, kws_arr);
  }

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::get_loaded_data_packs_info(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 0)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::get_loaded_data_packs_info)").ThrowAsJavaScriptException();
  }

  // Call native method
  LoadedDataPacksInfo data_packs_info;
  try {
    data_packs_info = this->actualClass_->get_loaded_data_packs_info();
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Construct NAPI return object 
  napi_value result;
  napi_create_array(env, &result);

  size_t i{ 0 };
  for (auto&& dp_info : data_packs_info.data_packs_info)
  {
    napi_value info;
    napi_create_object(env, &info);

    // const std::string& ID;
    {
      napi_value key;
      napi_create_string_utf8(env, "id", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, dp_info.ID.c_str(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, info, key, value);
    }
    // const std::string& description;
    {
      napi_value key;
      napi_create_string_utf8(env, "description", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, dp_info.description.c_str(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, info, key, value);
    }

    // const std::string& model_options;
    {
      napi_value key;
      napi_create_string_utf8(env, "model_options", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, dp_info.model_options.c_str(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, info, key, value);
    }

    // const std::string& target_imageset_ID;
    {
      napi_value key;
      napi_create_string_utf8(env, "target_imageset_ID", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, dp_info.target_imageset_ID.c_str(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, info, key, value);
    }
    // const std::string& vocabulary_ID;
    {
      napi_value key;
      napi_create_string_utf8(env, "vocabulary_ID", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, dp_info.vocabulary_ID.c_str(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, info, key, value);
    }
    // const std::string& vocabulary_description;
    {
      napi_value key;
      napi_create_string_utf8(env, "vocabulary_description", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, dp_info.vocabulary_ID.c_str(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, info, key, value);
    }

    napi_set_element(env, result, i, info);

    ++i;
  }
  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::get_autocomplete_results(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();

  if (length != 5) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

  std::string data_pack_ID = info[0].As<Napi::String>().Utf8Value();
  std::string prefix = info[1].As<Napi::String>().Utf8Value();
  size_t numResults = info[2].As<Napi::Number>().Uint32Value();
  bool withExampleImages = info[3].As<Napi::Boolean>().Value();
  std::string model_options = info[4].As<Napi::String>().Utf8Value();

  // Get suggested keywords
  AutocompleteInputResult keywordData;
  try {
    keywordData = this->actualClass_->get_autocomplete_results(data_pack_ID, prefix, numResults, withExampleImages, model_options);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Final return structure
  napi_value result_arr;
  napi_create_array(env, &result_arr);

  size_t i = 0ULL;
  // Iterate through all results
  for (auto&& keyword : keywordData.top_keywords)
  {
    // Temp array structure
    napi_value single_result_dict;
    napi_create_object(env, &single_result_dict);

    // ID
    {
      napi_value key;
      napi_create_string_utf8(env, "id", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_uint32(env, keyword->ID, &value);

      napi_set_property(env, single_result_dict, key, value);
    }

    // wordString
    {
      napi_value key;
      napi_create_string_utf8(env, "wordString", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, keyword->m_word.data(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, single_result_dict, key, value);
    }

    // description
    {
      napi_value key;
      napi_create_string_utf8(env, "description", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, keyword->description.data(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, single_result_dict, key, value);
    }

    // exampleFrames
    {
      napi_value key;
      napi_create_string_utf8(env, "exampleFrames", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_array(env, &value);

      if (withExampleImages)
      {
        size_t ii{ 0 };
        for (auto&& nat_filename : keyword->m_exampleImageFilenames)
        {
          napi_value filename;
          napi_create_string_utf8(env, nat_filename.data(), NAPI_AUTO_LENGTH, &filename);

          napi_set_element(env, value, ii, filename);
          ++ii;
        }
      }

      napi_set_property(env, single_result_dict, key, value);
    }

    napi_set_element(env, result_arr, i, single_result_dict);

    ++i;
  }

  return Napi::Object(env, result_arr);
}

Napi::Value ImageRankerWrapper::get_random_frame_sequence(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 2)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  std::string imageset_ID = info[0].As<Napi::String>().Utf8Value();
  size_t seqLength = info[1].As<Napi::Number>().Uint32Value();

  // Call native method
  std::vector<const SelFrame*> frames_sequence;
  try {
    frames_sequence = this->actualClass_->get_random_frame_sequence(imageset_ID, seqLength);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Construct NAPI return object 
  napi_value totalResult;
  napi_create_array(env, &totalResult);

  size_t i{ 0ULL };
  for (auto&& image : frames_sequence)
  {
    napi_value result;
    napi_create_object(env, &result);
    // Set "frameId"
    {
      napi_value key;
      napi_create_string_utf8(env, "frameId", 7, &key);
      napi_value val;
      napi_create_uint32(env, image->m_ID, &val);

      napi_set_property(env, result, key, val);
    }

    // Set "filename"
    {
      napi_value filenameKey;
      napi_create_string_utf8(env, "filename", 8, &filenameKey);
      napi_value filename;
      napi_create_string_utf8(env, image->m_filename.data(), image->m_filename.size(), &filename);

      napi_set_property(env, result, filenameKey, filename);
    }

    // Set this value to result array
    napi_set_element(env, totalResult, i, result);

    ++i;
  }

  return Napi::Object(env, totalResult);
}

Napi::Value ImageRankerWrapper::submit_annotator_user_queries(const Napi::CallbackInfo& info)
{
  // Parameters: SessionID, ImageID, string query
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 5)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::submit_annotator_user_queries)").ThrowAsJavaScriptException();
  }

  std::string data_pack_ID = info[0].As<Napi::String>().Utf8Value();
  std::string model_options = info[1].As<Napi::String>().Utf8Value();
  size_t user_level = size_t(info[2].As<Napi::Number>().Uint32Value());
  bool withExFrames = info[3].As<Napi::Boolean>().Value();


  std::vector<AnnotatorUserQuery> user_queries;
  {
    Napi::Array arr = info[4].As<Napi::Array>();

    for (size_t i{ 0 }; i < arr.Length(); ++i)
    {
      Napi::Value val = arr[i];
      auto obj = val.As<Napi::Object>();

      // Encoded queries
      Napi::Array arr_q = obj.Get("userQueryEncoded").As<Napi::Array>();
      std::vector<std::string> endoed_queries;
      for (size_t ii{ 0 }; ii < arr_q.Length(); ++ii)
      {
        Napi::Value v = arr_q[ii];
        endoed_queries.emplace_back(v.As<Napi::String>().Utf8Value());
      }

      Napi::Array arr_r = obj.Get("userQueryReadable").As<Napi::Array>();
      std::vector<std::string> readable_queries;
      for (size_t ii{ 0 }; ii < arr_r.Length(); ++ii)
      {
        Napi::Value v = arr_r[ii];
        readable_queries.emplace_back(v.As<Napi::String>().Utf8Value());
      }

      Napi::Array arr_t = obj.Get("targetSequenceIds").As<Napi::Array>();
      std::vector<FrameId> target_sequence;
      for (size_t ii{ 0 }; ii < arr_t.Length(); ++ii)
      {
        Napi::Value v = arr_t[ii];
        Napi::Object oo = v.As<Napi::Object>();
        FrameId id = FrameId(oo.Get("frameId").As<Napi::Number>().Uint32Value());

        target_sequence.emplace_back(id);
      }

      AnnotatorUserQuery query{
        obj.Get("sessionId").As<Napi::String>().Utf8Value(),
        endoed_queries,
        readable_queries,
        target_sequence
      };

      user_queries.emplace_back(std::move(query));
    }

  }

  // Call native method
  std::vector<GameSessionQueryResult> game_results;
  try {
    game_results = this->actualClass_->submit_annotator_user_queries(data_pack_ID, model_options, user_level, withExFrames, user_queries);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Construct NAPI return object 
  napi_value res_arr;
  napi_create_array(env, &res_arr);

  // Process all results
  size_t i = 0ULL;
  for (auto&& g_res : game_results)
  {
    napi_value game_result;
    napi_create_object(env, &game_result);

    // Set "sessionId"
    {
      napi_value key;
      napi_create_string_utf8(env, "sessionId", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, g_res.session_ID.data(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, game_result, key, value);
    }

    // Set "imageFilename"
    {
      napi_value key;
      napi_create_string_utf8(env, "imageFilename", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, g_res.frame_filename.data(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, game_result, key, value);
    }

    // Set "humanReadableQuery"
    {
      napi_value key;
      napi_create_string_utf8(env, "humanReadableQuery", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, g_res.human_readable_query.data(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, game_result, key, value);
    }

    // Set "modelTopQuery"
    {
      napi_value key;
      napi_create_string_utf8(env, "modelTopQuery", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_string_utf8(env, g_res.model_top_query.data(), NAPI_AUTO_LENGTH, &value);

      napi_set_property(env, game_result, key, value);
    }

    // Set this value to result array
    napi_set_element(env, res_arr, i, game_result);

    ++i;
  }

  return Napi::Object(env, res_arr);
}

Napi::Value ImageRankerWrapper::rank_frames(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();

  if (length != 6) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }


  std::vector<std::string> user_queries;
  {
    Napi::Array arr = info[0].As<Napi::Array>();
    for (size_t i{ 0 }; i < arr.Length(); ++i)
    {
      Napi::Value val = arr[i];
      std::string single_query = val.As<Napi::String>();
      user_queries.emplace_back(std::move(single_query));
    }
  }
  std::string data_pack_ID = info[1].As<Napi::String>().Utf8Value();
  std::string model_options = info[2].As<Napi::String>().Utf8Value();
  bool native_queries = info[3].As<Napi::Boolean>().Value();
  size_t resulst_size = size_t(info[4].As<Napi::Number>().Uint32Value());
  FrameId target_frame_ID = FrameId(info[5].As<Napi::Number>().Uint32Value());

  // Get suggested keywords
  RankingResultWithFilenames rankingResult;
  try {
    rankingResult = this->actualClass_->rank_frames(user_queries, data_pack_ID, model_options, resulst_size, native_queries, target_frame_ID);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Final return structure
  napi_value result_dict;
  napi_create_object(env, &result_dict);

  // Target ID
  {
    napi_value key;
    napi_create_string_utf8(env, "target_ID", NAPI_AUTO_LENGTH, &key);

    napi_value value;
    napi_create_uint32(env, uint32_t(rankingResult.target), &value);

    napi_set_property(env, result_dict, key, value);
  }

  // Target position
  {
    napi_value key;
    napi_create_string_utf8(env, "target_position", NAPI_AUTO_LENGTH, &key);

    napi_value value;
    napi_create_uint32(env, uint32_t(rankingResult.target_pos), &value);

    napi_set_property(env, result_dict, key, value);
  }

  {
    napi_value result_arr;
    napi_create_array(env, &result_arr);

    // Iterate through all results
    size_t i = 0ULL;
    for (auto&& [frame_ID, filename] : rankingResult.m_frames)
    {
      // Temp array structure
      napi_value single_result_dict;
      napi_create_object(env, &single_result_dict);

      // Frame ID
      {
        napi_value key;
        napi_create_string_utf8(env, "frame_ID", NAPI_AUTO_LENGTH, &key);
        napi_value value;
        napi_create_uint32(env, uint32_t(frame_ID), &value);

        napi_set_property(env, single_result_dict, key, value);
      }
      // filename
      {
        napi_value key;
        napi_create_string_utf8(env, "filename", NAPI_AUTO_LENGTH, &key);
        napi_value value;
        napi_create_string_utf8(env, filename.c_str(), NAPI_AUTO_LENGTH, &value);

        napi_set_property(env, single_result_dict, key, value);
      }

      napi_set_element(env, result_arr, i, single_result_dict);

      ++i;
    }
    napi_value key;
    napi_create_string_utf8(env, "frames", NAPI_AUTO_LENGTH, &key);
    napi_set_property(env, result_dict, key, result_arr);
  }
  return Napi::Object(env, result_dict);
}

Napi::Value ImageRankerWrapper::run_model_test(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();

  if (length != 5) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

  eUserQueryOrigin query_origin = eUserQueryOrigin(info[0].As<Napi::Number>().Uint32Value());
  std::string data_pack_ID = info[1].As<Napi::String>().Utf8Value();
  std::string model_options = info[2].As<Napi::String>().Utf8Value();
  bool native_queries = info[3].As<Napi::Boolean>().Value();
  size_t num_points = size_t(info[4].As<Napi::Number>().Uint32Value());


  ModelTestResult test_results;
  try {
    test_results = this->actualClass_->run_model_test(query_origin, data_pack_ID, model_options, native_queries, num_points);
  }
  catch (const NotSuportedModelOption& ex)
  {
    Napi::Error::New(env, ex.what()).ThrowAsJavaScriptException();
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }


  napi_value result_dict;
  napi_create_object(env, &result_dict);

  {
    napi_value arr_x;
    napi_create_array(env, &arr_x);

    napi_value arr_fx;
    napi_create_array(env, &arr_fx);

    size_t i{0};
    for (auto&& [x, fx] : test_results)
    {
      napi_value napi_x;
      napi_value napi_fx;

      napi_create_uint32(env, x, &napi_x);
      napi_create_uint32(env, fx, &napi_fx);

      napi_set_element(env, arr_x, i, napi_x);
      napi_set_element(env, arr_fx, i, napi_fx);

      ++i;
    }
    napi_value key_x;
    napi_create_string_utf8(env, "x", NAPI_AUTO_LENGTH, &key_x);
    napi_set_property(env, result_dict, key_x, arr_x);

    napi_value key_fx;
    napi_create_string_utf8(env, "fx", NAPI_AUTO_LENGTH, &key_fx);
    napi_set_property(env, result_dict, key_fx, arr_fx);
  }

  return Napi::Object(env, result_dict);
}


#if 0

Napi::Value ImageRankerWrapper::ExportDataFile(const Napi::CallbackInfo& info)
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
  std::tuple<eKeywordsDataType, eImageScoringDataType> kwScDataId;
  Napi::Value kwScDataIdObject = info[0];
  if (kwScDataIdObject.IsObject())
  {
    Napi::Object o = kwScDataIdObject.As<Napi::Object>();

    eKeywordsDataType kwDataType{ static_cast<eKeywordsDataType>(o.Get("keywordsDataType").As<Napi::Number>().Uint32Value()) };
    eImageScoringDataType scoringDataType{ static_cast<eImageScoringDataType>(o.Get("scoringDataType").As<Napi::Number>().Uint32Value()) };

    kwScDataId = std::tuple(kwDataType, scoringDataType);
  }
  size_t exportFileTypeId = info[1].As<Napi::Number>().Uint32Value();
  std::string exportDir = info[2].As<Napi::String>().Utf8Value();
  bool native = info[3].As<Napi::Boolean>().Value();


  std::string resultFilepath;
  try
  {
    resultFilepath = this->actualClass_->ExportDataFile(kwScDataId, (eExportFileTypeId)exportFileTypeId, exportDir, native);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }


  // Construct NAPI return object 
  napi_value resultObject;
  napi_create_object(env, &resultObject);

  // Set "exportedFilepath"
  {
    napi_value key;
    napi_create_string_utf8(env, "exportedFilepath", NAPI_AUTO_LENGTH, &key);
    napi_value value;
    napi_create_string_utf8(env, resultFilepath.data(), NAPI_AUTO_LENGTH, &value);

    napi_set_property(env, resultObject, key, value);
  }

  return Napi::Object(env, resultObject);
}

Napi::Value ImageRankerWrapper::GetGeneralStatistics(const Napi::CallbackInfo& info)
{
  // Parameters: SessionID, ImageID, string query
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 2)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::SubmitUserQueriesWithResults)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C
  std::tuple<eKeywordsDataType, eImageScoringDataType> kwScDataId;
  Napi::Value kwScDataIdObject = info[0];
  if (kwScDataIdObject.IsObject())
  {
    Napi::Object o = kwScDataIdObject.As<Napi::Object>();

    eKeywordsDataType kwDataType{ static_cast<eKeywordsDataType>(o.Get("keywordsDataType").As<Napi::Number>().Uint32Value()) };
    eImageScoringDataType scoringDataType{ static_cast<eImageScoringDataType>(o.Get("scoringDataType").As<Napi::Number>().Uint32Value()) };

    kwScDataId = std::tuple(kwDataType, scoringDataType);
  }
  // all/public/dev
  DataSourceTypeId dataSourceType = static_cast<DataSourceTypeId>(info[1].As<Napi::Number>().Uint32Value());
  //std::string exportDir = info[2].As<Napi::String>().Utf8Value();


  // (num of distincts keywords)
  KeywordsGeneralStatsTuple keywordsStatsTuple;
  ScoringsGeneralStatsTuple scoringsStatsTuple;
  // (min number of labels, max # labels, avg labels, median labels)
  AnnotatorDataGeneralStatsTuple annotatorDataStatsTuple;
  RankerDataGeneralStatsTuple rankerDataStatsTuple;

  try
  {
    std::tie(keywordsStatsTuple, scoringsStatsTuple, annotatorDataStatsTuple, rankerDataStatsTuple) = this->actualClass_->GetGeneralStatistics(kwScDataId, dataSourceType);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }


  // Construct NAPI return object 
  napi_value resultObject;
  napi_create_object(env, &resultObject);

  // Set "keywordsStats"
  {
    napi_value key1;
    napi_create_string_utf8(env, "keywordsStats", NAPI_AUTO_LENGTH, &key1);
    napi_value value1;
    napi_create_object(env, &value1);

    // Set "keywordsStats.numDistinctKeywords"
    {
      napi_value key;
      napi_create_string_utf8(env, "numDistinctKeywords", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_uint32(env, std::get<0>(keywordsStatsTuple), &value);

      napi_set_property(env, value1, key, value);
    }


    napi_set_property(env, resultObject, key1, value1);
  }

  // Set "scoringsStats"
  // {
  //   napi_value key1;
  //   napi_create_string_utf8(env, "keywordsStats", NAPI_AUTO_LENGTH, &key1);
  //   napi_value value1;
  //   napi_create_object(env, &value1);

  //   // Set "scoringsStats.numDistinctKeywords"
  //   // {
  //   //   napi_value key;
  //   //   napi_create_string_utf8(env, "numDistinctKeywords", NAPI_AUTO_LENGTH, &key);
  //   //   napi_value value;
  //   //   napi_create_uint32(env, std::get<0>(keywordsStatsTuple), &value);

  //   //   napi_set_property(env, value1, key, value);
  //   // }


  //   napi_set_property(env, resultObject, key1, value1);
  // }

  // Set "annotatorDataStats"
  {
    napi_value key1;
    napi_create_string_utf8(env, "annotatorDataStats", NAPI_AUTO_LENGTH, &key1);
    napi_value value1;
    napi_create_object(env, &value1);

    // Set "annotatorDataStats.minKeywords"
    {
      napi_value key;
      napi_create_string_utf8(env, "minKeywords", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_uint32(env, std::get<0>(annotatorDataStatsTuple), &value);

      napi_set_property(env, value1, key, value);
    }

    // Set "annotatorDataStats.maxKeywords"
    {
      napi_value key;
      napi_create_string_utf8(env, "maxKeywords", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_uint32(env, std::get<1>(annotatorDataStatsTuple), &value);

      napi_set_property(env, value1, key, value);
    }

    // Set "annotatorDataStats.avgKeywords"
    {
      napi_value key;
      napi_create_string_utf8(env, "avgKeywords", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_double(env, std::get<2>(annotatorDataStatsTuple), &value);

      napi_set_property(env, value1, key, value);
    }

    // Set "annotatorDataStats.medianKeywords"
    {
      napi_value key;
      napi_create_string_utf8(env, "medianKeywords", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_double(env, std::get<3>(annotatorDataStatsTuple), &value);

      napi_set_property(env, value1, key, value);
    }

    // Set "annotatorDataStats.labelHitProb"
    {
      napi_value key;
      napi_create_string_utf8(env, "labelHitProb", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_double(env, std::get<4>(annotatorDataStatsTuple), &value);

      napi_set_property(env, value1, key, value);
    }


    napi_set_property(env, resultObject, key1, value1);
  }

  // Set "rankerDataStats"
  // {
  //   napi_value key1;
  //   napi_create_string_utf8(env, "rankerDataStats", NAPI_AUTO_LENGTH, &key1);
  //   napi_value value1;
  //   napi_create_object(env, &value1);

  //   // Set "rankerDataStats.numDistinctKeywords"
  //   // {
  //   //   napi_value key;
  //   //   napi_create_string_utf8(env, "numDistinctKeywords", NAPI_AUTO_LENGTH, &key);
  //   //   napi_value value;
  //   //   napi_create_uint32(env, std::get<0>(rankerDataStatsTuple), &value);

  //   //   napi_set_property(env, value1, key, value);
  //   // }


  //   napi_set_property(env, resultObject, key1, value1);
  // }

  return Napi::Object(env, resultObject);
}


Napi::Value ImageRankerWrapper::Initialize(const Napi::CallbackInfo& info)
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
    std::string keyString{ "numCompletedTests"s };
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



Napi::Value ImageRankerWrapper::SubmitUserDataNativeQueries(const Napi::CallbackInfo& info)
{
  // Parameters: SessionID, ImageID, string query
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 3)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::SubmitUserQueriesWithResults)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C
  size_t imageId{ info[0].As<Napi::Number>().Uint32Value() };
  std::string query{ info[1].As<Napi::String>().Utf8Value() };
  std::string sessionId{ info[2].As<Napi::String>().Utf8Value() };

  std::vector<std::tuple<size_t, std::string, std::string>> v;
  v.emplace_back(imageId, query, sessionId);

  // Call native method
  std::vector<GameSessionQueryResult> queryResults;
  try {
    this->actualClass_->SubmitUserDataNativeQueries(v);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  return Napi::Object();
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
  const Image* image;
  try {
    image = this->actualClass_->GetRandomImage();
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

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::GetCouplingImageNative(const Napi::CallbackInfo& info)
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
  const Image* image;
  bool withExamples;
  size_t numNotCoupled;
  try {
    std::tie(image, withExamples, numNotCoupled) = this->actualClass_->GetCoupledImagesNative();
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
    napi_create_string_utf8(env, "imageId", NAPI_AUTO_LENGTH, &imageIdKey);
    napi_value imageId;
    napi_create_uint32(env, image->m_imageId, &imageId);

    napi_set_property(env, result, imageIdKey, imageId);
  }

  // Set "filename"
  {
    napi_value filenameKey;
    napi_create_string_utf8(env, "filename", NAPI_AUTO_LENGTH, &filenameKey);
    napi_value filename;
    napi_create_string_utf8(env, image->m_filename.data(), NAPI_AUTO_LENGTH, &filename);

    napi_set_property(env, result, filenameKey, filename);
  }

  // Set "withExamples"
  {
    napi_value key;
    napi_create_string_utf8(env, "withExamples", NAPI_AUTO_LENGTH, &key);
    napi_value value;
    napi_get_boolean(env, withExamples, &value);

    napi_set_property(env, result, key, value);
  }

  // Set "numNotCoupled"
  {
    napi_value key;
    napi_create_string_utf8(env, "numNotCoupled", NAPI_AUTO_LENGTH, &key);
    napi_value value;
    napi_create_uint32(env, numNotCoupled, &value);

    napi_set_property(env, result, key, value);
  }

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::GetCouplingImage(const Napi::CallbackInfo& info)
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
  const Image* image;
  bool withExamples;
  size_t numNotCoupled;
  try {
    std::tie(image, withExamples, numNotCoupled) = this->actualClass_->GetCouplingImage();
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
    napi_create_string_utf8(env, "imageId", NAPI_AUTO_LENGTH, &imageIdKey);
    napi_value imageId;
    napi_create_uint32(env, image->m_imageId, &imageId);

    napi_set_property(env, result, imageIdKey, imageId);
  }

  // Set "filename"
  {
    napi_value filenameKey;
    napi_create_string_utf8(env, "filename", NAPI_AUTO_LENGTH, &filenameKey);
    napi_value filename;
    napi_create_string_utf8(env, image->m_filename.data(), NAPI_AUTO_LENGTH, &filename);

    napi_set_property(env, result, filenameKey, filename);
  }

  // Set "withExamples"
  {
    napi_value key;
    napi_create_string_utf8(env, "withExamples", NAPI_AUTO_LENGTH, &key);
    napi_value value;
    napi_get_boolean(env, withExamples, &value);

    napi_set_property(env, result, key, value);
  }

  // Set "numNotCoupled"
  {
    napi_value key;
    napi_create_string_utf8(env, "numNotCoupled", NAPI_AUTO_LENGTH, &key);
    napi_value value;
    napi_create_uint32(env, numNotCoupled, &value);

    napi_set_property(env, result, key, value);
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

  std::vector<TestSettings> gridTestSettings;


  Napi::Array gridTestSettingsArray = info[0].As<Napi::Array>();
  for (size_t i = 0; i < gridTestSettingsArray.Length(); i++)
  {
    std::tuple<InputDataTransformId, RankingModelId, DataSourceTypeId, std::vector<std::string>, std::vector<std::string>> metaResult;

    Napi::Value v = gridTestSettingsArray[i];

    Napi::Array innerArr = v.As<Napi::Array>();
    for (size_t j = 0; j < innerArr.Length(); j++)
    {

      // Aggregation
      if (j == 0)
      {
        if (v.IsNumber())
        {
          InputDataTransformId agg = static_cast<InputDataTransformId>((uint32_t)v.As<Napi::Number>().Uint32Value());

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
          DataSourceTypeId queryOrigin = static_cast<DataSourceTypeId>((uint32_t)v.As<Napi::Number>().Uint32Value());

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
      std::cout << "InputDataTransformId = " << (size_t)std::get<0>(settings) << std::endl;
      std::cout << "RankingModelId = " << (size_t)std::get<1>(settings) << std::endl;
      std::cout << "DataSourceTypeId = " << (size_t)std::get<2>(settings) << std::endl;

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

          size_t ii{ 0ULL };
          for (auto&& opt : std::get<3>(pair.first))
          {
            napi_value optString;
            napi_create_string_utf8(env, opt.data(), opt.size(), &optString);

            std::cout << optString << std::endl;

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
  if (length != 8)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::RunModelTest)").ThrowAsJavaScriptException();
  }

  std::tuple<eKeywordsDataType, eImageScoringDataType> kwScDataId;
  Napi::Value kwScDataIdObject = info[0];
  if (kwScDataIdObject.IsObject())
  {
    Napi::Object o = kwScDataIdObject.As<Napi::Object>();

    eKeywordsDataType kwDataType{ static_cast<eKeywordsDataType>(o.Get("keywordsDataType").As<Napi::Number>().Uint32Value()) };
    eImageScoringDataType scoringDataType{ static_cast<eImageScoringDataType>(o.Get("scoringDataType").As<Napi::Number>().Uint32Value()) };

    kwScDataId = std::tuple(kwDataType, scoringDataType);
  }

  Napi::Number aggFn = info[1].As<Napi::Number>();
  Napi::Number modelType = info[2].As<Napi::Number>();
  Napi::Number dataSource = info[3].As<Napi::Number>();

  //
  // Get simulated user settings vector
  //
  std::vector<std::string> simulatedUserSettings;

  Napi::Array simulatedUsersettingsArray = info[4].As<Napi::Array>();
  for (size_t i = 0; i < simulatedUsersettingsArray.Length(); i++)
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

  Napi::Array settingsArray = info[5].As<Napi::Array>();
  for (size_t i = 0; i < settingsArray.Length(); i++)
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

  Napi::Array aggSettingsArray = info[6].As<Napi::Array>();
  for (size_t k{ 0ULL }; k < aggSettingsArray.Length(); k++)
  {
    Napi::Value val = aggSettingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      aggSettings.push_back(value);
    }
  }


  Napi::Number expansionSettings = info[7].As<Napi::Number>();


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
  std::cout << "expansionSettings = " << expansionSettings.Uint32Value() << std::endl;

  std::cout << "===================" << std::endl;

#endif

  // Call native method

  ChartData chartDataPairs;
  try {
    chartDataPairs = this->actualClass_->RunModelTestWrapper(
      kwScDataId,
      (InputDataTransformId)aggFn.Uint32Value(),
      (RankingModelId)modelType.Uint32Value(),
      (DataSourceTypeId)dataSource.Uint32Value(),
      simulatedUserSettings, settings, aggSettings, expansionSettings.Uint32Value()
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
    chartDataPairs = this->actualClass_->GetStatisticsUserKeywordAccuracy((DataSourceTypeId)querySource);
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
    auto misc{ nonhypers.first };
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
  if (length != 2)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetKeywordByVectorIndex)").ThrowAsJavaScriptException();
  }

  std::tuple<eKeywordsDataType, eImageScoringDataType> kwScDataId;
  Napi::Value kwScDataIdObject = info[0];
  if (kwScDataIdObject.IsObject())
  {
    Napi::Object o = kwScDataIdObject.As<Napi::Object>();

    eKeywordsDataType kwDataType{ static_cast<eKeywordsDataType>(o.Get("keywordsDataType").As<Napi::Number>().Uint32Value()) };
    eImageScoringDataType scoringDataType{ static_cast<eImageScoringDataType>(o.Get("scoringDataType").As<Napi::Number>().Uint32Value()) };

    kwScDataId = std::tuple(kwDataType, scoringDataType);
  }
  Napi::Number keywordVectorIndex = info[1].As<Napi::Number>();

  // Call native method

  Keyword* keyword;
  try {
    // using KeywordData = std::tuple<size_t, std::string, std::string>;
    keyword = this->actualClass_->GetKeywordByVectorIndex(kwScDataId, keywordVectorIndex.Uint32Value());
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Construct NAPI return object 
  napi_value result;
  napi_create_string_utf8(env, keyword->m_word.data(), keyword->m_word.size(), &result);


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
      // for (auto&& probPair : image->m_rawNetRankingSorted)
      // {
      //   napi_value pair;
      //   napi_create_object(env, &pair);

      //   // Set "index"
      //   {
      //     napi_value key;
      //     napi_create_string_utf8(env, "index", 5, &key);
      //     napi_value value;
      //     napi_create_uint32(env, probPair.first, &value);

      //     napi_set_property(env, pair, key, value);
      //   }

      //   // Set "prob"
      //   {
      //     napi_value key;
      //     napi_create_string_utf8(env, "prob", 4, &key);
      //     napi_value value;
      //     napi_create_double(env, probPair.second, &value);

      //     napi_set_property(env, pair, key, value);
      //   }

      //   napi_set_element(env, probVecArr, i, pair);

      //   ++i;
      // }

    }
    napi_set_property(env, result, probVecKey, probVecArr);
  }

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::GetKeywordDataById(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 2)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  eKeywordsDataType kwDataType;

  std::tuple<eKeywordsDataType, eImageScoringDataType> kwScDataId;
  Napi::Value kwScDataIdObject = info[0];
  if (kwScDataIdObject.IsObject())
  {
    Napi::Object o = kwScDataIdObject.As<Napi::Object>();

    kwDataType = static_cast<eKeywordsDataType>(o.Get("keywordsDataType").As<Napi::Number>().Uint32Value());
    eImageScoringDataType scoringDataType{ static_cast<eImageScoringDataType>(o.Get("scoringDataType").As<Napi::Number>().Uint32Value()) };

    kwScDataId = std::tuple(kwDataType, scoringDataType);
  }
  Napi::Number imageId = info[1].As<Napi::Number>();

  // Call native method
  const Keyword* kw;
  try {
    kw = this->actualClass_->GetKeywordConstPtr(kwDataType, imageId.Uint32Value());
  }
  catch (const std::exception& e)
  {
    kw = nullptr;
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }


  // // Construct NAPI return object 
  napi_value result;
  napi_create_object(env, &result);

  // // Set "imageId"
  // {
  //   napi_value imageIdKey;
  //   napi_create_string_utf8(env, "imageId", 7, &imageIdKey);
  //   napi_value imageId;
  //   napi_create_uint32(env, image->m_imageId, &imageId);

  //   napi_set_property(env, result, imageIdKey, imageId);
  // }

  // // Set "filename"
  // {
  //   napi_value filenameKey;
  //   napi_create_string_utf8(env, "filename", 8, &filenameKey);
  //   napi_value filename;
  //   napi_create_string_utf8(env, image->m_filename.data(), image->m_filename.size(), &filename);

  //   napi_set_property(env, result, filenameKey, filename);
  // }

  // // Set "probabilityVector"
  // {
  //   std::string probVecKeyString{ "probabilityVector" };
  //   napi_value probVecKey;
  //   napi_create_string_utf8(env, probVecKeyString.data(), probVecKeyString.size(), &probVecKey);

  //   // Create array
  //   napi_value probVecArr;
  //   napi_create_array(env, &probVecArr);
  //   {
  //     size_t i{ 0ULL };
  //     // for (auto&& probPair : image->m_rawNetRankingSorted)
  //     // {
  //     //   napi_value pair;
  //     //   napi_create_object(env, &pair);

  //     //   // Set "index"
  //     //   {
  //     //     napi_value key;
  //     //     napi_create_string_utf8(env, "index", 5, &key);
  //     //     napi_value value;
  //     //     napi_create_uint32(env, probPair.first, &value);

  //     //     napi_set_property(env, pair, key, value);
  //     //   }

  //     //   // Set "prob"
  //     //   {
  //     //     napi_value key;
  //     //     napi_create_string_utf8(env, "prob", 4, &key);
  //     //     napi_value value;
  //     //     napi_create_double(env, probPair.second, &value);

  //     //     napi_set_property(env, pair, key, value);
  //     //   }

  //     //   napi_set_element(env, probVecArr, i, pair);

  //     //   ++i;
  //     // }

  //   }
  //   napi_set_property(env, result, probVecKey, probVecArr);
  // }

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::GetNearKeywords(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();

  if (length != 5) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

  eKeywordsDataType kwDataType = static_cast<eKeywordsDataType>(info[0].As<Napi::Number>().Uint32Value());
  eImageScoringDataType scoringDataType = static_cast<eImageScoringDataType>(info[1].As<Napi::Number>().Uint32Value());
  Napi::String prefix = info[2].As<Napi::String>();
  size_t numResults = info[3].As<Napi::Number>().Uint32Value();
  Napi::Boolean withExampleImages = info[4].As<Napi::Boolean>();

  std::tuple kwScDataType{ kwDataType, scoringDataType };
  // Get suggested keywords
  std::vector<Keyword*> keywordData;
  try {
    keywordData = this->actualClass_->GetNearKeywords(kwScDataType, prefix.Utf8Value(), numResults, withExampleImages.Value());
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

    std::string descriptionString{ this->actualClass_->GetKeywordDescriptionByWordnetId(kwScDataType, keyword->m_wordnetId) };

    napi_create_string_utf8(env, descriptionString.data(), NAPI_AUTO_LENGTH, &description);

    // Create example images array
    napi_value exampleImagesArr;
    napi_create_array(env, &exampleImagesArr);
    if (withExampleImages)
    {
      size_t ii{ 0ULL };
      for (auto&& imageFilename : keyword->m_exampleImageFilenames)
      {
        napi_value filenameNapi;
        napi_create_string_utf8(env, imageFilename.data(), NAPI_AUTO_LENGTH, &filenameNapi);
        napi_set_element(env, exampleImagesArr, ii, filenameNapi);

        ++ii;
      }
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
  if (length != 9)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C args
  std::tuple<eKeywordsDataType, eImageScoringDataType> kwScDataId;
  Napi::Value kwScDataIdObject = info[0];
  if (kwScDataIdObject.IsObject())
  {
    Napi::Object o = kwScDataIdObject.As<Napi::Object>();

    eKeywordsDataType kwDataType{ static_cast<eKeywordsDataType>(o.Get("keywordsDataType").As<Napi::Number>().Uint32Value()) };
    eImageScoringDataType scoringDataType{ static_cast<eImageScoringDataType>(o.Get("scoringDataType").As<Napi::Number>().Uint32Value()) };

    kwScDataId = std::tuple(kwDataType, scoringDataType);
  }

  std::vector<std::string> queries;
  Napi::Array queriesArray = info[1].As<Napi::Array>();
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
  size_t numResults = info[2].As<Napi::Number>().Uint32Value();

  // Aggregation aggFn
  size_t aggregation = info[3].As<Napi::Number>().Uint32Value();

  // RankingModel rankingModel
  size_t rankingModel = info[4].As<Napi::Number>().Uint32Value();

  // const ModelSettings& settings
  std::vector<std::string> settings;

  Napi::Array settingsArray = info[5].As<Napi::Array>();
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

  Napi::Array aggSettingsArray = info[6].As<Napi::Array>();
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
  size_t imageId = info[7].As<Napi::Number>().Uint32Value();

  bool withOccuranceValue = (info[8].As<Napi::Boolean>()).Value();

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetRelevantImagesWrapper' with args:" << std::endl;
  std::cout << "kwScDataId = (" << ToString(std::get<0>(kwScDataId)) << ", " << ToString(std::get<1>(kwScDataId)) << ")" << std::endl;
  std::cout << "\t queries = " << std::endl;
  for (auto&& query : queries)
  {
    std::cout << "\t\t" << query << std::endl;
  }
  std::cout << "numResults = " << numResults << std::endl;
  std::cout << "InputDataTransformId = " << aggregation << std::endl;
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
  std::cout << "withOccuranceValue = " << withOccuranceValue << std::endl;
  std::cout << "===================" << std::endl;

#endif

  // Call native method: Get vector of relevant images
  std::tuple<std::vector<const Image*>, std::vector<KeywordOccurance>, size_t> images;
  try {
    images = this->actualClass_->GetRelevantImages(
      kwScDataId,
      queries, numResults,
      (InputDataTransformId)aggregation, (RankingModelId)rankingModel,
      settings, aggSettings,
      imageId, withOccuranceValue
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
    napi_create_uint32(env, std::get<2>(images), &value);

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
      for (auto&& image : std::get<0>(images))
      {

        // Construct NAPI return object 
        napi_value imageItem;
        napi_create_object(env, &imageItem);

        // Set "imageId"
        {
          napi_value imageIdKey;
          napi_create_string_utf8(env, "imageId", 7, &imageIdKey);
          napi_value imageId;
          napi_create_uint32(env, image->m_imageId, &imageId);

          napi_set_property(env, imageItem, imageIdKey, imageId);
        }

        // Set "filename"
        {
          napi_value filenameKey;
          napi_create_string_utf8(env, "filename", 8, &filenameKey);
          napi_value filename;
          napi_create_string_utf8(env, image->m_filename.data(), image->m_filename.size(), &filename);

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
  if (length != 9)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRelevantImagesWithSuggestedPlainQuery)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C args

  std::tuple<eKeywordsDataType, eImageScoringDataType> kwScDataId;
  Napi::Value kwScDataIdObject = info[0];
  if (kwScDataIdObject.IsObject())
  {
    Napi::Object o = kwScDataIdObject.As<Napi::Object>();

    eKeywordsDataType kwDataType{ static_cast<eKeywordsDataType>(o.Get("keywordsDataType").As<Napi::Number>().Uint32Value()) };
    eImageScoringDataType scoringDataType{ static_cast<eImageScoringDataType>(o.Get("scoringDataType").As<Napi::Number>().Uint32Value()) };

    kwScDataId = std::tuple(kwDataType, scoringDataType);
  }

  // const std::string& query
  std::string query{ info[1].As<Napi::String>().Utf8Value() };

  // \todo implement properly
  std::vector<std::string> queries;
  queries.push_back(query);

  // size_t numResults
  size_t numResults = info[2].As<Napi::Number>().Uint32Value();

  // Aggregation aggFn
  size_t aggregation = info[3].As<Napi::Number>().Uint32Value();

  // RankingModel rankingModel
  size_t rankingModel = info[4].As<Napi::Number>().Uint32Value();

  // const ModelSettings& settings
  std::vector<std::string> settings;

  Napi::Array settingsArray = info[5].As<Napi::Array>();
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

  Napi::Array aggSettingsArray = info[6].As<Napi::Array>();
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
  size_t imageId = info[7].As<Napi::Number>().Uint32Value();

  bool withOccuranceValue = (info[8].As<Napi::Boolean>()).Value();

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetRelevantImagesWithSuggestedWrapper' with args:" << std::endl;
  std::cout << "query = " << query << std::endl;
  std::cout << "numResults = " << numResults << std::endl;
  std::cout << "InputDataTransformId = " << aggregation << std::endl;
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
  std::tuple<std::vector<const Image*>, std::vector<KeywordOccurance>, size_t> images;
  try {
    images = this->actualClass_->GetRelevantImages(
      kwScDataId,
      queries, numResults,
      (InputDataTransformId)aggregation, (RankingModelId)rankingModel,
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
    napi_create_uint32(env, std::get<2>(images), &value);

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
      // for (auto&& kw : std::get<1>(images))
      // {

      //   // Construct NAPI return object 
      //   napi_value suggKeywordObj;
      //   napi_create_object(env, &suggKeywordObj);

      //   // Set "wordnetId"
      //   {
      //     napi_value wordnetIdKey;
      //     napi_create_string_utf8(env, "wordnetId", NAPI_AUTO_LENGTH, &wordnetIdKey);
      //     napi_value imageId;
      //     napi_create_uint32(env, std::get<0>(kw), &imageId);

      //     napi_set_property(env, suggKeywordObj, wordnetIdKey, imageId);
      //   }

      //   // Set "word"
      //   {
      //     napi_value filenameKey;
      //     napi_create_string_utf8(env, "word", NAPI_AUTO_LENGTH, &filenameKey);
      //     napi_value filename;
      //     napi_create_string_utf8(env, std::get<1>(kw).data(), NAPI_AUTO_LENGTH, &filename);

      //     napi_set_property(env, suggKeywordObj, filenameKey, filename);
      //   }

      //   // Set "frequencyRating"
      //   {
      //     napi_value filenameKey;
      //     napi_create_string_utf8(env, "frequencyRating", NAPI_AUTO_LENGTH, &filenameKey);
      //     napi_value frequencyRating;
      //     napi_create_double(env, std::get<2>(kw), &frequencyRating);

      //     napi_set_property(env, suggKeywordObj, filenameKey, frequencyRating);
      //   }

      //   napi_set_element(env, suggKeywordsArray, i, suggKeywordObj);

      //   ++i;
      // }
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
          napi_create_uint32(env, image->m_imageId, &imageId);

          napi_set_property(env, imageItem, imageIdKey, imageId);
        }

        // Set "filename"
        {
          napi_value filenameKey;
          napi_create_string_utf8(env, "filename", NAPI_AUTO_LENGTH, &filenameKey);
          napi_value filename;
          napi_create_string_utf8(env, image->m_filename.data(), NAPI_AUTO_LENGTH, &filename);

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
  if (length != 9)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  // Transfer JS args to C args

  std::tuple<eKeywordsDataType, eImageScoringDataType> kwScDataId;
  Napi::Value kwScDataIdObject = info[0];
  if (kwScDataIdObject.IsObject())
  {
    Napi::Object o = kwScDataIdObject.As<Napi::Object>();

    eKeywordsDataType kwDataType{ static_cast<eKeywordsDataType>(o.Get("keywordsDataType").As<Napi::Number>().Uint32Value()) };
    eImageScoringDataType scoringDataType{ static_cast<eImageScoringDataType>(o.Get("scoringDataType").As<Napi::Number>().Uint32Value()) };

    kwScDataId = std::tuple(kwDataType, scoringDataType);
  }

  std::vector<std::string> queries;
  Napi::Array queriesArray = info[1].As<Napi::Array>();
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
  size_t numResults = info[2].As<Napi::Number>().Uint32Value();

  // Aggregation aggFn
  size_t aggregation = info[3].As<Napi::Number>().Uint32Value();

  // RankingModel rankingModel
  size_t rankingModel = info[4].As<Napi::Number>().Uint32Value();

  // const ModelSettings& settings
  std::vector<std::string> settings;

  Napi::Array settingsArray = info[5].As<Napi::Array>();
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

  Napi::Array aggSettingsArray = info[6].As<Napi::Array>();
  for (size_t k{ 0ULL }; k < aggSettingsArray.Length(); k++)
  {
    Napi::Value val = aggSettingsArray[k];
    if (val.IsString())
    {
      std::string value = (std::string)val.As<Napi::String>().Utf8Value();
      aggSettings.push_back(value);
    }
  }

  size_t sessionDuation = info[7].As<Napi::Number>().FloatValue();

  // size_t imageId = SIZE_T_ERROR_VALUE
  size_t imageId = info[8].As<Napi::Number>().Uint32Value();

#if LOG_CALLS

  std::cout << "CALLING NATIVE 'GetRelevantImagesWrapper' with args:" << std::endl;
  std::cout << "\t queries = " << std::endl;
  for (auto&& query : queries)
  {
    std::cout << "\t\t" << query << std::endl;
  }
  std::cout << "numResults = " << numResults << std::endl;
  std::cout << "InputDataTransformId = " << aggregation << std::endl;
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
      kwScDataId,
      queries, numResults,
      (InputDataTransformId)aggregation, (RankingModelId)rankingModel,
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


  // "elapsedTime"
  {

    napi_value key;
    napi_create_string_utf8(env, "elapsedTime", NAPI_AUTO_LENGTH, &key);

    napi_value value;
    napi_create_double(env, std::get<0>(durationShotsPair), &value);

    napi_set_property(env, result, key, value);
  }


  // "shots"
  {
    napi_value imagesKey;
    napi_create_string_utf8(env, "shots", NAPI_AUTO_LENGTH, &imagesKey);

    napi_value resultImageArray;
    napi_create_array(env, &resultImageArray);
    {

      size_t i{ 0ULL };
      for (auto&& [videoId, shotId] : std::get<1>(durationShotsPair))
      {

        // Construct NAPI return object 
        napi_value videoShotIdsPair;
        napi_create_object(env, &videoShotIdsPair);

        // Set "videoId"
        {
          napi_value key;
          napi_create_string_utf8(env, "videoId", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_uint32(env, videoId, &value);

          napi_set_property(env, videoShotIdsPair, key, value);
        }

        // Set "shotId"
        {
          napi_value key;
          napi_create_string_utf8(env, "shotId", NAPI_AUTO_LENGTH, &key);
          napi_value value;
          napi_create_uint32(env, shotId, &value);

          napi_set_property(env, videoShotIdsPair, key, value);
        }

        napi_set_element(env, resultImageArray, i, videoShotIdsPair);

        ++i;
      }
    }
    napi_set_property(env, result, imagesKey, resultImageArray);
  }

  return Napi::Object(env, result);

}

#endif