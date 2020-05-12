import React, { Component } from "react";
import Table from "react-responsive-data-table";
class TableCreation extends Component {
  constructor(props) {
    super(props);
  }
  state = { table: this.ParseData(this.props.heading, this.props.data) };
  GetHeader(data) {
    return data[0];
  }
  GetData(data) {
    console.log("Test", data);
    const tmp = JSON.parse(JSON.stringify(data));
    tmp.shift();
 /*    tmp[0] = "";
    console.log("tmp", tmp); */
    return tmp;
  }
  ParseData(heading, data) {
    console.log("check", data);
    return (
      <Table
        style={{
          opacity: 0.8,
          backgroundColor: "grey",
          color: "#ffffff",
          textAlign: "center",
        }}
        tableStyle="table table-hover table-bordered table-responsive-xl"
        pages={true}
        pagination={true}
        onRowClick={() => {}} // if You Want Table Row Data OnClick then assign this {row => console.log(row)}
        page={true}
        errormsg="Error. . ."
        loadingmsg="Loading. . ."
        isLoading={false}
        sort={true}
        title={heading}
        search={true}
        size={10}
        data={{
          head: this.GetHeader(data),
          data: this.GetData(data),
        }}
      />
    );
  }
  componentDidMount() {
    let count =this.props.data.length;
    if (count != undefined) {
      count -=1;
      document.querySelector(
        ".react-bs-table-tool-bar > .row > .col-8"
      ).innerHTML =
        "<input class='form-control my-0 grey-border' type='text' placeholder='Search' aria-label='Search' style='padding-bottom: 4px; border-radius: 0px 4px 4px 0px;'><p class='totalRecordsCount'>Total record(s) : <span class='bgSpan'>" +
        count +
        "</span></p>";
    }
  }
  render() {
    return this.state.table;
  }
}
export default TableCreation;
