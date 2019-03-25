#include "ImageRankerWrapper.h"

Napi::FunctionReference ImageRankerWrapper::constructor;

Napi::Object ImageRankerWrapper::Init(Napi::Env env, Napi::Object exports) {
  Napi::HandleScope scope(env);

  Napi::Function func = DefineClass(env, "ImageRankerWrapper", {
    InstanceMethod("GetNearKeywords", &ImageRankerWrapper::GetNearKeywords)
    //InstanceMethod("GetImageFilepathByIndex", &ImageRankerWrapper::GetImageFilepathByIndex),
    //InstanceMethod("GetRandomInteger", &ImageRankerWrapper::GetRandomInteger),
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
  
  if (length != 4) {
    Napi::TypeError::New(env, "Wrong number of parameters").ThrowAsJavaScriptException();
  }


  Napi::String imagesPath = info[0].As<Napi::String>();
  Napi::String probabilityVectorFilepath = info[1].As<Napi::String>();
  Napi::String deepFeaturesFilepath = info[2].As<Napi::String>();
  Napi::String keywordClassesFilepath = info[3].As<Napi::String>();


  this->actualClass_ = new ImageRanker(
    imagesPath.Utf8Value(),
    probabilityVectorFilepath.Utf8Value(),
    deepFeaturesFilepath.Utf8Value(),
    keywordClassesFilepath.Utf8Value()
  );
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


// Napi::Value ImageRankerWrapper::Add(const Napi::CallbackInfo& info) {
//   Napi::Env env = info.Env();
//   Napi::HandleScope scope(env);

//   if (info.Length() != 1 || !info[0].IsNumber()) {
//     Napi::TypeError::New(env, "Number expected").ThrowAsJavaScriptException();
//   }

//   Napi::Number toAdd = info[0].As<Napi::Number>();
//   double answer = this->actualClass_->add(toAdd.DoubleValue());

//   return Napi::Number::New(info.Env(), answer);
// }

// ActualClass* ImageRankerWrapper::GetInternalInstance() {
//   return this->actualClass_;
// }