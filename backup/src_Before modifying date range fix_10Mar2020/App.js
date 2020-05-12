import React, { Component } from "react";
import "./App.css";
import Navigation from "./components/Navigation/Navigation";
import ReportUpload from "./components/ReportUpload/ReportUpload";
import NotFound from "./components/NotFound/NotFound";
import Reports from "./components/Reports/Reports";
import OverSpeedReport from "./components/Reports/OverSpeedReport";
import VehicleData from "./components/Reports/VehicleData";
import IdleSummaryReport from "./components/Reports/IdleSummaryReport";
import StoppageReport from "./components/Reports/StoppageReport";
import VehicleSummaryReport from "./components/Reports/VehicleSummaryReport";
import { Route, Switch, Redirect } from "react-router-dom";

class App extends Component {
  toggleSidebar = e => {
    e.preventDefault();
    let element = document.getElementById("wrapper");
    element.classList.toggle("toggled");
    document.querySelector(".page-title").classList.toggle("page-title-show");
  };

  mainContent = (
    <div id="page-content-wrapper">
      <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <button
          className="btn btn-primary btn-custom"
          onClick={this.toggleSidebar}
          id="menu-toggle"
        >
          <i className="fa fa-bars"></i>
        </button>
        <h3 className="page-title page-title-hide">
          Eicher Portal Verification
        </h3>
      </nav>

      <div className="container-fluid">
        <Switch>
          <Route
            path="/"
            exact
            component={() => <Redirect to="/reportUpload" />}
          />
          <Route
            path="/reports"
            component={Reports}
          />
          <Route path="/reportUpload" component={ReportUpload} />
          <Route path="/overSpeedReport" component={OverSpeedReport} />
          <Route path="/vehicleData" component={VehicleData} />
          <Route path="/idleReport" component={IdleSummaryReport} />
          <Route path="/stoppageReport" component={StoppageReport} />
          <Route path="/vehicleSummaryReport" component={VehicleSummaryReport} />
          
          <Route path="/*" exact component={NotFound} />
        </Switch>
      </div>
    </div>
  );
  render() {
    return (
      <div className="App">
        <Navigation content={this.mainContent} />
      </div>
    );
  }
}

export default App;
