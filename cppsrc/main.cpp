
#include <napi.h>

#include "ImageRanker/ImageRankerWrapper.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  return ImageRankerWrapper::Init(env, exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, InitAll)
