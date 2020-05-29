#include "common.h"
#include "utility.h"

#include "ImageRankerWrapper.h"

#include <stdexcept>

#include "KeywordsContainer.h"

using namespace image_ranker;

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
    InstanceMethod("getFrameDetailData", &ImageRankerWrapper::get_frame_detail_data),
    InstanceMethod("getSearchSessionsRnkProgressCharData", &ImageRankerWrapper::get_search_sessions_rank_progress_chart_data),
    InstanceMethod("getHistogramUsedLabels", &ImageRankerWrapper::get_histogram_used_labels) });

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports.Set("ImageRankerWrapper", func);

  return exports;
}

ImageRankerWrapper::ImageRankerWrapper(const Napi::CallbackInfo& info) : Napi::ObjectWrap<ImageRankerWrapper>(info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  LOGI("Initializing ImageRanker...");

  // Process arguments
  int length = info.Length();

  if (length != 2)
  {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

  // Arg1: string
  std::string data_info_fpth = info[0].As<Napi::String>().Utf8Value();

  // Arg2: string
  std::string data_dir = info[1].As<Napi::String>().Utf8Value();

  ImageRanker::Config cfg =
    ImageRanker::parse_data_config_file(ImageRanker::eMode::cFullAnalytical, data_info_fpth, data_dir);

  try
  {
    this->actualClass_ = new ImageRanker(cfg);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  LOGI("ImageRanker initialized.");
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
    bool is_initial = dict.Get("isInitial").As<Napi::Boolean>().Value();

    actions.emplace_back(InteractiveSearchAction{ query_idx, action, operand, operand_readable, final_rank, time, is_initial });
  }

  // Call native method
  try
  {
    this->actualClass_->submit_search_session(
      data_pack_ID, model_commands, user_level, with_example_images, target_frame_ID, eSearchSessionEndStatus(found), duration, session_ID, actions);
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
  if (length != 6)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetImageKeywordsForInteractiveSearch)").ThrowAsJavaScriptException();
  }

  FrameId frame_ID = info[0].As<Napi::Number>().Uint32Value();
  std::string data_pack_ID = info[1].As<Napi::String>().Utf8Value();
  std::string imageset_ID = info[2].As<Napi::String>().Utf8Value();
  std::string model_options = info[3].As<Napi::String>().Utf8Value();
  bool with_example_frames = info[4].As<Napi::Boolean>().Value();
  bool accumulated = info[5].As<Napi::Boolean>().Value();

  // Call native method
  FrameDetailData frame_detail_data{};
  try
  {
    frame_detail_data = this->actualClass_->get_frame_detail_data(
      frame_ID, data_pack_ID, model_options, with_example_frames, accumulated);
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
          napi_create_string_utf8(env, p_kw->word.c_str(), NAPI_AUTO_LENGTH, &value);

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
            for (auto&& filename : p_kw->example_frames_filenames)
            {
              napi_value val;
              napi_create_string_utf8(env, (imageset_ID + "/" + filename).data(), NAPI_AUTO_LENGTH, &val);
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

Napi::Value ImageRankerWrapper::get_search_sessions_rank_progress_chart_data(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 5)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetImageKeywordsForInteractiveSearch)").ThrowAsJavaScriptException();
  }

  std::string data_pack_ID = info[0].As<Napi::String>().Utf8Value();
  std::string model_options = info[1].As<Napi::String>().Utf8Value();
  size_t max_user_level = info[2].As<Napi::Number>().Uint32Value();
  size_t min_samples = info[3].As<Napi::Number>().Uint32Value();
  bool normalize = info[4].As<Napi::Boolean>().Value();

  // Call native method
  SearchSessRankChartData chart_data{};
  try
  {
    chart_data = this->actualClass_->get_search_sessions_rank_progress_chart_data(data_pack_ID, model_options, max_user_level, min_samples, normalize);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  napi_value result;
  napi_create_object(env, &result);

  // "median_multichart"
  {

    napi_value top_key;
    napi_create_string_utf8(env, "median_multichart", NAPI_AUTO_LENGTH, &top_key);

    napi_value top_dict;
    napi_create_object(env, &top_dict);

    // "x"
    {
      napi_value subtop_key;
      napi_create_string_utf8(env, "x", NAPI_AUTO_LENGTH, &subtop_key);

      napi_value subtop_val;
      napi_create_array(env, &subtop_val);
      {
        size_t i{ 0_z };
        for (auto&& vec : chart_data.median_multichart.x)
        {
          napi_value bott_arr;
          napi_create_array(env, &bott_arr);

          // Fill in medians
          {
            size_t ii{ 0_z };
            for (auto&& x : vec)
            {
              napi_value napix;
              napi_create_uint32(env, x, &napix);

              napi_set_element(env, bott_arr, ii, napix);
              ++ii;
            }
          }

          napi_set_element(env, subtop_val, i, bott_arr);

          ++i;
        }
      }

      napi_set_property(env, top_dict, subtop_key, subtop_val);
    }

    // "medians"
    {
      napi_value subtop_key;
      napi_create_string_utf8(env, "fx", NAPI_AUTO_LENGTH, &subtop_key);

      napi_value subtop_val;
      napi_create_array(env, &subtop_val);
      {
        size_t i{ 0_z };
        for (auto&& vec : chart_data.median_multichart.medians)
        {
          napi_value bott_arr;
          napi_create_array(env, &bott_arr);

          // Fill in medians
          {
            size_t ii{ 0_z };
            for (auto&& x : vec)
            {
              napi_value napix;
              napi_create_double(env, float(x), &napix);

              napi_set_element(env, bott_arr, ii, napix);
              ++ii;
            }
          }

          napi_set_element(env, subtop_val, i, bott_arr);

          ++i;
        }
      }

      napi_set_property(env, top_dict, subtop_key, subtop_val);
    }

    napi_set_property(env, result, top_key, top_dict);
  }

  // "aggregate_quantile_chart"
  {
    napi_value top_key;
    napi_create_string_utf8(env, "aggregate_quantile_chart", NAPI_AUTO_LENGTH, &top_key);

    // Construct NAPI return object
    napi_value result_aggregated;
    napi_create_object(env, &result_aggregated);

    // Set "x"
    {
      napi_value key;
      napi_create_string_utf8(env, "x", NAPI_AUTO_LENGTH, &key);

      // Create array
      napi_value arr;
      napi_create_array(env, &arr);
      {
        size_t i{ 0_z };
        for (auto&& p_kw : chart_data.aggregate_quantile_chart.x)
        {
          napi_value value;
          napi_create_uint32(env, uint32_t(p_kw), &value);

          napi_set_element(env, arr, i, value);

          ++i;
        }
      }

      napi_set_property(env, result_aggregated, key, arr);
    }

    // Set "y_min"
    {
      napi_value key;
      napi_create_string_utf8(env, "y_min", NAPI_AUTO_LENGTH, &key);

      // Create array
      napi_value arr;
      napi_create_array(env, &arr);
      {
        size_t i{ 0_z };
        for (auto&& p_kw : chart_data.aggregate_quantile_chart.y_min)
        {
          napi_value value;
          napi_create_double(env, p_kw, &value);

          napi_set_element(env, arr, i, value);

          ++i;
        }
      }

      napi_set_property(env, result_aggregated, key, arr);
    }

    // Set "y_q1"
    {
      napi_value key;
      napi_create_string_utf8(env, "y_q1", NAPI_AUTO_LENGTH, &key);

      // Create array
      napi_value arr;
      napi_create_array(env, &arr);
      {
        size_t i{ 0_z };
        for (auto&& p_kw : chart_data.aggregate_quantile_chart.y_q1)
        {
          napi_value value;
          napi_create_double(env, p_kw, &value);

          napi_set_element(env, arr, i, value);

          ++i;
        }
      }

      napi_set_property(env, result_aggregated, key, arr);
    }

    // Set "y_q2"
    {
      napi_value key;
      napi_create_string_utf8(env, "y_q2", NAPI_AUTO_LENGTH, &key);

      // Create array
      napi_value arr;
      napi_create_array(env, &arr);
      {
        size_t i{ 0_z };
        for (auto&& p_kw : chart_data.aggregate_quantile_chart.y_q2)
        {
          napi_value value;
          napi_create_double(env, p_kw, &value);

          napi_set_element(env, arr, i, value);

          ++i;
        }
      }

      napi_set_property(env, result_aggregated, key, arr);
    }

    // Set "y_q3"
    {
      napi_value key;
      napi_create_string_utf8(env, "y_q3", NAPI_AUTO_LENGTH, &key);

      // Create array
      napi_value arr;
      napi_create_array(env, &arr);
      {
        size_t i{ 0_z };
        for (auto&& p_kw : chart_data.aggregate_quantile_chart.y_q3)
        {
          napi_value value;
          napi_create_double(env, p_kw, &value);

          napi_set_element(env, arr, i, value);

          ++i;
        }
      }

      napi_set_property(env, result_aggregated, key, arr);
    }

    // Set "y_max"
    {
      napi_value key;
      napi_create_string_utf8(env, "y_max", NAPI_AUTO_LENGTH, &key);

      // Create array
      napi_value arr;
      napi_create_array(env, &arr);
      {
        size_t i{ 0_z };
        for (auto&& p_kw : chart_data.aggregate_quantile_chart.y_max)
        {
          napi_value value;
          napi_create_double(env, p_kw, &value);

          napi_set_element(env, arr, i, value);

          ++i;
        }
      }

      napi_set_property(env, result_aggregated, key, arr);
    }
    napi_set_property(env, result, top_key, result_aggregated);
  }

  return Napi::Object(env, result);
}

Napi::Value ImageRankerWrapper::get_histogram_used_labels(const Napi::CallbackInfo& info)
{
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);

  // Process arguments
  int length = info.Length();
  if (length != 5)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetImageKeywordsForInteractiveSearch)").ThrowAsJavaScriptException();
  }

  std::string data_pack_ID = info[0].As<Napi::String>().Utf8Value();
  std::string model_options = info[1].As<Napi::String>().Utf8Value();
  size_t num_points = info[2].As<Napi::Number>().Uint32Value();
  bool accumulated = info[3].As<Napi::Boolean>().Value();
  size_t max_user_level = info[4].As<Napi::Number>().Uint32Value();

  // Call native method
  HistogramChartData<size_t, float> chart_data{};
  try
  {
    chart_data = this->actualClass_->get_histogram_used_labels(data_pack_ID, model_options, num_points, accumulated, max_user_level);
  }
  catch (const std::exception& e)
  {
    Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
  }

  // Construct NAPI return object
  napi_value result;
  napi_create_object(env, &result);

  // Set "x"
  {
    napi_value key;
    napi_create_string_utf8(env, "x", NAPI_AUTO_LENGTH, &key);

    // Create array
    napi_value arr;
    napi_create_array(env, &arr);
    {
      size_t i{ 0_z };
      for (auto&& p_kw : chart_data.x)
      {
        napi_value value;
        napi_create_uint32(env, uint32_t(p_kw), &value);

        napi_set_element(env, arr, i, value);

        ++i;
      }
    }

    napi_set_property(env, result, key, arr);
  }

  // Set "fx"
  {
    napi_value key;
    napi_create_string_utf8(env, "fx", NAPI_AUTO_LENGTH, &key);

    // Create array
    napi_value arr;
    napi_create_array(env, &arr);
    {
      size_t i{ 0_z };
      for (auto&& p_kw : chart_data.fx)
      {
        napi_value value;
        napi_create_double(env, p_kw, &value);

        napi_set_element(env, arr, i, value);

        ++i;
      }
    }

    napi_set_property(env, result, key, arr);
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
  try
  {
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
    // size_t num_frames;
    {
      napi_value key;
      napi_create_string_utf8(env, "num_frames", NAPI_AUTO_LENGTH, &key);
      napi_value value;
      napi_create_uint32(env, dp_info.num_frames, &value);

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

  if (length != 6)
  {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

  std::string data_pack_ID = info[0].As<Napi::String>().Utf8Value();
  std::string imageset_ID = info[1].As<Napi::String>().Utf8Value();
  std::string prefix = info[2].As<Napi::String>().Utf8Value();
  size_t numResults = info[3].As<Napi::Number>().Uint32Value();
  bool withExampleImages = info[4].As<Napi::Boolean>().Value();
  std::string model_options = info[5].As<Napi::String>().Utf8Value();

  // Get suggested keywords
  AutocompleteInputResult keywordData;
  try
  {
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
      napi_create_string_utf8(env, keyword->word.data(), NAPI_AUTO_LENGTH, &value);

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
        for (auto&& nat_filename : keyword->example_frames_filenames)
        {
          napi_value filename;
          napi_create_string_utf8(env, (imageset_ID + "/" + nat_filename).data(), NAPI_AUTO_LENGTH, &filename);

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
  if (length != 3)
  {
    Napi::TypeError::New(env, "Wrong number of parameters (ImageRankerWrapper::GetRandomImage)").ThrowAsJavaScriptException();
  }

  std::string imageset_ID = info[0].As<Napi::String>().Utf8Value();
  std::string data_pack_ID = info[1].As<Napi::String>().Utf8Value();
  size_t seqLength = info[2].As<Napi::Number>().Uint32Value();

  // Call native method
  std::vector<const SelFrame*> frames_sequence;
  try
  {
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
      napi_create_string_utf8(env, (imageset_ID + "/" + image->m_filename).data(), NAPI_AUTO_LENGTH, &filename);

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
          target_sequence };

      user_queries.emplace_back(std::move(query));
    }
  }

  // Call native method
  std::vector<GameSessionQueryResult> game_results;
  try
  {
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
      napi_create_string_utf8(env, (data_pack_ID + "/" + g_res.frame_filename).data(), NAPI_AUTO_LENGTH, &value);

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

  if (length != 7)
  {
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
  std::string imageset_ID = info[2].As<Napi::String>().Utf8Value();
  std::string model_options = info[3].As<Napi::String>().Utf8Value();
  bool native_queries = info[4].As<Napi::Boolean>().Value();
  size_t resulst_size = size_t(info[5].As<Napi::Number>().Uint32Value());
  FrameId target_frame_ID = FrameId(info[6].As<Napi::Number>().Uint32Value());

  // Get suggested keywords
  RankingResultWithFilenames rankingResult{};
  try
  {
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
        napi_create_string_utf8(env, (imageset_ID + "/" + filename).c_str(), NAPI_AUTO_LENGTH, &value);

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

  if (length != 5)
  {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }

  eUserQueryOrigin query_origin = eUserQueryOrigin(info[0].As<Napi::Number>().Uint32Value());
  std::string data_pack_ID = info[1].As<Napi::String>().Utf8Value();
  std::string model_options = info[2].As<Napi::String>().Utf8Value();
  bool native_queries = info[3].As<Napi::Boolean>().Value();
  size_t num_points = size_t(info[4].As<Napi::Number>().Uint32Value());

  ModelTestResult test_results;
  try
  {
    test_results = this->actualClass_->run_model_test(query_origin, data_pack_ID, model_options, native_queries, num_points);
  }
  catch (const NotSuportedModelOptionExcept& ex)
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

    size_t i{ 0 };
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
