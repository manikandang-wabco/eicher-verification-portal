import React, { Component } from "react";
import DatetimeRangePicker from "react-bootstrap-datetimerangepicker";
import BootstrapSwitchButton from "bootstrap-switch-button-react";
import moment from "moment";
import { Button, ButtonGroup } from "react-bootstrap";
import TableCreation from "./TableCreation";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-daterangepicker/daterangepicker.css";
import ReportsCSS from "./Reports.module.css";

class IdleSummaryReport extends Component {
  constructor(props) {
    super(props);
    this.handleEvent = this.handleEvent.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.title = "Idle Summary Report";
    document.title = this.title;
    // this.componentDidMount = this.componentDidMount.bind(this);
  }
  state = {
    result: [],
    status: false,
    loader: false,
    vehicle: "",
    searchByDate: "show",
    searchByOdo: "hide",
    startDate: moment().subtract(29, "days"),
    endDate: moment(),
    ranges: {
      Today: [moment(), moment()],
      Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
      "Last 7 Days": [moment().subtract(6, "days"), moment()],
      "Last 30 Days": [moment().subtract(29, "days"), moment()],
      "This Month": [moment().startOf("month"), moment().endOf("month")],
      "Last Month": [
        moment().subtract(1, "month").startOf("month"),
        moment().subtract(1, "month").endOf("month"),
      ],
    },
    selectedDateRange: "",
    startOdo: 0,
    endOdo: 0,
    selectedVehicle: "",
    speed: 60,
    mainApi: "",
    dataTable: "Loading",
    threshold: 5,
    activeDate: "secondary",
    activeOdo: "primary",
  };

  handleEvent(event, picker) {
    this.setState({
      startDate: picker.startDate,
      endDate: picker.endDate,
    });
  }
  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    if (event.target.name == "selectedVehicle") {
      fetch("/api/v1/overSpeedInputs?deviceID=" + event.target.value)
        .then((response) => response.json())
        .then((data) => {
          console.log("fetch1111 ", data.items[0]);
          this.setState({
            startOdo: data.items[0].OdometerFrom,
            endOdo: data.items[0].OdometerTo,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  searchBy = (event) => {
    console.log(event.target.value);
    if (event.target.value == "date") {
      this.setState({
        searchByDate: "show",
        searchByOdo: "hide",
        activeDate: "secondary",
        activeOdo: "primary",
      });
    } else {
      this.setState({
        searchByDate: "hide",
        searchByOdo: "show",
        activeDate: "primary",
        activeOdo: "secondary",
      });
    }
  };
  fetchData() {
    this.setState({ status: false, loader: true });
    let api = "";
    if (this.state.selectedVehicle) {
      let vehicle = this.state.selectedVehicle;
      let threshold = this.state.threshold;
      if (this.state.searchByDate == "show") {
        let start = this.state.startDate.format("YYYY-MM-DD");
        let end = this.state.endDate.format("YYYY-MM-DD");
        api =
          "/api/v1/idleDataReport?reportFlag=date&fromDate=" +
          start +
          "&toDate=" +
          end +
          "&reportThreshold=" +
          threshold +
          "&deviceID=" +
          vehicle;
      } else {
        let start = this.state.startOdo;
        let end = this.state.endOdo;
        api =
          "/api/v1/idleDataReport?reportFlag=odo&startOdo=" +
          start +
          "&endOdo=" +
          end +
          "&reportThreshold=" +
          threshold +
          "&deviceID=" +
          vehicle;
      }
      fetch(api)
        .then((response) => response.json())
        .then((data) => {
          console.log("fetch ", data);
          this.setState({
            result: data.items,
            status: true,
            dataTable: "loaded",
          });
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      alert("Select vehicle");
    }
  }
  componentDidMount() {
    fetch("/api/v1/getDeviceIDs")
      .then((response) => response.json())
      .then((data) => {
        console.log("fetch ", data);
        this.setState({
          vehicle: data.ids,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    // Date range picker
    let start = this.state.startDate.format("YYYY-MM-DD");
    let end = this.state.endDate.format("YYYY-MM-DD");
    let label = start + " - " + end;
    if (start === end) {
      label = start;
    }
    let tb = null;

    if (this.state.status === true && this.state.result.length > 1) {
      tb = <TableCreation data={this.state.result} heading={this.title} />;
    } else if (this.state.status === true && this.state.result.length === 1) {
      tb = <div className={ReportsCSS.noRecords}>No records found!</div>;
    } else if (this.state.loader === true) {
      tb = <div className={ReportsCSS.noRecords}>Loading...</div>;
    }

    return (
      <div>
        <div className="pageHeader">{this.title}</div>
        <div className="form-row align-items-center">
          <div className="col-auto my-1">
            <select
              className="custom-select mr-sm-2"
              id="inlineFormCustomSelect"
              placeholder="Select Vehicle"
              onChange={this.handleChange}
              name="selectedVehicle"
              title="Select the vehicle"
            >
              <option>---Select Vehicle---</option>
              {this.state.vehicle &&
                this.state.vehicle.map((h, i) => (
                  <option key={i} value={h.key}>
                    {h.value}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-auto my-1">
            <ButtonGroup aria-label="Basic example">
              <Button
                variant={this.state.activeDate}
                value="odo"
                onClick={this.searchBy}
                className={this.state.activeDate}
              >
                Odo
              </Button>
              <Button
                variant={this.state.activeOdo}
                value="date"
                onClick={this.searchBy}
                className={this.state.activeOdo}
              >
                Date
              </Button>
            </ButtonGroup>
          </div>
          <div className="col-auto my-1">
            <div className={this.state.searchByDate}>
              <DatetimeRangePicker
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                ranges={this.state.ranges}
                onEvent={this.handleEvent}
              >
                <input
                  type="text"
                  className={ReportsCSS.dateRangePicker}
                  value={label}
                />
              </DatetimeRangePicker>
            </div>
          </div>
          <div className="col-auto my-1">
            <div className={this.state.searchByOdo}>
              <input
                type="text"
                className={ReportsCSS.startOdo}
                placeholder="Start ODO"
                name="startOdo"
                title="Enter the start odo"
                onChange={this.handleChange}
                value={this.state.startOdo}
              />
              <input
                type="text"
                className={ReportsCSS.endOdo}
                placeholder="End ODO"
                name="endOdo"
                title="Enter the end odo"
                onChange={this.handleChange}
                value={this.state.endOdo}
              />
            </div>
          </div>
          <div className="col-auto my-1 ">
            <select
              className="custom-select mr-sm-2"
              id="inlineFormCustomSelect"
              placeholder="Select Threshold"
              onChange={this.handleChange}
              name="threshold"
              title="Threshold"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="30">30</option>
            </select>
          </div>
          <div className="col-auto my-1 ">
            <button
              onClick={this.fetchData}
              className="btn btn-primary btn-custom"
            >
              Submit
            </button>
          </div>
        </div>
        <div>{tb}</div>
        <div></div>
      </div>
    );
  }
}

export default IdleSummaryReport;
