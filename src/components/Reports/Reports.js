import React, { Component } from "react";
import { NavLink } from "react-router-dom";

class Reports extends Component {
  constructor(props) {
    super(props);
    document.title = "Reports";
  }

  state = {
    reportList: [
      {
        link: "/overSpeedReport",
        name: "Over Speed Report",
      },
      {
        link: "/vehicleData",
        name: "Vehicle Data",
      },
      {
        link: "/idleReport",
        name: "Idle Summary Report",
      },
      {
        link: "/stoppageReport",
        name: "Stoppage Report",
      },
      {
        link: "/vehicleSummaryReport",
        name: "Vehicle Summary Report",
      },
    ],
    navLinks: ""
  };

  componentDidMount() {
    let links = this.state.reportList.map((obj) => {
      return (
        <tr key={obj.link}>
          <td>
            <NavLink to={obj.link}>{obj.name}</NavLink>
          </td>
        </tr>
      );
    });
    this.setState({
      navLinks: links,
    });
  }

  render() {
    return (
      <div className="custom-container-reports">
        <table className="table table-hover reports-custom">
          <thead>
            <th
              style={{
                lineHeight: "32px",
                fontSize: "12px",
              }}
            >
              List of Reports
            </th>
          </thead>

          <tbody>{this.state.navLinks}</tbody>
        </table>
      </div>
    );
  }
}

export default Reports;
