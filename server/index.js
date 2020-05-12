const fs = require("fs");
const util = require("util");
const multer = require("multer");
const express = require("express");
const app = express();
const cors = require("cors");
const backendServices = require("./backendServices.js");
const parsingData = require("./parsingData.js");

//User customizable global variable
const uploadedDocsFolder = "./uploaded_docs/";
const logsFolder = "/logs/console.txt";

const log_file = fs.createWriteStream(__dirname + logsFolder, { flags: "w" });
const log_stdout = process.stdout;

console.log = function (d) {
  const txt =
    "\n" +
    " [" +
    new Date().toLocaleTimeString() +
    "] " +
    util.format(d) +
    "\n";
  log_file.write(txt);
  log_stdout.write(txt);
};

let file_det = "";
app.use(cors());

const engineSpeedLimit = 0;

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadedDocsFolder);
  },
  filename: function (req, file, callback) {
    let timeStamp=new Date().getTime()+"_";
    file_det = timeStamp.concat(file.originalname);
    callback(null, file_det);
  },
});

const upload = multer({
  storage: storage,
}).single("rawExcel");

const server = app.listen(3001, function () {
  //const host = server.address().address;
  const port = server.address().port;
  console.log("Eicher Portal app listening at " + port);
});
server.timeout = 100000;

const printAPIName = (name) => {
  console.log(
    "[API] " +
    JSON.stringify(name)+
      "\n ---------------------------------------------"
  );
};

app.post("/api/v1/feedFileUpload", function (req, res) {
  printAPIName(req.path);
  req.socket.setTimeout(10 * 60 * 1000);
  console.log("Uploading the log file started!");
  upload(req, res, function (err) {
    if (err) {
      console.log("Error uploading file.");
      //res.send("Error uploading file.");
    }
    console.log("File uploaded successfully! ");
    parsingData.startParsingProcess(file_det, "y", res);
  });
});

app.get("/api/v1/getDeviceIDs", function (req, res) {
  printAPIName(req.path);
  req.socket.setTimeout(10 * 60 * 1000);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  let reqObj = {
    sql: "select deviceid as 'deviceID' from eichervehicle group by deviceid",
  };
  backendServices.callServices(reqObj, res, "deviceIDs");
});

app.get("/api/v1/getOdoRange", function (req, res) {
  printAPIName(req.path);
  req.socket.setTimeout(10 * 60 * 1000);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  console.log("Fetching device ids...");
  let sql =
    "select MIN(totaldistance) as OdometerFrom ,MAX(totaldistance) as OdometerTo from eicherfeedlog where totaldistance > 0 and deviceid='" +
    req.query.deviceID +
    "'";
  let reqObj = { sql: sql };
  backendServices.callServices(reqObj, res, "getOdoRange");
});

app.get("/api/v1/idleDataReport", function (req, res) {
  printAPIName(req.path);
  req.socket.setTimeout(10 * 60 * 1000);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  backendServices.callServices(req.query, res, "idleDataReport");
});

app.get("/api/v1/readLogs", function (req, res) {
  printAPIName(req.path);
  fs.readFileSync(__dirname + logsFolder, "utf8");
  res.sendFile(__dirname + logsFolder);
});

app.get("/api/v1/stoppageReport", function (req, res) {
  printAPIName(req.path);
  req.socket.setTimeout(10 * 60 * 1000);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  backendServices.callServices(req.query, res, "stoppageReport");
});
app.get("/api/v1/overSpeedReport", function (req, res) {
  printAPIName(req.path);
  req.socket.setTimeout(10 * 60 * 1000);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  backendServices.callServices(req.query, res, "overSpeedReport");
});
app.get("/api/v1/vehicleData", function (req, res) {
  printAPIName(req.path);
  req.socket.setTimeout(10 * 60 * 1000);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  backendServices.callServices(req.query, res, "vehicleData");
});
app.get("/api/v1/vehicleSummaryReport", function (req, res) {
  printAPIName(req.path);
  req.socket.setTimeout(10 * 60 * 1000);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  backendServices.callServices(req.query, res, "vehicleSummaryReport");
});

module.exports.engineSpeedLimit = engineSpeedLimit;
