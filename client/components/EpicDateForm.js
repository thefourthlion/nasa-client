import { useState } from "react";
import { apiUrl, safeNasaUrl } from "../lib/api";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const EpicDateForm = () => {
  const [chosenDate, setChosenDate] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  const getImage = async () => {
    if (!DATE_RE.test(chosenDate)) {
      setError("Choose a date.");
      setImages([]);
      return;
    }
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/nasa/epic?date=${chosenDate}`));
      if (!response.ok) {
        setError("No Earth image is available for that date.");
        setImages([]);
        return;
      }
      const data = await response.json();
      setImages(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length === 0) {
        setError("No Earth image is available for that date.");
      }
    } catch {
      setError("Could not reach the server.");
      setImages([]);
    }
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
        <button onClick={getImage} type="button">
          Search Image
        </button>
        {error ? <h2 className="explanation">{error}</h2> : null}
        {images.map((item) => {
          const src = safeNasaUrl(item.url);
          if (!src) return null;
          return (
            <div key={item.image}>
              <img className="nasa-img" src={src} alt={item.caption || "EPIC Earth image"} />
              <h1 className="title">{item.date}</h1>
              <h2 className="explanation">{item.caption}</h2>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpicDateForm;
