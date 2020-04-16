const util = require("util");
const path = require("path");
const fs = require("fs");

exports.ExportFile = function (req, res) {
  let sess = req.session;
  global.logger.log("debug", "<" + sess.id + ">: => ExportFile()");

  global.logger.log(
    "debug",
    "newAction: " + JSON.stringify(req.query, undefined, 4)
  );

  const native = req.body.native;

  const kwScDataType = {
    keywordsDataType: req.body.kwTypeId,
    scoringDataType: req.body.scTypeId,
  };

  const fileTypeId = req.body.fileType;

  let filename;
  let kkk = "";

  switch (fileTypeId) {
    case 0:
      filename = "user_annotator_queries";
      kkk = "eUserAnnotatorQueries";
      break;

    case 1:
      filename = "net_normalized_scores";
      kkk = "eNetNormalizedScores";
      break;

    case 2:
      filename = "query_num_hits";
      kkk = "eQueryNumHits";
      break;

    case 3:
      filename = "native_queries";
      kkk = "cNativeQueries";
      break;
  }

  if (fileTypeId == 3) {
    let responseData = {
      result: false,
      filename: "Something went wrong!",
    };

    global.dbConnectionsPool.query(
      "SELECT image_id, manually_validated, query FROM `image-ranker-collector-data2`.user_data_native_queries;",
      function (error, results, fields) {
        if (error) throw error;
        console.log("The solution is: ", results[0].solution);

        filename =
          filename +
          "." +
          String(kwScDataType.keywordsDataType) +
          "." +
          String(kwScDataType.scoringDataType) +
          ".txt";
        global.logger.log("debug", "<" + sess.id + ">: => b");
        const outputFilepath = path.join(
          global.rootDir,
          "/public/",
          global.gConfig.exportDir,
          filename
        );

        let strToWrite = "";
        for (let i = 0; i < results.length; ++i) {
          strToWrite +=
            results[i].image_id +
            "," +
            results[i].manually_validated +
            ',"' +
            results[i].query +
            '"\n';
        }

        fs.writeFile(outputFilepath, strToWrite, function (err) {
          if (err) {
            return console.log(err);
          }
        });

        responseData.result = true;
        responseData.filename = global.gConfig.exportDir + filename;

        const iii = String(req.body.kwTypeId);
        const jjj = String(req.body.scTypeId);

        global.logger.log("debug", "<" + sess.id + ">: => c");

        // Save to app context
        global.exportedFiles["id" + iii]["id" + jjj][kkk] =
          global.gConfig.exportDir + filename;

        global.logger.log(
          "debug",
          "<" + sess.id + ">: Exported file '" + outputFilepath + "'"
        );

        global.logger.log("debug", "<" + sess.id + ">: <= ExportFile()");
        res.jsonp(responseData);
      }
    );
  } else {
    filename =
      filename +
      "." +
      String(kwScDataType.keywordsDataType) +
      "." +
      String(kwScDataType.scoringDataType) +
      ".txt";
    global.logger.log("debug", "<" + sess.id + ">: => b");
    const outputFilepath = path.join(
      global.rootDir,
      "/public/",
      global.gConfig.exportDir,
      filename
    );

    global.logger.log("debug", "<" + sess.id + ">: Exporting file...");
    global.logger.log(
      "debug",
      "<" +
        sess.id +
        ">: kwScDataType = " +
        JSON.stringify(kwScDataType, undefined, 4)
    );
    global.logger.log(
      "debug",
      "<" + sess.id + ">: fileTypeId = " + String(fileTypeId)
    );
    global.logger.log(
      "debug",
      "<" + sess.id + ">: outputFilepath = " + String(outputFilepath)
    );

    let responseData = {
      result: false,
      filename: "Something went wrong!",
    };

    let resultFilename;

    try {
      // ======================================================
      // ======================================================
      resultFilename = global.imageRanker.ExportDataFile(
        kwScDataType,
        fileTypeId,
        outputFilepath,
        native
      );
      // ======================================================
      // ======================================================
    } catch (err) {
      global.logger.log(
        "error",
        "<" +
          sess.id +
          ">: Exporting data file failed! (imageRanker.ExportDataFile())"
      );

      res.jsonp(responseData);
      return;
    }

    responseData.result = true;
    responseData.filename = global.gConfig.exportDir + filename;

    const iii = String(req.body.kwTypeId);
    const jjj = String(req.body.scTypeId);

    global.logger.log("debug", "<" + sess.id + ">: => c");

    // Save to app context
    global.exportedFiles["id" + iii]["id" + jjj][kkk] =
      global.gConfig.exportDir + filename;

    global.logger.log(
      "debug",
      "<" + sess.id + ">: Exported file '" + outputFilepath + "'"
    );

    global.logger.log("debug", "<" + sess.id + ">: <= ExportFile()");
    res.jsonp(responseData);
  }
};
