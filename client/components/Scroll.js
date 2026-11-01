import { useState, useEffect, useRef, useCallback } from "react";
import { apiUrl, safeNasaUrl, safeFilename } from "../lib/api";

const Scroll = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const observer = useRef();
  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const pageToLoad = pageRef.current;
    try {
      const response = await fetch(apiUrl(`/api/apod/read?page=${pageToLoad}&limit=10`));
      if (!response.ok) throw new Error("request failed");
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }
      pageRef.current = pageToLoad + 1;
      const imageEntries = data.filter(
        (item) => item && item.media_type === "image" && safeNasaUrl(item.hdurl)
      );
      setImages((prevImages) => {
        const combined = [...prevImages, ...imageEntries];
        const unique = Array.from(new Map(combined.map((item) => [item.date, item])).values());
        return unique.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      });
      if (data.length < 10) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch {
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  const lastImageElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current) loadMore();
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadMore]
  );

  const handleDownload = (e, imageUrl, title) => {
    e.stopPropagation();
    const src = safeNasaUrl(imageUrl);
    if (!src) return;
    const link = document.createElement("a");
    link.href = src;
    link.download = `${safeFilename(title)}.jpg`;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openModal = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const selectedSrc = selectedImage ? safeNasaUrl(selectedImage.hdurl) : "";

  return (
    <div className="Scroll">
      <div className="container">
        <h1 className="content-header">Astronomy Picture Of The Day</h1>
        <div className="image-grid">
          {images.map((image, index) => {
            const src = safeNasaUrl(image.hdurl);
            if (!src) return null;
            const isLastElement = index === images.length - 1;
            return (
              <div
                className="image-container"
                key={image.date}
                ref={isLastElement ? lastImageElementRef : null}
                onClick={() => openModal(image)}
              >
                <div className="image-wrapper">
                  <img className="nasa-img" src={src} alt={image.title} />
                  <div className="date-indicator">{image.date}</div>
                  <button
                    className="download-btn"
                    onClick={(e) => handleDownload(e, src, image.title)}
                    aria-label="Download image"
                    type="button"
                  />
                  <div className="image-overlay">
                    <h3 className="title-overlay">{image.title}</h3>
                    <p className="date-overlay">{image.date}</p>
                  </div>
                </div>
                <div className="image-info">
                  <h2 className="title">{image.title}</h2>
                  <p className="date">{image.date}</p>
                  <p className="explanation">{image.explanation}</p>
                </div>
              </div>
            );
          })}
          {loading && <div className="loading">Loading more images...</div>}
          {!hasMore && <div className="end-message">No more images to load</div>}
        </div>
        <div className={`modal ${modalOpen ? "open" : ""}`} onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedImage && selectedSrc ? (
              <>
                <button className="modal-close" onClick={closeModal} type="button">
                  ×
                </button>
                <img className="modal-img" src={selectedSrc} alt={selectedImage.title} />
                <h2 className="modal-title">{selectedImage.title}</h2>
                <p className="modal-date">{selectedImage.date}</p>
                <p className="modal-explanation">{selectedImage.explanation}</p>
                <button
                  className="download-btn"
                  onClick={(e) => handleDownload(e, selectedSrc, selectedImage.title)}
                  style={{ position: "absolute", bottom: "20px", right: "20px" }}
                  aria-label="Download image"
                  type="button"
                />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scroll;
