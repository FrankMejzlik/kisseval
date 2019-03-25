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

  std::vector<size_t> ids = this->actualClass_->GetNearKeywords("do");

  napi_value result;
  napi_create_array(env, &result);


  napi_value num_result;

  size_t i = 0ULL;
  for (auto&& id : ids) {
      napi_create_uint32(env, id, &num_result);

      napi_set_element(env, result, i, num_result);
      ++i;
  }

  //return Napi::Value::Value(env, result);

  Napi::Object oooobl(env, result);

  return oooobl;
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