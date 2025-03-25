import React, { useState, useEffect, useRef, useCallback } from "react";
import Axios from "axios";

const Scroll = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10; // Number of images to load per page
  const observer = useRef();
  
  // Function to format date as YYYY-MM-DD with proper zero padding
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Function to get yesterday's date
  const getYesterday = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return formatDate(date);
  };
  
  // Function to format date for display (MM-DD-YY)
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear().toString().substr(-2);
    return `${month}-${day}-${year}`;
  };

  // Initialize with today's date
  useEffect(() => {
    const today = new Date();
    setCurrentDate(formatDate(today));
    setImages([]); // Reset images when component mounts
    setPage(0); // Reset page counter
  }, []);

  // Load images with pagination instead of by date
  useEffect(() => {
    const fetchImages = async () => {
      if (loading) return;
      setLoading(true);
      
      try {
        // Use the pagination endpoint instead of date-specific endpoint
        const response = await Axios.get(
          `http://localhost:3002/api/apod/read?page=${page}&limit=${pageSize}`
        );
        
        const data = response.data;
        
        if (data.length === 0) {
          setHasMore(false);
        } else {
          // Filter to only include images (not videos)
          const imageEntries = data.filter(item => item.media_type === "image");
          
          // Add new images to the existing array
          setImages(prevImages => {
            // Combine previous and new images
            const combinedImages = [...prevImages, ...imageEntries];
            
            // Remove any duplicates based on date
            const uniqueImages = Array.from(
              new Map(combinedImages.map(item => [item.date, item])).values()
            );
            
            // Sort by date in descending order (newest first)
            return uniqueImages.sort((a, b) => new Date(b.date) - new Date(a.date));
          });
          
          // Increment page for next load
          setPage(page + 1);
        }
      } catch (error) {
        console.error("Error fetching APOD data:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [page]);

  // For date-specific loading (optional functionality)
  const loadImageByDate = async (date) => {
    try {
      const response = await Axios.get(`http://localhost:3002/api/apod/date/${date}`);
      const data = response.data;
      
      if (data && data.media_type === "image") {
        // Add to images if not already present
        if (!images.some(img => img.date === data.date)) {
          setImages(prevImages => [...prevImages, data]);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error fetching image for date ${date}:`, error);
      return false;
    }
  };

  // Set up the intersection observer for infinite scrolling
  const lastImageElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        // When the last image is visible, load more images
        // The page will be incremented, triggering the useEffect to load more
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Function to handle image download
  const handleDownload = (e, imageUrl, title) => {
    e.stopPropagation(); // Prevent opening the modal when clicking download
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Function to open modal with selected image
  const openModal = (image) => {
    setSelectedImage(image);
    setModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };
  
  // Function to close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
    // Restore scrolling
    document.body.style.overflow = 'auto';
  };
  
  // Close modal when clicking Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div className="Scroll">
      <div className="container">
        <h1 className="content-header">Astronomy Picture Of The Day</h1>
        
        <div className="image-grid">
          {images.map((image, index) => {
            const isLastElement = index === images.length - 1;
            return (
              <div 
                className="image-container" 
                key={image.date}
                ref={isLastElement ? lastImageElementRef : null}
                onClick={() => openModal(image)}
              >
                <div className="image-wrapper">
                  <img 
                    className="nasa-img" 
                    src={image.hdurl} 
                    alt={image.title}
                  />
                  <div className="date-indicator">
                    {image.date}
                  </div>
                  <button 
                    className="download-btn"
                    onClick={(e) => handleDownload(e, image.hdurl, image.title)}
                    aria-label="Download image"
                  >
                  </button>
                  
                  <div className="image-overlay">
                    <h3 className="title-overlay">{image.title}</h3>
                    <p className="date-overlay">{image.date}</p>
                  </div>
                </div>
                
                {/* Hidden content for accessibility and SEO */}
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
        
        {/* Modal for displaying full image details */}
        <div className={`modal ${modalOpen ? 'open' : ''}`} onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedImage && (
              <>
                <button className="modal-close" onClick={closeModal}>×</button>
                <img 
                  className="modal-img" 
                  src={selectedImage.hdurl} 
                  alt={selectedImage.title}
                />
                <h2 className="modal-title">{selectedImage.title}</h2>
                <p className="modal-date">{selectedImage.date}</p>
                <p className="modal-explanation">{selectedImage.explanation}</p>
                <button 
                  className="download-btn"
                  onClick={(e) => handleDownload(e, selectedImage.hdurl, selectedImage.title)}
                  style={{ position: 'absolute', bottom: '20px', right: '20px' }}
                  aria-label="Download image"
                >
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scroll;
