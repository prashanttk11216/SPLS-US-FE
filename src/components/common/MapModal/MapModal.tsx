import React from "react";
import DirectionsMap from "../../DirectionsMap/DirectionsMap";
import "./MapModal.scss";

interface LatLng {
  lat: number;
  lng: number;
}

interface MapModalProps {
  isOpen: boolean;
  origin: LatLng;
  destination: LatLng;
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  origin,
  destination,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`mapModal-overlay ${isOpen ? "open" : ""}`}>
      <div className="mapModal-content">
        <button className="mapModal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h3>Calculated Distance</h3>
        <DirectionsMap
          width="100%"
          height="400px"
          origin={origin}
          destination={destination}
        />
      </div>
    </div>
  );
};

export default MapModal;
