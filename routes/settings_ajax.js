const util = require("util");

exports.SetKeywordScoringDataType = function (req, res) {
  let sess = req.session;
  const a = Number(req.body.kwDataType);
  const b = Number(req.body.scoringDataType);

  // Check if this pair is compatible
  // 0000001|00 - last to digits determine DCNN type
  // every digit position shows what keywords it is
  const aa = a / 100;
  const bb = b / 100;
  if (aa != bb) {
    global.logger.log(
      "warn",
      "Incompatigle keyword and scoring data type: (" +
        a +
        ", " +
        b +
        ") \n Settings stay unchanged."
    );
    res.jsonp(
      "Incompatigle keyword and scoring data type: (" + a + ", " + b + ")"
    );
    return;
  }

  sess.keywordsSettings.kwDataType = a;
  sess.rankingSettings.scoringDataType = b;

  global.logger.log(
    "info",
    "Keyword and scoring type changed to (" + a + ", " + b + ")"
  );
  res.jsonp(true);
};
