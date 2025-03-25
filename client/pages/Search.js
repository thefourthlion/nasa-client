import React, { useState, useEffect } from "react";
import Head from "next/head";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState("");

  const handleMediaTypeChange = (newType) => {
    if (newType !== mediaType) {
      setMediaType(newType);
      setResults([]);
      setCurrentPage(1);
      setHasNextPage(false);
      setNextPageUrl("");
      setError(null);
    }
  };

  const searchNASA = async (url) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if there's a next page
      const nextPageLink = data.collection.links?.find(link => link.rel === "next");
      setHasNextPage(!!nextPageLink);
      setNextPageUrl(nextPageLink?.href || "");
      
      return data.collection.items;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchTerm)}&media_type=${mediaType}`;
    const searchResults = await searchNASA(url);
    setResults(searchResults);
    setCurrentPage(1);
  };

  const loadNextPage = async () => {
    if (!hasNextPage) return;
    
    const nextResults = await searchNASA(nextPageUrl);
    setResults(prev => [...prev, ...nextResults]);
    setCurrentPage(prev => prev + 1);
  };

  // Function to render media content based on media type
  const renderMediaContent = (item) => {
    const data = item.data[0];
    
    // For images
    if (mediaType === "image") {
      const imageLink = item.links?.find(link => 
        link.rel === "preview" || link.render === "image"
      );
      
      if (!imageLink) return <div className="no-media">No preview available</div>;
      
      return (
        <div className="image-container">
          <img 
            src={imageLink.href} 
            alt={data.title} 
            loading="lazy"
          />
        </div>
      );
    }
    
    // For audio
    if (mediaType === "audio") {
      // We need to find the actual audio file URL
      // First get the href from the item
      const href = item.href;
      
      return (
        <div className="audio-container">
          <AudioPlayer nasaId={data.nasa_id} collectionUrl={href} title={data.title} />
        </div>
      );
    }
    
    // For video
    if (mediaType === "video") {
      // Similar to audio, we need to find the actual video file
      const href = item.href;
      
      return (
        <div className="video-container">
          <VideoPlayer nasaId={data.nasa_id} collectionUrl={href} title={data.title} />
        </div>
      );
    }
    
    return <div className="no-media">Unsupported media type</div>;
  };

  return (
    <div className="search-container">
      <Head>
        <title>NASA Media Search</title>
        <meta name="description" content="Search NASA's media library for images, audio, and video" />
      </Head>

      <h1>NASA Media Search</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="media-type-selector">
          <label>
            <input 
              type="radio" 
              name="mediaType" 
              value="image" 
              checked={mediaType === "image"} 
              onChange={() => handleMediaTypeChange("image")} 
            />
            <span>Images</span>
          </label>
          <label>
            <input 
              type="radio" 
              name="mediaType" 
              value="audio" 
              checked={mediaType === "audio"} 
              onChange={() => handleMediaTypeChange("audio")} 
            />
            <span>Audio</span>
          </label>
          <label>
            <input 
              type="radio" 
              name="mediaType" 
              value="video" 
              checked={mediaType === "video"} 
              onChange={() => handleMediaTypeChange("video")} 
            />
            <span>Video</span>
          </label>
        </div>
        
        <div className="search-input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search NASA ${mediaType}...`}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </div>
      </form>

      {error && <div className="error-message">Error: {error}</div>}
      
      {loading && <div className="loading">Loading...</div>}
      
      <div className="media-grid">
        {results.map((item, index) => {
          const data = item.data[0];
          
          return (
            <div key={index} className={`media-card ${mediaType}-card`}>
              {renderMediaContent(item)}
              <div className="media-info">
                <h3>{data.title}</h3>
                <p className="date">{new Date(data.date_created).toLocaleDateString()}</p>
                <p className="description">
                  {data.description_508 || 
                   (data.description && data.description.length > 150 
                     ? data.description.substring(0, 150) + "..." 
                     : data.description)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {results.length === 0 && !loading && (
        <div className="no-results">
          {searchTerm ? "No results found. Try a different search term or media type." : "Search for NASA media using the form above."}
        </div>
      )}
      
      {hasNextPage && (
        <div className="load-more">
          <button onClick={loadNextPage} disabled={loading}>
            {loading ? "Loading..." : "Load More Results"}
          </button>
        </div>
      )}
    </div>
  );
}

// Component to handle audio files
function AudioPlayer({ nasaId, collectionUrl, title }) {
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchAudioUrl() {
      try {
        // First fetch the collection to get the actual audio files
        const response = await fetch(collectionUrl);
        const collection = await response.json();
        
        // Find a suitable audio file (preferably mp3)
        const audioFile = collection.find(file => 
          file.toLowerCase().endsWith('.mp3') || 
          file.toLowerCase().endsWith('.wav') || 
          file.toLowerCase().endsWith('.m4a')
        );
        
        if (audioFile) {
          setAudioUrl(audioFile);
        }
      } catch (error) {
        console.error("Error fetching audio URL:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (collectionUrl) {
      fetchAudioUrl();
    }
  }, [collectionUrl, nasaId]);
  
  if (loading) {
    return <div className="loading-media">Loading audio...</div>;
  }
  
  if (!audioUrl) {
    return <div className="no-media">Audio file not available</div>;
  }
  
  return (
    <div className="audio-player">
      <audio controls>
        <source src={audioUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

// Component to handle video files
function VideoPlayer({ nasaId, collectionUrl, title }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  useEffect(() => {
    async function fetchVideoUrl() {
      try {
        // First fetch the collection to get the actual video files
        const response = await fetch(collectionUrl);
        const collection = await response.json();
        
        // Find a suitable video file
        const videoFile = collection.find(file => 
          file.toLowerCase().endsWith('.mp4') || 
          file.toLowerCase().endsWith('.mov') || 
          file.toLowerCase().endsWith('.avi')
        );
        
        // Find a thumbnail
        const thumbFile = collection.find(file => 
          file.toLowerCase().includes('thumb') && 
          (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png'))
        );
        
        if (videoFile) {
          setVideoUrl(videoFile);
        }
        
        if (thumbFile) {
          setThumbnailUrl(thumbFile);
        }
      } catch (error) {
        console.error("Error fetching video URL:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (collectionUrl) {
      fetchVideoUrl();
    }
  }, [collectionUrl, nasaId]);
  
  if (loading) {
    return <div className="loading-media">Loading video...</div>;
  }
  
  if (!videoUrl) {
    return <div className="no-media">Video file not available</div>;
  }
  
  return (
    <div className="video-player">
      <video controls poster={thumbnailUrl}>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video element.
      </video>
    </div>
  );
}
