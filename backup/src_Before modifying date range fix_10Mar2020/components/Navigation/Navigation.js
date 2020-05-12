import React, { Component } from "react";
import { NavLink } from "react-router-dom";
class Navigation extends Component {
  initialSettings() {
    let linkHover =
      "a.bg-light:hover{background-color: #00529e !important; color: #fff !important;}a.bg-light:focus{background-color: #00529e !important; color: #fff !important;}";
    let style = document.createElement("style");

    if (style.styleSheet) {
      style.styleSheet.cssText = linkHover;
    } else {
      style.appendChild(document.createTextNode(linkHover));
    }

    document.getElementsByTagName("head")[0].appendChild(style);
  }
  constructor(props) {
    super(props);
    this.initialSettings();
  }
  componentDidMount() {
    let dropdown = document.getElementsByClassName("dropdown-btn");
    let i;
    for (i = 0; i < dropdown.length; i++) {
      dropdown[i].addEventListener("click", function() {
        this.classList.toggle("active");
        let dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
          dropdownContent.style.display = "none";
        } else {
          dropdownContent.style.display = "block";
        }
      });
    }
  }
  render() {
    return (
      <div className="d-flex" id="wrapper">
        <div className="bg-light border-right" id="sidebar-wrapper">
          <div className="sidebar-heading">Eicher Portal</div>
          <div className="list-group list-group-flush">
            <NavLink
              className="list-group-item list-group-item-action bg-light nav-link-custom report-upload"
              activeClassName="active"
              to="/reportUpload"
            >
              Report Upload
            </NavLink>

            <NavLink
              className="dropdown-btn list-group-item list-group-item-action bg-light nav-link-custom"
              to="/reports"
            >
              Reports
              <i className="fa fa-caret-down"></i>
            </NavLink>
            <div className="dropdown-container">
              <NavLink
                className="list-group-item list-group-item-action bg-light nav-link-custom"
                activeClassName="active"
                to="/overSpeedReport"
              >
                Over Speed Report
              </NavLink>
              <NavLink
                className="list-group-item list-group-item-action bg-light nav-link-custom"
                activeClassName="active"
                to="/vehicleData"
              >
                Vehicle Data
              </NavLink>
              <NavLink
                className="list-group-item list-group-item-action bg-light nav-link-custom"
                activeClassName="active"
                to="/idleReport"
              >
                Idle Summary Report
              </NavLink>
              <NavLink
                className="list-group-item list-group-item-action bg-light nav-link-custom"
                activeClassName="active"
                to="/stoppageReport"
              >
                Stoppage Report
              </NavLink>
              <NavLink
                className="list-group-item list-group-item-action bg-light nav-link-custom"
                activeClassName="active"
                to="/vehicleSummaryReport"
              >
                Vehicle Summary Report
              </NavLink>
            </div>
          </div>
        </div>
        {this.props.content}
      </div>
    );
  }
}

export default Navigation;
