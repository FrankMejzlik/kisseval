/**
 * This is the main application script.
 *
 * When the app starts, this script is executed and on each request
 * middleware that is bound as `use` on this app is used.
 */

"use strict";

const createError = require("http-errors");
const express = require("express");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const fs = require("fs");

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

/*
 * Configuration
 */

// Set root project directory
global.rootDir = __dirname;

// Load config
const config = require("./config/config");
config.initConfig();

/*
 * Request routing
 */
// Request routers
const routerIndex = require("./routes/index");
const routerRanker = require("./routes/ranker");
const routerAnnotator = require("./routes/annotator");
const routerNotFound = require("./routes/404");
const routerTester = require("./routes/tester");
const routerStatistics = require("./routes/statistics");
const routerDataCentre = require("./routes/data_centre");
const routerExporter = require("./routes/exporter");

// API endpoints
const endpoints = require("./routes/endpoints/endpoints");
const rankerEndpoints = require("./routes/endpoints/ranker_endpoints");
const dataEndpoints = require("./routes/endpoints/data_endpoints");

/*
 * Logging
 */
// Log format closure
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create main logger
global.logger = createLogger({
  level: "debug",
  format: combine(timestamp(), myFormat),
  defaultMeta: { service: "user-service" },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    // Write all logs with level `info` and below to `combined.log`
    new transports.Stream({
      stream: fs.createWriteStream(global.gConfig.logsDir + "error.log", { flags: "a+" }),
      level: "error",
    }),
    new transports.Stream({ stream: fs.createWriteStream(global.gConfig.logsDir + "combined.log", { flags: "a+" }) }),
  ],
});

// Log only into log files while in production
if (process.env.NODE_ENV !== "production") {
  global.logger.add(
    new transports.Console({
      format: combine(timestamp(), myFormat),
    })
  );
}

/*
 * Launch the app
 */
// Instantiate Express app
const app = express();

// Setup where EJS templates are stored
app.set("views", path.join(__dirname, "views"));

// Setup EJS engine for templates
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Use Morgan for request logging
app.use(
  morgan("common", {
    stream: fs.createWriteStream(__dirname + "/" + global.gConfig.logsDir + "/requests.log", { flags: "a+" }),
  })
);
app.use(morgan("dev"));

/*
 * HTTP authentication
 */
app.use((req, res, next) => {
  // Get auth credentials
  const auth = {
    login: global.gConfig.authUsername,
    password: global.gConfig.authPass,
  };

  // Parse login and password from headers
  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = new Buffer(b64auth, "base64").toString().split(":");

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted
    return next();
  }

  // Access denied
  res.set("WWW-Authenticate", "Basic realm='401'");
  res.status(401).send("Authentication required.");
});

/*
 * Turn on sessions
 */
app.use(session({ secret: "matfyz", resave: false, saveUninitialized: true }));

/*
 * Initial communication with the admin user
 */
global.logger.log("debug", "process.env = '" + process.env["NODE_ENV"] + "'");
if (process.env["NODE_ENV"] === "development") {
  global.logger.log(
    "warn",
    `
  =======================================================================
  App is running in 'development' environment!
  
  Debug info will be printed. 
  This is not recommended while exposed to public users.
  
  To change it, you can set environment variable \`NODE_ENV\` to 'production.

  =======================================================================`
  );
}

/*
 * Load native evaluation library (ImageRanker)
 */
const dataInfoFpth = path.join(global.rootDir, global.gConfig.dataInfoFpth);
const dataDir = path.join(global.rootDir, global.gConfig.dataDir);

global.logger.log("info", "Initializing KISSEval evaluation library...");
global.logger.log("debug", "\tdataInfoFpth = " + dataInfoFpth);
global.logger.log("debug", "\tdataDir = " + dataDir);

// Create global instance of the ImageRanker
const imageRanker = require(path.join(__dirname, "build/Release/image_ranker.node"));
global.imageRanker = new imageRanker.ImageRankerWrapper(dataInfoFpth, dataDir);
global.logger.log("info", "KISSEval is ready...");

/*
 * Push all routers into express middleware stack
 */
app.use("/", routerIndex);
app.use("/annotator", routerAnnotator);
app.use("/ranker", routerRanker);

app.use("/tester", routerTester);
app.use("/statistics", routerStatistics);
app.use("/data_centre", routerDataCentre);
app.use("/exporter", routerExporter);

// General request endpoints
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
app.post("/ranker_set_not_initial", rankerEndpoints.setNotInitial);

// Data endpoints
app.post("/get_search_sessions_rank_progress_chart_data", dataEndpoints.getSearchSessionsRankProgressChartData);
app.post("/get_label_histogram_data", dataEndpoints.getLabelHistogramData);

// 404 fallback
app.use("/404", routerNotFound);

// Error handler
app.use(function (err, req, res, next) {
  // Show error message if in development environment
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
