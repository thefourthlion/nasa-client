import React, { useState, useEffect } from "react";
import Axios from "axios";
const key = "fZZsNoM9UQAPoTXWMG3Uf5Yi0qiGIVDTdYSynBgS";
const EpicDateForm = () => {
  const [chosenDate, setChosenDate] = useState("");

  const [apodData, setApodData] = useState({});
  const today = new Date();
  const dd = today.getDate();
  const mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();

  const todaysDate = `${yyyy}-${mm}-${dd}`;

  const getImage = () => {
    Axios.get(
      `https://api.nasa.gov/EPIC/api/natural/date/${chosenDate}/?api_key=${key}`
    ).then((res) => {
      const data = res.data;
      setApodData(data);
    });
  };

  return (
    <div className="EpicDateForm">
      <div className="container">
        <h1 className="content-header">Earth Polychromatic Imaging Camera</h1>
        <input
          className="date-choice"
          type="date"
          onChange={(e) => {
            setChosenDate(e.target.value);
          }}
        />

        <br />

        <button
          onClick={() => {
            getImage();
          }}
        >
          Search Image
        </button>

        <img className={`nasa-img`} src={apodData.hdurl} />
        <h1 className="title">{apodData.title}</h1>
        <h2 className="explanation"> {apodData.explanation}</h2>
      </div>
    </div>
  );
};
export default EpicDateForm;
