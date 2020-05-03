// const RankerState = require("./RankerState");

// eslint-disable-next-line max-len
exports.construct = function (dataPack, modelOptions, dataPackType, imagesetId, userLevel = 1) {
  return {
    _userLevel: userLevel,
    _active_data_pack_ID: dataPack,
    _active_data_pack_type: dataPackType,
    _active_model_options: modelOptions,
    _imageset_ID: imagesetId,
    _ranker: {
      activeDataPackId: dataPack,
      _fullyNative: false,
      activeModelOptions: modelOptions,
      ui: {
        queryInputUnlocked: false,
        queryInput2Unlocked: false,
        queryWords: [],
        query: [],
        queryWords2: [],
        query2: [],
      },
      searchSession: null,
    },
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

exports.setActieDataPack = function (obj, dataPackId, modelOpts, packType) {
  obj._active_data_pack_ID = dataPackId;
  obj._active_data_pack_type = packType;
  obj._ranker.activeDataPackId = dataPackId;
  obj._ranker.activeModelOptions = modelOpts;

  obj._active_model_options = dataPackId;

  // If native pack
  if (packType == "W2VV_based") {
    obj._annotator._fullyNative = true;
    obj._ranker._fullyNative = true;
  } else {
    obj._annotator._fullyNative = false;
    obj._ranker._fullyNative = false;
  }
};
exports.getActiveDataPackId = function (obj) {
  return obj._active_data_pack_ID;
};
exports.getActiveDataPackModelOptions = function (obj) {
  return obj._active_model_options;
};
exports.getActiveDataPackType = function (obj) {
  return obj._active_data_pack_type;
};

exports.setActieModelOptions = function (obj, newValue) {
  obj._active_model_options = newValue;
};
exports.getActieModelOptions = function (obj) {
  return obj._active_model_options;
};

exports.setActieImageset = function (obj, newValue) {
  obj._imageset_ID = newValue;
};
exports.getActieImageset = function (obj) {
  return obj._imageset_ID;
};

exports.setRandFrameSeqLength = function (obj, newValue) {
  obj._annotator._imageSequenceLen = newValue;
};
exports.getRandFrameSeqLength = function (obj) {
  return obj._annotator._imageSequenceLen;
};

exports.setUserLevel = function (obj, newValue) {
  obj._userLevel = newValue;
};
exports.getUserLevel = function (obj) {
  return obj._userLevel;
};

exports.setAnnotWithExampleImages = function (obj, newValue) {
  obj._annotator._autocompleteWithExImgs = newValue;
};
exports.getAnnotWithExampleImages = function (obj) {
  return obj._annotator._autocompleteWithExImgs;
};

exports.setAnnotNumResults = function (obj, newValue) {
  obj._annotator._autocompleteNumResults = newValue;
};
exports.getAnnotNumResults = function (obj) {
  return obj._annotator._autocompleteNumResults;
};

exports.setAnnotImageSquence = function (obj, newValue) {
  obj._annotator._imageSequence = newValue;
};
exports.getAnnotImageSquence = function (obj) {
  return obj._annotator._imageSequence;
};

exports.setAnnotFullyNative = function (obj, newValue) {
  obj._annotator._fullyNative = newValue;
};
exports.getAnnotFullyNative = function (obj) {
  return obj._annotator._fullyNative;
};

/*************************************
 * Ranker
 **************************************/

exports.ranker_getState = function (obj) {
  /* UI can be in 3 states only:
      "nosess":   
          No session is running and previous one was canceled (if there was some previous)
      
      "running": 
          Search session in progress - chart showing, timer running

      "finished": 
          Search session is finished - results showing
    */

  const ssess = obj._ranker.searchSession;

  let resState = "nosess";

  if (ssess) {
    if (ssess.running) resState = "running";
    else resState = "finished";
  }

  return resState;
};

exports.ranker_getUserQuery = function (obj, idx) {
  return {
    query: obj._ranker.ui.query,
    wordQuery: obj._ranker.ui.queryWords,
  };
};

exports.ranker_getUserQueryStrings = function (obj) {
  const q1Ids = obj._ranker.ui.query;

  let res = [];
  // \todo Make temporal
  let queryStr = "&";
  for (let kwId of q1Ids) {
    queryStr += "-" + kwId + "+";
  }
  res.push(queryStr);

  return res;
};

exports.ranker_setFullyNative = function (obj, newValue) {
  obj._ranker._fullyNative = newValue;
};

exports.ranker_getFullyNative = function (obj) {
  return obj._ranker._fullyNative;
};

exports.ranker_getData = function (obj) {
  return obj._ranker;
};

exports.ranker_getCurrentSearchSession = function (obj) {
  return obj._ranker.searchSession;
};

exports.ranker_getCurrentUiState = function (obj, newOpts) {
  return obj._ranker.ui;
};

exports.ranker_setActiveModelOptions = function (obj, newOpts) {
  obj._ranker.activeModelOptions = newOpts;

  this.ranker_goToState_nosess(obj);
};

exports.ranker_getActiveModelOptions = function (obj) {
  return obj._ranker.activeModelOptions;
};

exports.ranker_getDataPackId = function (obj) {
  return obj._ranker.activeDataPackId;
};

exports.ranker_processQueryAction = function (obj, queryIdx, action, kw_ID, word) {
  if (action == "delete_from_query") {
    // Find it & remove it
    for (let i = 0; i < obj._ranker.ui.query.length; ++i) {
      if (obj._ranker.ui.query[i] == kw_ID && obj._ranker.ui.queryWords[i] == word) {
        obj._ranker.ui.query.splice(i, 1);
        obj._ranker.ui.queryWords.splice(i, 1);
        break;
      }
    }
  } else {
    obj._ranker.ui.query.push(kw_ID);
    obj._ranker.ui.queryWords.push(word);
  }
};

/**
 * Cancels current search session.
 */
exports.ranker_goToState_nosess = function (obj) {
  obj._ranker = {
    _fullyNative: false,
    activeDataPackId: obj._active_data_pack_ID,
    activeModelOptions: obj._ranker.activeModelOptions,
    ui: {
      queryInputUnlocked: false,
      queryInput2Unlocked: false,
      queryWords: [],
      query: [],
      queryWords2: [],
      query2: [],
    },
    searchSession: null,
  };
};

/**
 * Start new search session
 */
exports.ranker_goToState_running = function (obj, targetFramesIds) {
  this.ranker_ui_goToState_running(obj);

  // Search session dict
  obj._ranker.searchSession = {
    targetFramesIds: targetFramesIds,
    running: true,
    startTs: Date.now(),
    endTs: null,
    duration: null,
    found: null,
    actions: [],
  };
};

/**
 * Search session is finished (Found or Given up)
 */
exports.ranker_goToState_finished = function (obj, found = false) {
  this.ranker_ui_goToState_finished(obj);

  obj._ranker.searchSession.running = false;
  obj._ranker.searchSession.endTs = Date.now();
  obj._ranker.searchSession.duration = (obj._ranker.searchSession.endTs - obj._ranker.searchSession.startTs) ;
  obj._ranker.searchSession.found = found;
};

exports.ranker_ui_goToState_nosess = function (obj) {
  obj._ranker.ui.queryWords = [];
  obj._ranker.ui.query = [];
  obj._ranker.ui.queryWords2 = [];
  obj._ranker.ui.query2 = [];

  obj._ranker.ui.queryInputUnlocked = true;
  obj._ranker.ui.queryInput2Unlocked = true;
};

exports.ranker_ui_goToState_running = function (obj) {
  obj._ranker.ui.queryWords = [];
  obj._ranker.ui.query = [];
  obj._ranker.ui.queryWords2 = [];
  obj._ranker.ui.query2 = [];

  obj._ranker.ui.queryInputUnlocked = true;
  obj._ranker.ui.queryInput2Unlocked = true;
};

exports.ranker_ui_goToState_finished = function (obj) {
  obj._ranker.ui.queryWords = [];
  obj._ranker.ui.query = [];
  obj._ranker.ui.queryWords2 = [];
  obj._ranker.ui.query2 = [];

  obj._ranker.ui.queryInputUnlocked = false;
  obj._ranker.ui.queryInput2Unlocked = false;
};

exports.pushSearchSessionAction = function (obj, query_idx, action, operand, score, time_in_ms, word) {
  const act = {
    queryIdx: query_idx,
    action: action,
    operand: String(operand),
    score: score,
    time: time_in_ms,
    word: word,
  };

  obj._ranker.searchSession.actions.push(act);
};

exports.getSearchSessionActionsForChart = function (obj) {
  let chartLabels = [];
  let chartXs = [];
  let chartFxs = [];
  const actionsArr = obj._ranker.searchSession.actions;
  for (let a of actionsArr) {
    chartLabels.push(`${a.action}(${a.word})`);
    chartXs.push(a.time);
    chartFxs.push(a.score);
  }

  return {
    labels: chartLabels,
    xs: chartXs,
    fxs: chartFxs,
  };
};
