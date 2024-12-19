import React from "react";
import DirectionsMap from "../../DirectionsMap/DirectionsMap";
import Modal from "../Modal/Modal";

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Route Map" size="lg">
      <DirectionsMap
        width="100%"
        height="400px"
        origin={origin}
        destination={destination}
      />
    </Modal>
  );
};

export default MapModal;
