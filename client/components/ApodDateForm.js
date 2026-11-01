import { useState } from "react";
import { apiUrl, safeNasaUrl } from "../lib/api";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const ApodDateForm = () => {
  const [chosenDate, setChosenDate] = useState("");
  const [apodData, setApodData] = useState({});
  const [error, setError] = useState("");
  const imageUrl = safeNasaUrl(apodData.hdurl || apodData.url);

  const getImage = async () => {
    if (!DATE_RE.test(chosenDate)) {
      setError("Choose a date.");
      setApodData({});
      return;
    }
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/nasa/apod?date=${chosenDate}`));
      if (!response.ok) {
        setError("No picture is available for that date.");
        setApodData({});
        return;
      }
      setApodData(await response.json());
    } catch {
      setError("Could not reach the server.");
      setApodData({});
    }
  };

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
        <button onClick={getImage} type="button">
          Search Image
        </button>
        {error ? <h2 className="explanation">{error}</h2> : null}

        {apodData.date === undefined ? (
          <div>
            <h1 className="title">The Horsehead Nebula in Infrared from Hubble</h1>
            <img className="nasa-img" src="./images/nasa-example.jpg" alt="Horsehead Nebula" />
            <h2 className="explanation">
              While drifting through the cosmos, a magnificent interstellar dust cloud became
              sculpted by stellar winds and radiation to assume a recognizable shape. Fittingly
              named the Horsehead Nebula, it is embedded in the vast and complex Orion Nebula
              (M42). A potentially rewarding but difficult object to view personally with a small
              telescope, the above gorgeously detailed image was taken in 2013 in infrared light
              by the orbiting Hubble Space Telescope in honor of the 23rd anniversary of Hubble&apos;s
              launch. The dark molecular cloud, roughly 1,500 light years distant, is cataloged as
              Barnard 33 and is seen above primarily because it is backlit by the nearby massive
              star Sigma Orionis. The Horsehead Nebula will slowly shift its apparent shape over
              the next few million years and will eventually be destroyed by the high energy
              starlight. April: (AWB&apos;s) Global Astronomy Month
            </h2>
          </div>
        ) : (
          <div>
            <h1 className="title">{apodData.title}</h1>
            {imageUrl ? (
              <img className="nasa-img" src={imageUrl} alt={apodData.title || "Astronomy picture"} />
            ) : null}
            <h2 className="explanation">{apodData.explanation}</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApodDateForm;
