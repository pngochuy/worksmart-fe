/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

const LocationMap = ({ address, companyName }) => {
  const [coordinates, setCoordinates] = useState({
    lat: 10.7776,
    lng: 106.6937,
  }); // Default to HCMC
  const [loading, setLoading] = useState(true);

  // Encode the address for use in URLs
  const encodedAddress = encodeURIComponent(
    address || "Ho Chi Minh City, Vietnam"
  );

  // Function to geocode the address using OpenStreetMap Nominatim API
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!address) return;

      try {
        setLoading(true);
        // Use Nominatim API to convert address to coordinates
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );

        const data = await response.json();

        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        // Keep default coordinates on error
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address, encodedAddress]);

  // URL to open in Google Maps when clicked
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  // Dynamic OpenStreetMap embed URL with the geocoded coordinates
//   const zoomLevel = 17; // Higher zoom level to see more detail
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    coordinates.lng - 0.002
  }%2C${coordinates.lat - 0.002}%2C${coordinates.lng + 0.002}%2C${
    coordinates.lat + 0.002
  }&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`;

  return (
    <div className="sidebar-widget">
      <h4 className="widget-title">Job Location</h4>
      <div className="widget-content">
        <div className="map-container">
          {loading ? (
            <div className="loading-map">
              <div className="spinner"></div>
              <p>Loading map...</p>
            </div>
          ) : (
            <iframe
              title="Location Map"
              width="100%"
              height="250"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={osmUrl}
              style={{ border: 0, borderRadius: "8px 8px 0 0" }}
              allowFullScreen
            ></iframe>
          )}

          <div className="map-actions">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="view-on-map-btn"
            >
              <i className="fas fa-map-marker-alt"></i> View on Google Maps
            </a>
            {address && (
              <div className="address-display">
                <i className="fas fa-map-pin"></i> {address}
                {companyName && (
                  <div className="company-name">
                    <i className="fas fa-building"></i> {companyName}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sidebar-widget {
          margin-bottom: 30px;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .widget-title {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
        }

        .widget-content {
          padding: 0;
        }

        .map-container {
          border-radius: 8px;
          overflow: hidden;
        }

        .loading-map {
          height: 250px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f8f9fa;
          color: #6c757d;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 123, 255, 0.1);
          border-radius: 50%;
          border-top-color: #007bff;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .map-actions {
          padding: 12px;
          background-color: #f8f9fa;
          border-top: 1px solid #eee;
        }

        .view-on-map-btn {
          display: inline-flex;
          align-items: center;
          background-color: #007bff;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .view-on-map-btn:hover {
          background-color: #0069d9;
          text-decoration: none;
          color: white;
        }

        .view-on-map-btn i {
          margin-right: 8px;
        }

        .address-display {
          margin-top: 10px;
          padding: 8px 12px;
          background-color: white;
          border-radius: 4px;
          border: 1px solid #ddd;
          font-size: 14px;
          color: #495057;
        }

        .address-display i {
          color: #dc3545;
          margin-right: 8px;
        }
        
        .company-name {
          margin-top: 5px;
          color: #343a40;
          font-size: 14px;
        }
        
        .company-name i {
          color: #007bff;
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default LocationMap;
