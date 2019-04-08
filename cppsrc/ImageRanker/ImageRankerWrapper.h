#pragma once

#define LOG_CALLS 1

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

  //std::vector<ImageReference> GetRelevantImages(const std::string& query, RankingModel rankingModel = DEFAULT_RANKING_MODEL) const;
  /* RETURN:
  [
    {
      "imageId" : 1234,
      "filename": fefef.jpg
    },
    {
      "imageId" : 1233314,
      "filename": fefefaf.jpg
    }
    ...
  ]

  */
  Napi::Value GetRelevantImages(const Napi::CallbackInfo& info);

};
