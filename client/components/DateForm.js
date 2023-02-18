import React, { useState, useEffect } from "react";
import Axios from "axios";

const DateForm = () => {
  const [chosenDate, setChosenDate] = useState("");

  const [apodData, setApodData] = useState({});
  const today = new Date();
  const dd = today.getDate();
  const mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();

  const todaysDate = `${yyyy}-${mm}-${dd}`;

  // useEffect(() => {
  //   setChosenDate(todaysDate);
  // });

  const getImage = () => {
    Axios.get(
      `https://api.nasa.gov/planetary/apod?date=${chosenDate}&api_key=fZZsNoM9UQAPoTXWMG3Uf5Yi0qiGIVDTdYSynBgS`
    ).then((res) => {
      const data = res.data;
      setApodData(data);
    });
  };

  // useState(() => {
  //   getImage();
  // });

  return (
    <div className="DateForm">
      <div className="container">
        <h1 className="content-header">Astronomy Picture Of The Day</h1>
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
export default DateForm;
