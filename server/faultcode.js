const MOMENT = require("moment");
const MySql = require("sync-mysql");
const con = new MySql({
  host: "winc75pmj882",
  user: "dcs_dev",
  password: "root",
  database: "dcs_dev",
  timezone: "utc",
});
function fetchFaultCode()
{
  var qry_str = "select GPS_DATE, DTCA_DATA from eicherfeedlog where header='^DTCA' and deviceid='353351050154822' and DATE(gps_date)='2020-04-06'";
  var resArr = con.query(qry_str);
  if (resArr.length > 0) {
    resArr.forEach((obj) => {
      console.log(obj.GPS_DATE);
    });
  }
}
fetchFaultCode();