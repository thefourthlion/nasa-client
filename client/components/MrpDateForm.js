import React, { useState, useEffect } from "react";
import Axios from "axios";
const key = "fZZsNoM9UQAPoTXWMG3Uf5Yi0qiGIVDTdYSynBgS";
const MrpDateForm = () => {
  const [chosenDate, setChosenDate] = useState("");

  const [mrpData, setMrpData] = useState({});
  const today = new Date();
  const dd = today.getDate();
  const mm = today.getMonth() + 1;
  const yyyy = today.getFullYear();

  const todaysDate = `${yyyy}-${mm}-${dd}`;

  const getImage = () => {
    Axios.get(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${chosenDate}&api_key=${key}`
    ).then((res) => {
      const data = res.data;
      setMrpData(data.photos);
      console.log(data.photos);
    });
  };

  return (
    <div className="MrpDateForm">
      <div className="container">
        <h1 className="content-header">Mars Rover Photos</h1>
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
        {mrpData.length > 0 && (
          <>
            {mrpData.slice(0, mrpData.length).map((val) => (
              <>
                <h1 className="title">{val.camera.full_name}</h1>
                <img className={`nasa-img`} src={val.img_src} />
              </>
            ))}
          </>
        )}

        {/* <h2 className="explanation"> {mrpData.explanation}</h2> */}
      </div>
    </div>
  );
};
export default MrpDateForm;
