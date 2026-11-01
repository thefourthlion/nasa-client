import { useState } from "react";
import { apiUrl, safeNasaUrl } from "../lib/api";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const MrpDateForm = () => {
  const [chosenDate, setChosenDate] = useState("");
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");

  const getImage = async () => {
    if (!DATE_RE.test(chosenDate)) {
      setError("Choose a date.");
      setPhotos([]);
      return;
    }
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/nasa/mars?date=${chosenDate}`));
      if (!response.ok) {
        setError("No Mars photos are available for that date.");
        setPhotos([]);
        return;
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setPhotos(list);
      if (list.length === 0) setError("No Mars photos are available for that date.");
    } catch {
      setError("Could not reach the server.");
      setPhotos([]);
    }
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
        <button onClick={getImage} type="button">
          Search Image
        </button>
        {error ? <h2 className="explanation">{error}</h2> : null}
        {photos.map((photo) => {
          const src = safeNasaUrl(photo.img_src);
          if (!src) return null;
          return (
            <div key={photo.id}>
              <h1 className="title">{photo.camera}</h1>
              <img className="nasa-img" src={src} alt={photo.camera || "Mars rover photo"} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MrpDateForm;
