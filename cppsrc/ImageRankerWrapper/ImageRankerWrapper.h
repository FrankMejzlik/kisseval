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

  Napi::Value get_loaded_data_packs_info(const Napi::CallbackInfo& info);
  Napi::Value get_autocomplete_results(const Napi::CallbackInfo& info);
  Napi::Value get_random_frame_sequence(const Napi::CallbackInfo& info);
  Napi::Value submit_annotator_user_queries(const Napi::CallbackInfo& info);
  Napi::Value rank_frames(const Napi::CallbackInfo& info);
  Napi::Value run_model_test(const Napi::CallbackInfo& info);

  Napi::Value submit_search_session(const Napi::CallbackInfo& info);
  Napi::Value get_frame_detail_data(const Napi::CallbackInfo& info);

};
