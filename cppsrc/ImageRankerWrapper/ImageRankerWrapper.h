#pragma once



#include <napi.h>
#include "ImageRanker.h"

class ImageRankerWrapper : public Napi::ObjectWrap<ImageRankerWrapper> 
{
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);

  ImageRankerWrapper(const Napi::CallbackInfo& info);
  ImageRanker* GetInternalInstance();


 private:
  static Napi::FunctionReference constructor;
  ImageRanker* actualClass_;

   Napi::Value Initialize(const Napi::CallbackInfo& info);
   
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

  // RETURN FORMAT:
  // const chartData = [
  //   { index: 0, value: 10 },
  //   { index: 1, value: 20 },
  //   { index: 2, value: 30 },
  //   { index: 3, value: 40 },
  //   { index: 4, value: 40.32 },
  //   { index: 5, value: 50.3 },
  //   { index: 6, value: 60.4 }
  // ];
  Napi::Value RunModelTest(const Napi::CallbackInfo& info);


  // ImageData GetImageDataById(size_t imageId) const;
  /*
  struct Image
  {
    size_t m_imageId;
    std::string m_filename;
    std::vector<std::pair<size_t, float>> m_probabilityVector;
    std::vector<std::pair<size_t, uint8_t>> m_booleanProbVector;
  };
  */
  Napi::Value GetImageDataById(const Napi::CallbackInfo& info);


  // std::string GetKeywordByVectorIndex(size_t index) const
  Napi::Value GetKeywordByVectorIndex(const Napi::CallbackInfo& info);

};
