import React, { useState, useEffect } from "react";
import Axios from "axios";
const key = "fZZsNoM9UQAPoTXWMG3Uf5Yi0qiGIVDTdYSynBgS";
const ApodDateForm = () => {
  const [chosenDate, setChosenDate] = useState("");

  const [apodData, setApodData] = useState({});
  const today = new Date();
  const dd = today.getDate();
  const mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();

  const todaysDate = `${yyyy}-${mm}-${dd}`;

  const getImage = () => {
    Axios.get(
      `https://api.nasa.gov/planetary/apod?date=${chosenDate}&api_key=${key}`
    ).then((res) => {
      const data = res.data;
      setApodData(data);
    });
  };

  console.log(apodData.date);

  return (
    <div className="ApodDateForm">
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

        {apodData.date === undefined ? (
          <>
            <div>
              <h1 className="title">
                The Horsehead Nebula in Infrared from Hubble
              </h1>
              <img className={`nasa-img`} src="./images/nasa-example.jpg" />
              <h2 className="explanation">
                While drifting through the cosmos, a magnificent interstellar
                dust cloud became sculpted by stellar winds and radiation to
                assume a recognizable shape. Fittingly named the Horsehead
                Nebula, it is embedded in the vast and complex Orion Nebula
                (M42). A potentially rewarding but difficult object to view
                personally with a small telescope, the above gorgeously detailed
                image was taken in 2013 in infrared light by the orbiting Hubble
                Space Telescope in honor of the 23rd anniversary of Hubble's
                launch. The dark molecular cloud, roughly 1,500 light years
                distant, is cataloged as Barnard 33 and is seen above primarily
                because it is backlit by the nearby massive star Sigma Orionis.
                The Horsehead Nebula will slowly shift its apparent shape over
                the next few million years and will eventually be destroyed by
                the high energy starlight. April: (AWB's) Global Astronomy Month
              </h2>
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="title">{apodData.title}</h1>
              <img className={`nasa-img`} src={apodData.hdurl} />
              <h2 className="explanation"> {apodData.explanation}</h2>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default ApodDateForm;
