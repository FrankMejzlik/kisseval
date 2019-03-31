#pragma once

#include <napi.h>
#include "src/ImageRanker.h"

class ImageRankerWrapper : public Napi::ObjectWrap<ImageRankerWrapper> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);

  ImageRankerWrapper(const Napi::CallbackInfo& info);
  ImageRanker* GetInternalInstance();


 private:
  static Napi::FunctionReference constructor;
  ImageRanker* actualClass_;


  // std::vector<GameSessionQueryResult> SubmitUserQueriesWithResults(std::vector<GameSessionInputQuery> inputQueries, QueryOrigin origin = QueryOrigin::cPublic);
  Napi::Value SubmitUserQueriesWithResults(const Napi::CallbackInfo& info);

  //ImageRanker::ImageReference GetRandomImage() const;
  Napi::Value GetRandomImage(const Napi::CallbackInfo& info);

  //ImageRanker::ImageReference GetNearKeywords(const std::string& prefix);
  Napi::Value GetNearKeywords(const Napi::CallbackInfo& info);
};
