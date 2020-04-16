var express = require("express");

var path = require("path");
var fs = require("fs");

var router = express.Router();

const utils = require("../routes/utils/utils");

const routeSettings = {
  slug: "statistics",
};

function PreProcessReq(req, viewData) {
  // Get session object reference
  const sess = req.session;

  // Do general request preprocess
  utils.PreProcessReq(req, viewData, routeSettings);

  if (typeof global.exportedFiles === "undefined") {
    global.exportedFiles = {
      id0: {
        id0: {
          eKeywordClasses: global.gConfig.exportDir + "keyword_classes.0.0.txt",
          eUserAnnotatorQueries: false,
          eNetNormalizedScores: false,
        },
      },
      id100: {
        id100: {
          eKeywordClasses:
            global.gConfig.exportDir + "keyword_classes.100.100.txt",
          eUserAnnotatorQueries: false,
          eNetNormalizedScores: false,
          eQueryNumHits: false,
        },
      },
    };
  }

  viewData.exportedFiles = global.exportedFiles;
  viewData.currentPage = routeSettings.slug;
}

function ProcessReq(req, viewData) {
  let sess = req.session;

  const kwScDataType1 = {
    keywordsDataType: 0,
    scoringDataType: 0,
  };

  const kwScDataType2 = {
    keywordsDataType: 100,
    scoringDataType: 100,
  };

  // Get general statistigs
  statObjViret = global.imageRanker.GetGeneralStatistics(kwScDataType1, 999);
  statObjGoogle = global.imageRanker.GetGeneralStatistics(kwScDataType2, 999);

  viewData.statistics = {
    statObjViret: statObjViret,
    statObjGoogle: statObjGoogle,
  };
}

function PostProcessReq(req, viewData) {
  let sess = req.session;

  utils.PostProcessReq(req, viewData, routeSettings);
}

// GET request on '/'
router.get("/", function (req, res, next) {
  let sess = req.session;
  let viewData = {
    ui: {
      ranker: {
        queryInputUnlocked: false,
        queryInput2Unlocked: false,
      },
    },
  };

  PreProcessReq(req, viewData);
  ProcessReq(req, viewData);

  // global.logger.log('debug', "sess.ranker:"+ JSON.stringify(sess.ranker, undefined, 4));

  // const pairNonhyperHyper = global.imageRanker.GetStatisticsUserKeywordAccuracy(999);

  // viewData.nonHyper = pairNonhyperHyper.nonhyper;
  // viewData.nonHyper.misc.percentage =  pairNonhyperHyper.nonhyper.misc.percentage.toFixed(2) * 100;

  // viewData.hyper = pairNonhyperHyper.hyper;
  // viewData.hyper.misc.percentage = pairNonhyperHyper.hyper.misc.percentage.toFixed(2) * 100;

  PostProcessReq(req, viewData);

  res.render(routeSettings.slug, viewData);
});

module.exports = router;
