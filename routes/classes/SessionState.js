
// const RankerState = require("./RankerState");

// eslint-disable-next-line max-len
exports.construct = function(dataPack, modelOptions, imagesetId, userLevel = 10) {
  return {
    _userLevel: userLevel,
    _active_data_pack_ID: dataPack,
    _active_model_options: modelOptions,
    _imageset_ID: imagesetId,
    // This is PH for the `RankerState` instance
    _rankerState: null,
    _annotator: {
      // If true then input will accept any string, otherwise just the one
      // combined with words from vocabulary
      _fullyNative: false,
      _autocompleteWithExImgs: true,
      _autocompleteNumResults: 20,
      _imageSequence: null,
      _imageSequenceLen: 1,
    },
  };
};

exports.setActieDataPack = function(obj, dataPackId, modelOpts) {
  obj._active_data_pack_ID = dataPackId;
  obj._active_model_options = modelOpts;
};
exports.getActiveDataPackId = function(obj) {
  return obj._active_data_pack_ID;
};
exports.getActiveDataPackModelOptions = function(obj) {
  return obj._active_model_options;
};

exports.setActieModelOptions = function(obj, newValue) {
  obj._active_model_options = newValue;
};
exports.getActieModelOptions = function(obj) {
  return obj._active_model_options;
};

exports.setActieImageset = function(obj, newValue) {
  obj._imageset_ID = newValue;
};
exports.getActieImageset = function(obj) {
  return obj._imageset_ID;
};

exports.setRandFrameSeqLength = function(obj, newValue) {
  obj._annotator._imageSequenceLen = newValue;
};
exports.getRandFrameSeqLength = function(obj) {
  return obj._annotator._imageSequenceLen;
};

exports.setUserLevel = function(obj, newValue) {
  obj._userLevel = newValue;
};
exports.getUserLevel = function(obj) {
  return obj._userLevel;
};

exports.setAnnotWithExampleImages = function(obj, newValue) {
  obj._annotator._autocompleteWithExImgs = newValue;
};
exports.getAnnotWithExampleImages = function(obj) {
  return obj._annotator._autocompleteWithExImgs;
};

exports.setAnnotNumResults = function(obj, newValue) {
  obj._annotator._autocompleteNumResults = newValue;
};
exports.getAnnotNumResults = function(obj) {
  return obj._annotator._autocompleteNumResults;
};

exports.setAnnotImageSquence = function(obj, newValue) {
  obj._annotator._imageSequence = newValue;
};
exports.getAnnotImageSquence = function(obj) {
  return obj._annotator._imageSequence;
};

exports.setAnnotFullyNative = function(obj, newValue) {
  obj._annotator._fullyNative = newValue;
};
exports.getAnnotFullyNative = function(obj) {
  return obj._annotator._fullyNative;
};
