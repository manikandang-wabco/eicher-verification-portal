import React, { Component } from "react";
import ReportUploadCSS from "./ReportUpload.module.css";
class ReportUpload extends Component {
  constructor(props) {
    super(props);
    document.title = "Report Upload";
    this.reportUploadHandler = this.reportUploadHandler.bind(this);
  }
  state = {
    fileName: "",
  };
  reportUploadHandler(event) {
    let fileName = event.target.files[0].name;
    this.setState({ fileName: "[Uploading..] " + fileName });
    const files = event.target.files;
    const formData = new FormData();
    console.log("files[0] " + JSON.stringify(files[0]));
    formData.append("rawExcel", files[0]);
    fetch("/api/v1/feedFileUpload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({ fileName: "[Uploading...] " + fileName });
        setTimeout(() => {
          this.setState({ fileName: "[Uploaded] " + fileName });
          setTimeout(() => {
            this.setState({ fileName: fileName + " parsed successfully! " });
            setTimeout(() => {
              this.setState({
                fileName:
                  "Date : " +
                  data.file.slice(0, 10) +
                  " || Device ID : " +
                  data.file.slice(11, 26),
              });
              let x = document.getElementById("myAudio");
              x.src = "https://freetone.org/files/6/drum.mp3";
              x.play();
            }, 500);
          }, 2000);
        }, 1000);
      })
      .catch((error) => {
        this.setState({
          fileName: "Problem with " + fileName + " error " + error,
        });
        console.error(error);
      });
  }
  componentDidMount() {}
  render() {
    return (
      <div className={ReportUploadCSS.reportUpload}>
        <audio id="myAudio">
          <source src="notify.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <div className="container">
          <div className="card cardLayout">
            <div className={ReportUploadCSS.dropArea}>
              <input
                type="file"
                onChange={this.reportUploadHandler}
                name="file"
                id="fileUpload"
                className={ReportUploadCSS.fileUpload}
              />
              <h3>Drop here any Eicher AIS format feed file</h3>
            </div>
            {/*  <input
          type="submit"
          value="Upload Now"
          name="submit"

          className={"btn btn-primary " + ReportUploadCSS.btnUpload}
        ></input> */}
          </div>
        </div>
        <h3 className={ReportUploadCSS.uploadStatus}>{this.state.fileName}</h3>
      </div>
    );
  }
}

export default ReportUpload;
