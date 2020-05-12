const mysql = require("mysql");
const backendCalculation = require("./backendCalculation");
const main = require("./index");
/* const tripCalculation = require("./trip_calculation"); */
const con = mysql.createPool({
  host: "winc75pmj882",
  user: "dcs_dev",
  password: "root",
  database: "dcs_dev",
});


const parseInputs = (req) => {
  let flag = req.reportFlag,
    thresholdValue = isNaN(req.reportThreshold) ? req.reportThreshold : req.reportThreshold ==  undefined ? 0 : req.reportThreshold,
    condition = "",
    reqObj = {};
  if (flag === "date")
    condition =" and (gps_date between '"+req.fromDate+"' and '"+req.toDate+"') ";
  else if (flag === "odo")
    condition =" and (totaldistance between "+req.startOdo+" and  "+req.endOdo+") ";
  reqObj["condition"] = condition;
  reqObj["thresholdValue"] = thresholdValue;
  reqObj["req"] = req;
  reqObj["deviceID"] = req.deviceID;
  reqObj["searchBy"] = flag;
  return reqObj;
};
module.exports = {
  storeInDB: (arrToStore, filename, fDate, fDevice, res,newFileName) => {
    const sql =
      "INSERT INTO eicherfeedlog (HEADER,DEVICEID,SEQUNCE_NUMBER,LATITUDE,LONGITUDE,UTC,GPS_DATE,SPEED,LIVE,MAINPOWER,IGNITION,DIGITAL_INPUT1,DIGITAL_INPUT2,DIGITAL_INPUT3,DIGITAL_INPUT4,DIGITAL_INPUT5,ANALOG_INPUT1,ANALOG_INPUT2,ANALOG_INPUT3,VEHICLE_BATTERY,INTERNAL_BATTERY,GPSODOMETER,HEADING,DRIVERID,HRLFC,SWEETSPOT,TOPGEAR,SWEETSPOT_PERCENT,SECONDS,MINUTE,HOUR,MONTH,DAY,YEAR,MINUTEOFFSET,HOUROFFSET,TOTALDISTANCE,FUELLEVEL,AMBERWARNINGLAMP,REDSTOPLAMP,MALFUNCTIONLAMP,FLASHMALFUNCTIONLAMP,SPNLSB,SPN8_2NDBYTE,FAILUREMODE,SPN_MSB,OCCURENCECOUNT,CCA,CCES,CCSS,ENGINESPEED,ENGINESTARTMODE,ENGINEOPERATINGHOURS,POWERKEYPOS,ACCPEDALIDELSWITCH,CONTROLLERTRIMMODE,ENGINEOILPRESSURE,ENGINECOOLANTTEMP,ACCPEDALPOSITION,TRIPFUEL,ACCELERATION_SEVERITY,BRAKE_SEVERITY,NO_OF_FCODES,DTCA_DATA,FEED_DATE) VALUES ?";
    console.log("[Query] " + sql);
    console.log("Storing in eicherfeedlog table.");
    con.query(sql, [arrToStore], function (err) {
      if (err) throw err;
      console.log("Updated in DB : " + filename);
      setTimeout(() => {
        res.send({ status: "success", file: newFileName });
      }, 500);
    });
  },
  callServices: (req, res, serviceName)=>{
    let reqObj = parseInputs(req);
    if(serviceName == "stoppageReport"){
      backendCalculation.stoppageReport(reqObj, res);
    }else if(serviceName == "idleDataReport"){
      backendCalculation.idleDataReport(reqObj, res);
    }else if(serviceName == "overSpeedReport"){
      backendCalculation.overSpeedCalculation(reqObj, res);
    }else if(serviceName == "vehicleData"){
      backendCalculation.vehicleData(reqObj, res);
    }else if(serviceName == "vehicleSummaryReport"){
      backendCalculation.vehicleSummaryReportCal(reqObj, res);
    }else if(serviceName == "deviceIDs"){
      backendCalculation.parseDeviceIDs(req.sql, res);
    }else if (serviceName === "getOdoRange") {
      backendCalculation.getOdoRange(req.sql, res);
    }
  },
  connectToDB: () => {
    return con;
  }
};
