#pragma once

#include <napi.h>
#include "src/ImageRanker.h"

class ImageRankerWrapper : public Napi::ObjectWrap<ImageRankerWrapper> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);


  ImageRankerWrapper(const Napi::CallbackInfo& info);


  ImageRanker* GetInternalInstance();


  
  //Napi::Value GetImageFilepathByIndex(const Napi::CallbackInfo& info);
  //Napi::Value GetRandomInteger(const Napi::CallbackInfo& info);


 private:
  static Napi::FunctionReference constructor;
  Napi::Value GetNearKeywords(const Napi::CallbackInfo& info);

  ImageRanker* actualClass_;
};
