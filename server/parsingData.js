const xlsx = require("node-xlsx").default;
const path = require("path");
const fs = require("fs");

const headerTemplates = require("./headerTemplates.js");
const excelColumns = require("./excelColumns.js");
const backendServices = require("./backendServices.js");
const MySql = require("sync-mysql");
const uploadedDocsFolder = "./uploaded_docs/";
const uploadDirPath = path.join(__dirname, uploadedDocsFolder);

const perDataHeader = "^PERIODIC";
const canDataHeader = "^CAN";
const altAccDataHeader = "^ALT_ACC";
const altBrkDataHeader = "^ALT_BRAKE";
const dtcaDataHeader = "^DTCA";

const conn = backendServices.connectToDB();
const con = new MySql({
  host: "winc75pmj882",
  user: "dcs_dev",
  password: "root",
  database: "dcs_dev",
  timezone: "utc",
});
const timeConverter = (timestamp) => {
  let a = new Date(timestamp * 1000),
    months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ],
    year = a.getFullYear() + 30,
    month = months[a.getMonth()],
    date = a.getDate() - 1,
    hour = a.getHours(),
    min = a.getMinutes(),
    sec = a.getSeconds(),
    time = year + "-" + month + "-" + date + " " + hour + ":" + min + ":" + sec;
  return time;
};

const parsePeriodicData = (feedDataArr, feedDate) => {
    let parsedPerData = [],
      respArr = [];
    if (feedDataArr.length == headerTemplates.perDataHeaderTemplate.length) {
      headerTemplates.perDataHeaderTemplate.forEach((key, index) => {
        let tempArr = [];
        tempArr.push(key);
        tempArr.push(feedDataArr[index]);
        parsedPerData.push(tempArr);
      });
    }
    let parsedObj = Object.fromEntries(parsedPerData);
    respArr.push(parsedObj.HEADER);
    respArr.push(parsedObj.DEVICEID);
    respArr.push(parsedObj.SEQUNCE_NUMBER);
    respArr.push(parsedObj.LATITUDE);
    respArr.push(parsedObj.LONGITUDE);
    respArr.push(timeConverter(parsedObj.UTC));
    respArr.push(parsedObj.GPS_DATE);
    respArr.push(parsedObj.SPEED);
    respArr.push(parsedObj.LIVE);
    respArr.push(parsedObj.MAINPOWER);
    respArr.push(parsedObj.IGNITION);
    respArr.push(parsedObj.DIGITAL_INPUT1);
    respArr.push(parsedObj.DIGITAL_INPUT2);
    respArr.push(parsedObj.DIGITAL_INPUT3);
    respArr.push(parsedObj.DIGITAL_INPUT4);
    respArr.push(parsedObj.DIGITAL_INPUT5);
    respArr.push(parsedObj.ANALOG_INPUT1);
    respArr.push(parsedObj.ANALOG_INPUT2);
    respArr.push(parsedObj.ANALOG_INPUT3);
    respArr.push(parsedObj.VEHICLE_BATTERY);
    respArr.push(parsedObj.INTERNAL_BATTERY);
    respArr.push(parsedObj.GPSODOMETER);
    respArr.push(parsedObj.HEADING);
    respArr.push(parsedObj.DRIVERID);
    for (let i = 0; i < 40; i++) {
      respArr.push("NULL");
    }
    respArr.push(feedDate);
    return respArr;
  },
  parseCANData = (feedDataArr, feedDate) => {
    let parsedCANData = [],
      respArr = [];
    if (feedDataArr.length == headerTemplates.canDataHeaderTemplate.length) {
      headerTemplates.canDataHeaderTemplate.forEach((key, index) => {
        let tempArr = [];
        tempArr.push(key);
        tempArr.push(feedDataArr[index]);
        parsedCANData.push(tempArr);
      });
    }
    let parsedObj = Object.fromEntries(parsedCANData);
    respArr.push(parsedObj.HEADER);
    respArr.push(parsedObj.DEVICEID);
    respArr.push(parsedObj.SEQUNCE_NUMBER);
    respArr.push(parsedObj.LATITUDE);
    respArr.push(parsedObj.LONGITUDE);
    respArr.push(timeConverter(parsedObj.UTC));
    respArr.push(parsedObj.GPS_DATE);
    respArr.push(parsedObj.VEHICLESPEED);
    respArr.push(parsedObj.LIVE);
    for (let i = 0; i < 15; i++) {
      respArr.push("NULL");
    }
    respArr.push(parsedObj.HRLFC);
    respArr.push(parsedObj.SWEETSPOT);
    respArr.push(parsedObj.TOPGEAR);
    respArr.push(parsedObj.SWEETSPOT_PERCENT);
    respArr.push(parsedObj.SECONDS);
    respArr.push(parsedObj.MINUTE);
    respArr.push(parsedObj.HOUR);
    respArr.push(parsedObj.MONTH);
    respArr.push(parsedObj.DAY);
    respArr.push(parsedObj.YEAR);
    respArr.push(parsedObj.MINUTEOFFSET);
    respArr.push(parsedObj.HOUROFFSET);
    respArr.push(parsedObj.TOTALDISTANCE);
    respArr.push(parsedObj.FUELLEVEL);
    respArr.push(parsedObj.AMBERWARNINGLAMP);
    respArr.push(parsedObj.REDSTOPLAMP);
    respArr.push(parsedObj.MALFUNCTIONLAMP);
    respArr.push(parsedObj.FLASHMALFUNCTIONLAMP);
    respArr.push(parsedObj.SPNLSB);
    respArr.push(parsedObj.SPN8_2NDBYTE);
    respArr.push(parsedObj.FAILUREMODE);
    respArr.push(parsedObj.SPN_MSB);
    respArr.push(parsedObj.OCCURENCECOUNT);
    respArr.push(parsedObj.CCA);
    respArr.push(parsedObj.CCES);
    respArr.push(parsedObj.CCSS);
    respArr.push(parsedObj.ENGINESPEED);
    respArr.push(parsedObj.ENGINESTARTMODE);
    respArr.push(parsedObj.ENGINEOPERATINGHOURS);
    respArr.push(parsedObj.POWERKEYPOS);
    respArr.push(parsedObj.ACCPEDALIDELSWITCH);
    respArr.push(parsedObj.CONTROLLERTRIMMODE);
    respArr.push(parsedObj.ENGINEOILPRESSURE);
    respArr.push(parsedObj.ENGINECOOLANTTEMP);
    respArr.push(parsedObj.ACCPEDALPOSITION);
    respArr.push(parsedObj.TRIPFUEL);
    for (let i = 0; i < 4; i++) {
      respArr.push("NULL");
    }
    respArr.push(feedDate);
    return respArr;
  },
  parseALTData = (feedDataArr, feedDate, flag) => {
    let parsedALTData = [],
      respArr = [];
    if (flag == "accn") {
      if (
        feedDataArr.length == headerTemplates.altAccDataHeaderTemplate.length
      ) {
        headerTemplates.altAccDataHeaderTemplate.forEach((key, index) => {
          let tempArr = [];
          tempArr.push(key);
          tempArr.push(feedDataArr[index]);
          parsedALTData.push(tempArr);
        });
      }
    } else if (flag === "brake") {
      if (
        feedDataArr.length == headerTemplates.altBrkDataHeaderTemplate.length
      ) {
        headerTemplates.altBrkDataHeaderTemplate.forEach((key, index) => {
          let tempArr = [];
          tempArr.push(key);
          tempArr.push(feedDataArr[index]);
          parsedALTData.push(tempArr);
        });
      }
    }

    let parsedObj = Object.fromEntries(parsedALTData);
    respArr.push(parsedObj.HEADER);
    respArr.push(parsedObj.DEVICEID);
    respArr.push(parsedObj.SEQUENCE_NUMBER);
    respArr.push(parsedObj.LATITUDE);
    respArr.push(parsedObj.LONGITUDE);
    respArr.push(timeConverter(parsedObj.UTC));
    respArr.push(parsedObj.GPS_DATE);
    for (let i = 0; i < 53; i++) {
      respArr.push("NULL");
    }
    if (flag == "accn") {
      respArr.push(parsedObj.ACCELERATION_SEVERITY);
      respArr.push("NULL");
    } else if (flag === "brake") {
      respArr.push("NULL");
      respArr.push(parsedObj.BRAKE_SEVERITY);
    }
    for (let i = 0; i < 2; i++) {
      respArr.push("NULL");
    }
    respArr.push(feedDate);
    return respArr;
  },
  parseDTCAData = (feedDataArr, feedDate, flag) => {
    let respArr = [];
    const gpsDate = feedDataArr[feedDataArr.length - 1];
    respArr.push(feedDataArr[0]);
    respArr.push(feedDataArr[1]);
    respArr.push(feedDataArr[2]);
    respArr.push(feedDataArr[3]);
    respArr.push(feedDataArr[4]);
    respArr.push(feedDataArr[5]);
    respArr.push(gpsDate);
    for (let i = 0; i < 55; i++) {
      respArr.push("NULL");
    }
    respArr.push(feedDataArr[6]);
    let data = feedDataArr.slice(7, feedDataArr.length - 2);
    respArr.push(data.toString());
    respArr.push(feedDate);
    return respArr;
  };
module.exports = {
  startParsingProcess: (fileName, storeInDBParam, res) => {
    console.log("Started Parsing Process.. " + fileName);
    let filePath = uploadDirPath.concat(fileName),
      feedFile = xlsx.parse(uploadDirPath.concat(fileName))[0].data,
      feedDate = feedFile[3][1].slice(1, 12).trim(),
      feedDevice = feedFile[6][1].split(",")[1];
    console.log("Path : " + filePath);
    console.log("Feed File date : " + feedDate);
    console.log("Feed File device : " + feedDevice);
    if (feedDevice) {
      /* Need to change the table accordingly */
      const sql =
        "delete from eicherfeedlog where deviceid='" +
        feedDevice +
        "' and feed_date='" +
        feedDate +
        "'";
      console.log("[Query] " + sql);
      conn.query(sql, function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          throw err;
        }
        console.log("Deleting the Exsisting Data..");
        let sql2 =
          "insert into eichervehicle values('" +
          feedDevice +
          "','" +
          feedDevice +
          "')";
        /*  con.query(sql2); */
        console.log("Updated in the eicher vehicle table..");
        let responseFeedArr = [];
        responseFeedArr.push(excelColumns.exportExcelColumns);
        feedFile.forEach((feed, index) => {
          if (index > 5) {
            let gpsDate = feed[0],
              feedDataArr = feed[1].split(","),
              createdDate = feed[3],
              parsedHeader = feedDataArr[0];
            feedDataArr.push(gpsDate);
            feedDataArr.push(createdDate);
            if (parsedHeader === perDataHeader) {
              let parsedObj = parsePeriodicData(feedDataArr, feedDate);
              responseFeedArr.push(parsedObj);
            } else if (parsedHeader === canDataHeader) {
              let parsedObj = parseCANData(feedDataArr, feedDate);
              responseFeedArr.push(parsedObj);
            } else if (parsedHeader === dtcaDataHeader) {
              let parsedObj = parseDTCAData(feedDataArr, feedDate);
              responseFeedArr.push(parsedObj);
            } else if (parsedHeader === altAccDataHeader) {
              let parsedObj = parseALTData(feedDataArr, feedDate, "accn");
              responseFeedArr.push(parsedObj);
            } else if (parsedHeader === altBrkDataHeader) {
              let parsedObj = parseALTData(feedDataArr, feedDate, "brake");
              responseFeedArr.push(parsedObj);
            }
          }
        });

        let buffer = xlsx.build([
            {
              name: "Feed File",
              data: responseFeedArr,
            },
          ]),
          newFileName = feedDate + "_" + feedDevice.concat("_parsed.xlsx");
        fs.writeFile(uploadDirPath + newFileName, buffer, (err) => {
          if (err) throw err;
          console.log("basename: " + uploadDirPath + newFileName);
          console.log(feedDate + "_" + feedDevice + "_parsed created..");
        });
        /* Need to change accordingly */
        if (storeInDBParam.toLowerCase() === "y") {
          responseFeedArr.shift();
          backendServices.storeInDB(
            responseFeedArr,
            fileName,
            feedDate,
            feedDevice,
            res,
            newFileName
          );
        }
      });
    } else {
      console.log("Not a valid file! " + filePath);
    }
  },
};
