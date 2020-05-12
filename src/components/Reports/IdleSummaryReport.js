import React, { Component } from "react";
import moment from "moment";
import TableCreation from "./TableCreation";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-daterangepicker/daterangepicker.css";
import ReportsCSS from "./Reports.module.css";
import ActionBar from "./ActionBar";

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
    showElem:".dropdown-input-threshold",
    searchByDate: "show",
    searchByOdo: "hide",
    startDate: moment().subtract(29, "days").startOf("day"),
    endDate: moment().endOf("day"),
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
    selectedVehicle: "",
    speed: 60,
    mainApi: "",
    dataTable: "Loading",
    threshold: 1800,
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
  };
  handleOdoChange = (startOdo,endOdo) => {
    this.setState({
      startOdo: startOdo,
      endOdo: endOdo,
    });
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
        let start = this.state.startDate.format("YYYY-MM-DD HH:mm:ss");
        let end = this.state.endDate.format("YYYY-MM-DD HH:mm:ss");
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

  render() {
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
        <ActionBar
          handleChange={this.handleChange}
          searchBy={this.searchBy}
          fetchData={this.fetchData}
          stateVal={this.state}
          handleEvent={this.handleEvent}
          handleOdoChange={this.handleOdoChange}
        />
        <div>{tb}</div>
        <div></div>
      </div>
    );
  }
}

export default IdleSummaryReport;
