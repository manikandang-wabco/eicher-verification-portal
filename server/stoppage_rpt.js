const mysql = require("mysql");
const con = mysql.createPool({
  host: "winc75pmj882",
  user: "dcs_dev",
  password: "root",
  database: "dcs_dev"
});

con.query("select * from eicherfeedlog", function(err, data) {
  console.log("Data fetched from DB.. ", JSON.stringify(data));
});