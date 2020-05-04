"use strict";

// Require modules for server run
const createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
// const FileStore = require("session-file-store")(session);
// const logger = require("morgan");

const mysql = require("mysql");

// Load global config
const config = require("./config/config");
config.initConfig();

// Set root directory
global.rootDir = __dirname;

// Require routers
const routerIndex = require("./routes/index");
const routerRanker = require("./routes/ranker");
const routerAnnotator = require("./routes/annotator");

const routerTester = require("./routes/tester");
const routerDataCentre = require("./routes/data_centre");
const routerStatistics = require("./routes/statistics");
const routerExporter = require("./routes/exporter");
const routerNotFound = require("./routes/404");

const endpoints = require("./routes/endpoints/endpoints");
const rankerEndpoints = require("./routes/endpoints/ranker_endpoints");
const dataEndpoints = require("./routes/endpoints/data_endpoints");

global.dbConnectionsPool = mysql.createPool({
  host: global.gConfig.db.host,
  port: global.gConfig.db.port,
  user: global.gConfig.db.user,
  password: global.gConfig.db.password,
  database: global.gConfig.db.dbName,
});

const winston = require("winston");
global.logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
// Instantiate app
const app = express();

// Setup views path
app.set("views", path.join(__dirname, "views"));

// Setup it's engine
app.set("view engine", "ejs");

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  // -----------------------------------------------------------------------
  // authentication middleware

  const auth = {
    login: global.gConfig.authUsername,
    password: global.gConfig.authPass,
  };

  // parse login and password from headers
  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = new Buffer(b64auth, "base64").toString().split(":");

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next();
  }

  // Access denied...
  res.set("WWW-Authenticate", "Basic realm='401'"); // change this
  res.status(401).send("Authentication required."); // custom message

  // -----------------------------------------------------------------------
});

app.use(session({ secret: "matfyz", resave: false, saveUninitialized: true }));

// Get ImageRanker C++ library
const imageRanker = require(path.join(
  __dirname,
  "build/Release/image_ranker.node"
));

const dataInfoFpth = global.gConfig.dataInfoFpth;
const dataDir = global.gConfig.dataDir;

global.logger.log("debug", "process.env = '" + process.env["NODE_ENV"] + "'");

global.logger.log("debug", "NATIVE CALL: ImageRanker()");
global.logger.log("debug", "\tdataInfoFpth = " + dataInfoFpth);
global.logger.log("debug", "\tdataDir = " + dataDir);

// Create global instance of the ImageRanker
global.imageRanker = new imageRanker.ImageRankerWrapper(dataInfoFpth, dataDir);
global.logger.log("debug", "ImageRanker instantiated...");

// Push all routers into express middleware stack
app.use("/", routerIndex);
app.use("/annotator", routerAnnotator);
app.use("/ranker", routerRanker);

app.use("/tester", routerTester);
app.use("/statistics", routerStatistics);
app.use("/data_centre", routerDataCentre);
app.use("/exporter", routerExporter);

// Request endpoints
app.get("/get_autocomplete_results", endpoints.getAutocompleteResults);

app.post("/set_active_data_pack", endpoints.setActiveDataPack);
app.post("/switch_to_eval_mode", endpoints.switchToEvaluatorMode);
app.post("/switch_to_public_mode", endpoints.switchToPublicMode);
app.post("/annotator_submit_query", endpoints.submitAnnotatorQuery);
app.post("/run_model_tests", endpoints.runModelTests);

// Ranker endpoints
app.get("/get_frame_detail_data", rankerEndpoints.getFrameDetailData);

app.post("/set_ranker_model_options", rankerEndpoints.setModelOptions);
app.post("/ranker_push_search_action", rankerEndpoints.pushSearchAction);
app.post("/ranker_start_search_session", rankerEndpoints.startSearchSession);
app.post("/ranker_discard_search_session", rankerEndpoints.discardSearchSession);
app.post("/ranker_submit_frame", rankerEndpoints.submitFrame);

// Data endpoints
app.post("/get_search_sessions_rank_progress_chart_data", dataEndpoints.getSearchSessionsRankProgressChartData);
app.post("/get_label_histogram_data", dataEndpoints.getLabelHistogramData);



app.use("/404", routerNotFound);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
