import React, { Component } from "react";
import ReportsCSS from "./Reports.module.css";
import DatetimeRangePicker from "react-bootstrap-datetimerangepicker";
import { Button, ButtonGroup } from "react-bootstrap";

class ActionBar extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  state = {
    vehicle: "",
    label: "",
    startOdo: 0,
    endOdo: 0,
  };
  showElement(e) {
    document.querySelector(e).style.display = "block";
  }
  hideElement(e) {
    document.querySelector(e).style.display = "none";
  }
  handleChange = (e) => {
    this.props.handleChange(e);
    if (e.target.name === "selectedVehicle") {
      fetch("/api/v1/getOdoRange?deviceID=" + e.target.value)
        .then((response) => response.json())
        .then((data) => {
          this.props.handleOdoChange(
            data.items[0].OdometerFrom,
            data.items[0].OdometerTo
          );
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  componentDidMount() {
    let hideElemArr = [
      ".dropdown-input-threshold",
      ".dropdown-input-status",
      "#inputTextBox",
      ".input-item",
    ];
    hideElemArr.forEach((e) => {
      this.hideElement(e);
    });

    if (this.props.stateVal.showElem) {
      this.showElement(this.props.stateVal.showElem);
    }

    this.showElement(".loadingInput");

    fetch("/api/v1/getDeviceIDs")
      .then((response) => response.json())
      .then((data) => {
        console.log("fetch ", data);
        this.setState({
          vehicle: data.ids,
        });
        this.showElement(".input-item");
        this.hideElement(".loadingInput");
      })
      .catch((error) => {
        this.showElement(".input-item");
        this.hideElement(".loadingInput");
        console.error(error);
      });
  }
  render() {
    // Date range picker
    let start = this.props.stateVal.startDate.format("YYYY-MM-DD HH:mm:ss");
    let end = this.props.stateVal.endDate.format("YYYY-MM-DD HH:mm:ss");
    let label = start + " - " + end;
    if (start === end) {
      label = start;
    }
    return (
      <div className="ActionBar">
        <div className="form-row align-items-center">
          <div className="col-auto my-1">
            <select
              className="custom-select mr-sm-2 input-item"
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
            <span className="loadingInput">
              <img
                alt="Loading.."
                className="loading-img"
                src="./images/loading.gif"
              ></img>
            </span>
          </div>

          <div className="col-auto my-1">
            <ButtonGroup aria-label="Basic example">
              <Button
                variant={this.props.stateVal.activeDate}
                value="odo"
                onClick={this.props.searchBy}
                className={this.props.stateVal.activeDate}
              >
                Odo
              </Button>
              <Button
                variant={this.props.stateVal.activeOdo}
                value="date"
                onClick={this.props.searchBy}
                className={this.props.stateVal.activeOdo}
              >
                Date
              </Button>
            </ButtonGroup>
          </div>
          <div className={this.props.stateVal.searchByDate}>
            <div className="col-auto my-1 custom-input-box">
              <DatetimeRangePicker
                timePicker
                timePicker24Hour
                showDropdowns
                timePickerSeconds
                startDate={this.props.stateVal.startDate}
                endDate={this.props.stateVal.endDate}
                ranges={this.props.stateVal.ranges}
                onEvent={this.props.handleEvent}
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
            <div className={this.props.stateVal.searchByOdo}>
              <input
                type="text"
                className={ReportsCSS.startOdo}
                placeholder="Start ODO"
                name="startOdo"
                title="Enter the start odo"
                onChange={this.handleChange}
                value={this.props.stateVal.startOdo}
              />
              <input
                type="text"
                className={ReportsCSS.endOdo}
                placeholder="End ODO"
                name="endOdo"
                title="Enter the end odo"
                onChange={this.handleChange}
                value={this.props.stateVal.endOdo}
              />
            </div>
          </div>
          <div className="col-auto my-1 ">
            <input
              type="text"
              value={this.props.stateVal.speed}
              name="speed"
              title="Enter the speed"
              className={ReportsCSS.speedInput}
              id="inputTextBox"
              onChange={this.handleChange}
            />
            <select
              className="custom-select mr-sm-2 dropdown-input-threshold"
              id="inlineFormCustomSelect"
              placeholder="Select Threshold"
              onChange={this.handleChange}
              name="threshold"
              title="Threshold"
            >
              <option value="300">5</option>
              <option value="600">10</option>
              <option value="1200">20</option>
              <option value="1800" selected>
                30
              </option>
            </select>
            <select
              className="custom-select mr-sm-2 dropdown-input-status"
              id="inlineFormCustomSelect"
              placeholder="Select the status"
              onChange={this.props.handleChange}
              name="Vehiclestatus"
              title="Select the status"
            >
              <option value="All">All</option>
              <option value="Moving">Moving</option>
              <option value="Idle">Idle</option>
              <option value="Stop">Stop</option>
            </select>
          </div>
          <div className="col-auto my-1 ">
            <button
              onClick={this.props.fetchData}
              className="btn btn-primary btn-custom"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ActionBar;
