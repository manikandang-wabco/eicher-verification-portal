module.exports = {
  perDataHeaderTemplate: [
    "HEADER",
    "DEVICEID",
    "SEQUNCE_NUMBER",
    "LATITUDE",
    "LONGITUDE",
    "UTC",
    "SPEED",
    "MAINPOWER",
    "IGNITION",
    "DIGITAL_INPUT1",
    "DIGITAL_INPUT2",
    "DIGITAL_INPUT3",
    "DIGITAL_INPUT4",
    "DIGITAL_INPUT5",
    "ANALOG_INPUT1",
    "ANALOG_INPUT2",
    "ANALOG_INPUT3",
    "VEHICLE_BATTERY",
    "INTERNAL_BATTERY",
    "GPSODOMETER",
    "LIVE",
    "HEADING",
    "DRIVERID",
    "GPS_DATE",
    "CREATE_DATE",
  ],
  canDataHeaderTemplate: [
    "HEADER",
    "DEVICEID",
    "SEQUNCE_NUMBER",
    "LATITUDE",
    "LONGITUDE",
    "UTC",
    "HRLFC",
    "SWEETSPOT",
    "TOPGEAR",
    "SWEETSPOT_PERCENT",
    "SECONDS",
    "MINUTE",
    "HOUR",
    "MONTH",
    "DAY",
    "YEAR",
    "MINUTEOFFSET",
    "HOUROFFSET",
    "TOTALDISTANCE",
    "FUELLEVEL",
    "AMBERWARNINGLAMP",
    "REDSTOPLAMP",
    "MALFUNCTIONLAMP",
    "FLASHMALFUNCTIONLAMP",
    "SPNLSB",
    "SPN8_2NDBYTE",
    "FAILUREMODE",
    "SPN_MSB",
    "OCCURENCECOUNT",
    "CCA",
    "CCES",
    "CCSS",
    "ENGINESPEED",
    "ENGINESTARTMODE",
    "ENGINEOPERATINGHOURS",
    "POWERKEYPOS",
    "ACCPEDALIDELSWITCH",
    "VEHICLESPEED",
    "CONTROLLERTRIMMODE",
    "ENGINEOILPRESSURE",
    "ENGINECOOLANTTEMP",
    "ACCPEDALPOSITION",
    "TRIPFUEL",
    "LIVE",
    "GPS_DATE",
    "CREATE_DATE",
  ],
  altAccDataHeaderTemplate: [
    "HEADER",
    "DEVICEID",
    "SEQUENCE_NUMBER",
    "LATITUDE",
    "LONGITUDE",
    "UTC",
    "ACCELERATION_SEVERITY",
    "GPS_DATE",
    "CREATE_DATE",
  ],
  altBrkDataHeaderTemplate: [
    "HEADER",
    "DEVICEID",
    "SEQUENCE_NUMBER",
    "LATITUDE",
    "LONGITUDE",
    "UTC",
    "BRAKE_SEVERITY",
    "GPS_DATE",
    "CREATE_DATE",
  ],
  dtcaDataHeaderTemplate: [
    "HEADER",
    "DEVICEID",
    "SEQUENCE_NUMBER",
    "LATITUDE",
    "LONGITUDE",
    "UTC",
    "NO_OF_FCODES",
    "DTCA_DATA",
    "GPS_DATE",
    "CREATE_DATE",
  ],
};