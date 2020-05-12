const main = require("./index");
const MOMENT = require("moment");
const MySql = require("sync-mysql");
const con = new MySql({
  host: "winc75pmj882",
  user: "dcs_dev",
  password: "root",
  database: "dcs_dev",
  timezone: "utc",
});
const timeDiff = (startTime, endTime, format) => {
  let startTimeNew = MOMENT(startTime, "YYYY-MM-DD HH:mm:ss"),
    endTimeNew = MOMENT(endTime, "YYYY-MM-DD HH:mm:ss"),
    diff = endTimeNew.diff(startTimeNew, format);
  return diff;
};
const removeSecondFronHMS = (val) => {
    if (val) {
      return val.slice(0, 5);
    }
  },
  changeToLowerCase = (val) => {
    if (val) {
      return val.toLowerCase();
    }
  };
const secondsToHms = (paramSec) => {
  let sec = Number(paramSec),
    d = Math.floor(sec / (3600 * 24)) * 24,
    hours = Math.floor((sec % (3600 * 24)) / 3600) + d,
    minutes = Math.floor((sec % 3600) / 60),
    seconds = Math.floor(sec % 60),
    timeString =
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0");
  return timeString;
};
let convertToDateCond = (reqObj)=>{
  let condition = "";
  let sql = "select min(CAST(gps_date as char)) as fromDate, max(CAST(gps_date as char)) as toDate from eicherfeedlog where deviceid="+reqObj.deviceID+" and  header='^can' "+reqObj.condition;
  console.log("ConvertedSql "+sql)
  let result = con.query(sql);
  condition = " and (DATE(gps_date) between '"+result[0].fromDate+"' and '"+result[0].toDate+"') ";
  return condition;
}
let parseVehicleData = (data, engineSpeedLimit) => {
    if (data.Engine_Speed == 0 && data.Vehicle_Speed == 0) {
      data["Vehicle_Status"] = "Stop";
      data["Ignition_Status"] = "OFF";
    } else if (
      data.Engine_Speed >= engineSpeedLimit &&
      data.Vehicle_Speed == 0
    ) {
      data["Vehicle_Status"] = "Idle";
      data["Ignition_Status"] = "ON";
    } else if (data.Engine_Speed > 0 && data.Vehicle_Speed > 0) {
      data["Vehicle_Status"] = "Moving";
      data["Ignition_Status"] = "ON";
    }
    return data;
  },
  parseData = (data, reqObj) => {
    let tmpIdleArr = [],
      tmpMovingArr = [],
      totalMovingSeconds = 0,
      totalIdleSeconds = 0;
    console.log("Engine Speed Limit " + main.engineSpeedLimit);
    let idleCount = 0;
    let movingCount = 0;
    let i = 0;
    data.map((rowData, index) => {
      i = i + 1;
      if (rowData.ENGINESPEED > main.engineSpeedLimit && rowData.SPEED == 0) {
        if (tmpIdleArr[idleCount] == undefined) {
          tmpIdleArr[idleCount] = {
            gps: rowData.LATITUDE + "," + rowData.LONGITUDE,
            start: rowData.GPS_DATE,
            end: rowData.GPS_DATE,
            diff: "",
          };
        } else {
          tmpIdleArr[idleCount].end = rowData.GPS_DATE;
        }
        if (data.length == i) {
          tmpIdleArr[idleCount].diff = timeDiff(
            tmpIdleArr[idleCount].start,
            tmpIdleArr[idleCount].end,
            "seconds"
          );
          totalIdleSeconds += timeDiff(
            tmpIdleArr[idleCount].start,
            tmpIdleArr[idleCount].end,
            "seconds"
          );
          idleCount = idleCount + 1;
        }
      } else {
        if (tmpIdleArr[idleCount] != undefined) {
            tmpIdleArr[idleCount].diff = timeDiff(
            tmpIdleArr[idleCount].start,
            tmpIdleArr[idleCount].end,
            "seconds"
          );
          totalIdleSeconds += timeDiff(
            tmpIdleArr[idleCount].start,
            tmpIdleArr[idleCount].end,
            "seconds"
          );
          idleCount = idleCount + 1;
        }
      }

      //Run time calculation
      if (rowData.SPEED > 0 && rowData.ENGINESPEED > main.engineSpeedLimit) {
        if (tmpMovingArr[movingCount] == undefined) {
          tmpMovingArr[movingCount] = {
            gps: rowData.LATITUDE + "," + rowData.LONGITUDE,
            start: rowData.GPS_DATE,
            end: rowData.GPS_DATE,
            diff: "",
          };
        } else {
          tmpMovingArr[movingCount].end = rowData.GPS_DATE;
        }
        if (data.length == i) {
          tmpMovingArr[movingCount].diff = timeDiff(
            tmpMovingArr[movingCount].start,
            tmpMovingArr[movingCount].end,
            "seconds"
          );
          totalMovingSeconds += timeDiff(
            tmpMovingArr[movingCount].start,
            tmpMovingArr[movingCount].end,
            "seconds"
          );
          movingCount = movingCount + 1;
        }
      } else {
        if (tmpMovingArr[movingCount] != undefined) {
          tmpMovingArr[movingCount].diff = timeDiff(
            tmpMovingArr[movingCount].start,
            tmpMovingArr[movingCount].end,
            "seconds"
          );
          totalMovingSeconds += timeDiff(
            tmpMovingArr[movingCount].start,
            tmpMovingArr[movingCount].end,
            "seconds"
          );
          movingCount = movingCount + 1;
        }
      }
    });

    if (reqObj.flag === "idleReport") {
      let tmpArr = [];
      tmpIdleArr.forEach((data) => {
        if (data.diff >= reqObj.thresholdValue) {
          data["diff"] = secondsToHms(data.diff);
          tmpArr.push(data);
        }
      });
      return tmpArr;
    } else if (reqObj.flag === "vsReport") {
      let tmpObj = {};
      tmpObj["totalMovingHours"] = totalMovingSeconds;
      tmpObj["totalIdleHours"] = totalIdleSeconds;
      tmpObj["totalEngineHours"] = totalMovingSeconds + totalIdleSeconds;
      return tmpObj;
    }

    //let tempVar = formatIdleSummaryReport(selectedArr, thresholdVal,reqObj);
  },
  stoppageCalc = (reqObj, res) => {
    let headerObj = {
        DeviceId: "Device ID",
        start: "Start (yyyy-mm-dd hh:mm:ss)",
        stop: "Stop (yyyy-mm-dd hh:mm:ss)",
        diff_hms: "Duration (hh:mm)",
      },
      responseData = {
        items: [],
      };
    let start = 0;
    let stop = 0;
    let i = 0;
    let sql =
      "select deviceid, CAST(gps_date as char) as gps_date,totaldistance, speed, cces, enginespeed, engineoperatinghours, enginestartmode  from eicherfeedlog where deviceId='" +
      reqObj.deviceID +
      "' and header='^can' " +
      reqObj.condition +
      " order by gps_date asc";
    console.log("framedQuery " + sql);
    let result = con.query(sql);
    result.map((res) => {
      console.log("Inside Map..");
      i = i + 1;
      if (res.enginespeed == 0 && res.speed == 0) {
        stop = res.gps_date;
        if (start == 0) start = res.gps_date;
      } else {
        if (start != 0) {
          if (reqObj.thresholdValue <= timeDiff(start, stop, "seconds")) {
            responseData.items.push({
              DeviceId: reqObj.deviceID,
              start: start,
              stop: stop,
              diff_hms: removeSecondFronHMS(secondsToHms(timeDiff(start, stop, "seconds"))),
            });
          }
          start = 0;
        }
      }
      if (result.length == i && start != 0) {
        if (reqObj.thresholdValue <= timeDiff(start, stop, "seconds")) {
          responseData.items.push({
            DeviceId: reqObj.deviceID,
            start: start,
            stop: stop,
            diff_hms: removeSecondFronHMS(secondsToHms(timeDiff(start, stop, "seconds"))),
          });
        }
        start = 0;
      }
    });
    if (responseData.items.length > 0) {
      responseData.items.unshift(headerObj);
    }
    res.send(responseData);
  },
  startIdleReport = (reqObj) => {
    let resArr = [],
      resObj = { total: 0, idle: 0, moving: 0 };
    let sql =
      "select id,deviceid, CAST(gps_date as char) as GPS_DATE,LATITUDE,LONGITUDE,SEQUNCE_NUMBER,totaldistance, SPEED, ENGINESPEED  from eicherfeedlog where live=1 and deviceId = '" +
      reqObj.deviceID +
      "' and header='^can' " +
      reqObj.condition +
      " order by gps_date asc";
    let result = con.query(sql),
      parsedRes = parseData(result, reqObj);

    if (reqObj.flag == "idleReport") {
      resArr.push(parsedRes);
    } else if (reqObj.flag == "vsReport") {
      resObj.total += parseInt(parsedRes.totalEngineHours);
      resObj.idle += parseInt(parsedRes.totalIdleHours);
      resObj.moving += parseInt(parsedRes.totalMovingHours);
    }

    if (reqObj.flag === "idleReport") {
      return resArr;
    } else if (reqObj.flag === "vsReport") {
      return resObj;
    }
  },
  parseVSIdleMovingReport_Logic1 = (reqObj, res) => {
    reqObj["flag"] = "vsReport";
    let resObj = startIdleReport(reqObj);
    resObj.total = secondsToHms(resObj.total);
    resObj.idle = secondsToHms(resObj.idle);
    resObj.moving = secondsToHms(resObj.moving);
    return resObj;
  },
  parseVSIdleMovingReport = (reqObj, res) => {
    let sql_idleTime = con.query("select count(*)*60 as idle_time from dcs_dev.eicherfeedlog where deviceid='" +reqObj.deviceID +"' and header='^can' and speed=0 and enginespeed > 0 "+reqObj.condition);

    let sql_totalTime = con.query("select round((max(engineoperatinghours)-min(engineoperatinghours))*3600) as total_operating_hours from dcs_dev.eicherfeedlog where deviceid='" +reqObj.deviceID +"' and header='^can' "+reqObj.condition);

    let resObj = [];
    resObj.total = secondsToHms(sql_totalTime[0]["total_operating_hours"]);
    resObj.idle = secondsToHms(sql_idleTime[0]["idle_time"]);
    resObj.moving = secondsToHms(sql_totalTime[0]["total_operating_hours"] - sql_idleTime[0]["idle_time"]);
    return resObj;
  },
  parseVSHarshReport = (reqObj) => {
    let condition = reqObj.condition;
    console.log("search by"+reqObj.searchBy)
    if(reqObj.searchBy == "odo"){

      condition = convertToDateCond(reqObj);
      console.log("updated condtion" + condition)
    }
    let accTotal = 0,
      brkTotal = 0,
      resObj = {};
    let sql =
      "select header, count(*) as 'count' from (select header, count(*) from eicherfeedlog where deviceid='" +
      reqObj.deviceID +
      "' and header in ('^ALT_BRAKE', '^ALT_ACC') and (brake_severity >= 4 or ACCELERATION_SEVERITY >=4) " +
      condition +
      " group by header, DATE_FORMAT(gps_date, '%Y%m%d%h%i')) as tmp group by header";
    console.log("harsh" + sql);
    let resArr = con.query(sql);
    //console.log("resArr harshbreak and harshacc " + JSON.stringify(resArr));
    if (resArr.length > 0) {
      resArr.forEach((obj) => {
        if (obj.header === "^ALT_ACC") {
          accTotal += obj.count;
        } else if (obj.header === "^ALT_BRAKE") {
          brkTotal += obj.count;
        }
      });
    }
    resObj["acc"] = accTotal;
    resObj["brk"] = brkTotal;
    return resObj;
  };
module.exports = {
  parseDeviceIDs: (sql, res) => {
    let data = con.query(sql);
    const responseData = {};
    if (data) {
      let tempData = data.map((val) => {
        let tempObj = {};
        tempObj["key"] = val.deviceID;
        tempObj["value"] = val.deviceID;
        return tempObj;
      });
      responseData["ids"] = tempData;
    } else {
      responseData["ids"] = [];
    }
    res.send(responseData);
  },
  getOdoRange: (sql, res) => {
    let data = con.query(sql);
    const responseData = {};
    //console.log(data)
    responseData["items"] = data;
    res.send(responseData);
  },
  overSpeedCalculation: (reqObj, res) => {
    let sql =
      "select deviceid as 'Device ID',CAST(gps_date AS char) as UTC , CONCAT_WS(' ', latitude,longitude ) AS GPS, speed as Speed from eicherfeedlog where header='^CAN' and deviceid='" +
      reqObj.deviceID +
      "' and speed >= " +
      reqObj.thresholdValue +
      " " +
      reqObj.condition +
      " order by speed desc";
    console.log(sql);
    let data = con.query(sql);
    const responseData = {};
    if (data != "") {
      let headerObj = {};
      Object.keys(data[0]).forEach((key) => {
        headerObj[key] = key;
      });
      headerObj["UTC"] = "UTC (yyyy-mm-dd hh:mm:ss)";
      headerObj["Speed"] = "Speed (km/h)";
      headerObj["GPS"] = "GPS (lat, log)";
      data.unshift(headerObj);
      responseData["items"] = data;
    } else {
      responseData["items"] = [];
    }
    res.send(responseData);
  },
  vehicleData: (reqObj, res) => {
    const responseData = { items: [] };
    let statusCondition = "";
    console.log("Status Condition " + reqObj.thresholdValue);
    if (changeToLowerCase(reqObj.thresholdValue) === "moving") {
      statusCondition = " and speed > 0 and enginespeed > 0 ";
    } else if (changeToLowerCase(reqObj.thresholdValue) === "stop") {
      statusCondition = " and speed = 0 and enginespeed = 0 ";
    } else if (changeToLowerCase(reqObj.thresholdValue) === "idle") {
      statusCondition =
        " and speed = 0 and enginespeed >"+main.engineSpeedLimit;
    }
    let sql =
      "select CAST(DATE(gps_date) AS char)  as 'Date', hrlfc as 'Cum. Fuel Consumed (ltr)',totaldistance as 'Odo Reading (km)',fuellevel as 'Fuel Level (%)',redstoplamp as 'Red Stop Lamp',malfunctionlamp as 'MIL Status',engineoperatinghours as 'Eng. Op. Hours (hrs)',engineoilpressure as 'Eng. Oil Pressure(kPa)',enginecoolanttemp as 'Eng. Coolant Temp(C)', enginespeed as 'Engine_Speed',speed as 'Vehicle_Speed' from eicherfeedlog where header='^CAN' and deviceid='" +
      reqObj.deviceID +
      "' " +
      reqObj.condition +
      " " +
      statusCondition;
    console.log(sql);
    let data = con.query(sql);
    if (data != "") {
      //console.log("DATA " + JSON.stringify(data));
      data.forEach((rowData) => {
        rowData["Red Stop Lamp"] = rowData["Red Stop Lamp"] == 0 ? "OFF" : "ON";
        rowData["MIL Status"] = rowData["MIL Status"] == 0 ? "OFF" : "ON";
        responseData.items.push(
          parseVehicleData(rowData, main.engineSpeedLimit)
        );
      });
      let headerObj = {};
      Object.keys(responseData.items[0]).forEach((key) => {
        headerObj[key] = key.replace(/_/g, " ");
      });
      headerObj["Vehicle_Status"] = "P. Veh. Stat.";
      headerObj["Ignition_Status"] = "P. Ign. Stat.";
      headerObj["Engine_Speed"] = "Eng. Speed (rpm)";
      headerObj["Vehicle_Speed"] = "Veh. Speed (kmph)";
      responseData.items.unshift(headerObj);
    } else {
      responseData["items"] = [];
    }
    res.send(responseData);
  },
  idleDataReport: (reqObj, res) => {
    reqObj["flag"] = "idleReport";
    const responseData = { items: [] };
    let resData = startIdleReport(reqObj);
    if (resData.length > 0) {
      resData.map((dataArr) => {
        if (dataArr.length > 0) {
          dataArr.map((obj) => {
            responseData["items"].push(obj);
          });
        }
      });
      let headerObj = {};
      headerObj["GPS"] = "GPS (lat, log)";
      headerObj["Start_Time"] = "Start Time (yyyy-mm-dd hh:mm:ss)";
      headerObj["End_Time"] = "End Time (yyyy-mm-dd hh:mm:ss)";
      headerObj["Idle_Time"] = "Idle Time (hh:mm)";
      responseData.count = responseData.items.length;
      responseData.items.unshift(headerObj);
    }
    res.send(responseData);
  },
  stoppageReport: (reqObj, res) => {
    stoppageCalc(reqObj, res);
  },
  vehicleSummaryReportCal: (reqObj, res) => {
    const responseData = { items: [] },
      overspeedLimit = 65;
    //console.log("[reqObj] " + reqObj);
    let totalTimeObj = parseVSIdleMovingReport(reqObj, res),
      sql =
        "select max(totaldistance) - min(totaldistance) as totalDistance, CONCAT(FLOOR(max(ENGINEOPERATINGHOURS)-min(ENGINEOPERATINGHOURS)),':', LPAD(ROUND(((max(ENGINEOPERATINGHOURS)-min(ENGINEOPERATINGHOURS)) - FLOOR(max(ENGINEOPERATINGHOURS)-min(ENGINEOPERATINGHOURS))) * 60) % 60,2,0)) AS engineOperatingHours,max(speed) as maxSpeed,round(max(hrlfc) - min(hrlfc), 2) as fuelConsumed,round((max(totaldistance) - min(totaldistance))/(max(hrlfc) - min(hrlfc)), 2) as avgFuelUtilization from eicherfeedlog where deviceid='" +
        reqObj.deviceID +
        "' and header='^can' and totaldistance > 0" +
        reqObj.condition,
      result = con.query(sql),
      headerObj = {},
      resObj = {},
      sql2 =
        "select speed from eicherfeedlog where header='^can' and deviceid=" +
        reqObj.deviceID +
        " " +
        reqObj.condition;
    console.log("[sql 2] [sync] " + sql);
    console.log("[sql 3] [sync] " + sql2);
    let totalHarshObj = parseVSHarshReport(reqObj),
      prev_speed = 0,
      over_speed = 0,
      canRecords = con.query(sql2),
      over_speed_duration = 0;
    canRecords.map((data) => {
      if (prev_speed < overspeedLimit && data.speed > overspeedLimit) {
        over_speed++;
      }
      prev_speed = data.speed;
    });
    console.log("[over_speed] " + over_speed);
    over_speed_duration = secondsToHms(over_speed * 60);
    const headerArr = [
        "Total Hours (hh:mm)",
        "Idle Hours (hh:mm)",
        "Moving Hours (hh:mm)",
        "Distance (KM)",
        "Fuel Utilization (L)",
        "Avg. Fuel Utilization (KM/L)",
        "Harsh Acceleration",
        "Harsh Brake",
        "Overspeeding Count",
        "Overspeeding Duration (hh:mm)",
        "Max Speed (KM/H)",
      ],
      valueArr = [
        totalTimeObj.total ? removeSecondFronHMS(totalTimeObj.total) : "00:00",
        totalTimeObj.idle ? removeSecondFronHMS(totalTimeObj.idle) : "00:00",
        totalTimeObj.moving
          ? removeSecondFronHMS(totalTimeObj.moving)
          : "00:00",
        result[0].totalDistance ? result[0].totalDistance.toFixed(2) : 0,
        result[0].fuelConsumed ? result[0].fuelConsumed : 0,
        result[0].avgFuelUtilization ? result[0].avgFuelUtilization : 0,
        totalHarshObj.acc,
        totalHarshObj.brk,
        over_speed,
        over_speed_duration
          ? removeSecondFronHMS(over_speed_duration)
          : "00:00",
        result[0].maxSpeed ? result[0].maxSpeed.toFixed(2) : 0,
      ];
    //console.log("[Value Arr] " + valueArr);
    headerArr.map((key, index) => {
      headerObj[key] = key;
      resObj[key] = valueArr[index];
    });

    responseData.items.unshift(headerObj);
    responseData.items.push(resObj);
    res.send(responseData);
  },
};
