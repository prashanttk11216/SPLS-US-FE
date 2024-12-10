import React, { useEffect, useState } from "react";
import { Map, Marker, useMap } from "@vis.gl/react-google-maps";

interface LatLng {
  lat: number;
  lng: number;
}

interface DirectionsMapProps {
  origin: LatLng;
  destination: LatLng;
  width: string;
  height: string;
}

const DirectionsMap: React.FC<DirectionsMapProps> = ({ origin, destination, height, width }) => {
  const map = useMap();
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    const loadDirectionsLibrary = async () => {
      const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes") as google.maps.RoutesLibrary;

      if (map) {
        const service = new DirectionsService();
        const renderer = new DirectionsRenderer({ map });

        setDirectionsService(service);
        setDirectionsRenderer(renderer);
      }
    };

    loadDirectionsLibrary().catch((error) => console.error("Failed to load directions library:", error));
  }, [map]);

  useEffect(() => {
    if (directionsService && directionsRenderer) {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          } else {
            console.error(`Failed to calculate directions: ${status}`);
          }
        }
      );
    }
  }, [directionsService, directionsRenderer, origin, destination]);

  return (
    <div style={{ width: width, height: height }}>
      <Map
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          latitude: (origin.lat + destination.lat) / 2,
          longitude: (origin.lng + destination.lng) / 2,
          zoom: 12,
        }}
      >
        <Marker position={{ lat: origin.lat, lng: origin.lng }} />
        <Marker position={{ lat: destination.lat, lng: destination.lng }} />
      </Map>
    </div>
  );
};

export default DirectionsMap;
