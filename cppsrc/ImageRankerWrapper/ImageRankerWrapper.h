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

   // std::vector<std::pair<TestSettings, ChartData>> RunGridTest(const std::vector<TestSettings>& testSettings);
   /*
    NATIVE RETURN FORMAT:
    [
      (
          (
            ImageRanker::Aggregation,
            ImageRanker::RankingModel,
            ImageRanker::QueryOrigin,
            [ "opt1","opt2", ...]
          ),        
         [
           (0, 10.2)
           (10, 11.6),
           (20, 12.15),
           (30, 13.3),
           (40, 14.1),
           (50, 15.1),
           ...
         ]
      ), 
     ... ]


    DYNAMIC RETURN FORMAT:
    [
      { "testSettings":
          {
            "aggregation": 1,
            "rankingModel" 2,
            "queryOrigin": 3,
            "modelOptions" :[ "opt1", "opt2", ...]
          },
         "chartData": [
           { index: 0, value: 10.6 },
           { index: 1, value: 11.3 },
           ...
         ]
      },
     ... ]
   */
   Napi::Value RunGridTest(const Napi::CallbackInfo& info);

   Napi::Value SubmitInteractiveSearchSubmit(const Napi::CallbackInfo& info);

   // std::pair<uint8_t, uint8_t> GetGridTestProgress() const;
   /*
   RETURN FORMAT:
      (numCompletedTests, numTests)

      e.g.
      (244, 500)
   
   DYNAMIC RETURN FORMAT:
    { "numCompletedTests": 244, "numTests": 500 }
   */
   Napi::Value GetGridTestProgress(const Napi::CallbackInfo& info);
   
   Napi::Value ExportDataFile(const Napi::CallbackInfo& info);
   Napi::Value GetGeneralStatistics(const Napi::CallbackInfo& info);
   

   


   Napi::Value GetStatisticsUserKeywordAccuracy(const Napi::CallbackInfo& info);


  // std::vector<GameSessionQueryResult> SubmitUserQueriesWithResults(std::vector<GameSessionInputQuery> inputQueries, QueryOrigin origin = QueryOrigin::cPublic);
  Napi::Value SubmitUserQueriesWithResults(const Napi::CallbackInfo& info);
  Napi::Value SubmitUserDataNativeQueries(const Napi::CallbackInfo& info);


  Napi::Value GetRelevantImagesWithSuggestedPlainQuery(const Napi::CallbackInfo& info);

  //ImageRanker::std::string GetRandomImage() const;
  Napi::Value GetRandomImage(const Napi::CallbackInfo& info);

  Napi::Value GetCouplingImage(const Napi::CallbackInfo& info);
  Napi::Value GetCouplingImageNative(const Napi::CallbackInfo& info);
  
  Napi::Value GetRandomImageSequence(const Napi::CallbackInfo& info);

  //ImageRanker::std::string GetNearKeywords(const std::string& prefix);
  Napi::Value GetNearKeywords(const Napi::CallbackInfo& info);

  //std::vector<std::string> GetRelevantImages(const std::string& query, RankingModel rankingModel = DEFAULT_RANKING_MODEL) const;
  /* DYNAMIC RETURN:
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
  Napi::Value GetRelevantImagesPlainQuery(const Napi::CallbackInfo& info);

  Napi::Value GetKeywordDataById(const Napi::CallbackInfo& info);
  Napi::Value TrecvidGetRelevantShots(const Napi::CallbackInfo& info);

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

  Napi::Value GetImageKeywordsForInteractiveSearch(const Napi::CallbackInfo& info);


  // std::string GetKeywordByVectorIndex(size_t index) const
  Napi::Value GetKeywordByVectorIndex(const Napi::CallbackInfo& info);

};
