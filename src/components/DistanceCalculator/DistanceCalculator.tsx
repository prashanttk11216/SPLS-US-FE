import { useEffect, useState } from "react";

// interface DistanceProps {
//   origin: string;
//   destination: string;
// }

// const DistanceCalculator: React.FC<DistanceProps> = ({
//   origin,
//   destination,
// }) => {
//   const [distance, setDistance] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     calculateDistance(origin, destination);
//   }, [origin, destination]);

//   const calculateDistance = (origin: string, destination: string) => {
//     const service = new google.maps.DistanceMatrixService();

//     service.getDistanceMatrix(
//       {
//         origins: [origin],
//         destinations: [destination],
//         travelMode: google.maps.TravelMode.DRIVING,
//         unitSystem: google.maps.UnitSystem.IMPERIAL,
//       },
//       (response, status) => {
//         if (status === google.maps.DistanceMatrixStatus.OK) {
//           const distanceText = response?.rows[0].elements[0]?.distance?.text;
//           setDistance(distanceText || "Unknown distance");
//         } else {
//           setError(`Error calculating distance: ${status}`);
//         }
//       }
//     );
//   };

//   return (
//     <div>
//       <h2>Distance Calculator</h2>
//       <p>
//         Origin: <strong>{origin}</strong>
//       </p>
//       <p>
//         Destination: <strong>{destination}</strong>
//       </p>
//       {distance && (
//         <p>
//           Distance: <strong>{distance}</strong>
//         </p>
//       )}
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// };




interface LatLng {
  lat: number;
  lng: number;
  txt: string;
}

interface DistanceProps {
  origin: LatLng;
  destination: LatLng;
}

const DistanceCalculator: React.FC<DistanceProps> = ({ origin, destination }) => {
  const [distance, setDistance] = useState<string | null>(null);
  const [isApiLoaded, setIsApiLoaded] = useState<boolean>(false);

  // Check if the Google Maps API is loaded
  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps) {
      setIsApiLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          setIsApiLoaded(true);
          clearInterval(interval);
        }
      }, 100);
    }
  }, []);

  // Use the API only when it's loaded
  useEffect(() => {
    if (isApiLoaded && google.maps) {
      calculateDistance(origin, destination);
    }
  }, [isApiLoaded, origin, destination]);

  const calculateDistance = (origin: LatLng, destination: LatLng) => {
    if (typeof google !== 'undefined' && google.maps && google.maps.DistanceMatrixService) {
      const service = new google.maps.DistanceMatrixService();
  
      service.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(origin.lat, origin.lng)],
          destinations: [new google.maps.LatLng(destination.lat, destination.lng)],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL, // For miles, use METRIC for kilometers
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK) {
            const distanceText = response?.rows[0].elements[0]?.distance?.text;
            setDistance(distanceText || "Unknown distance");
          }
        }
      );
    } 
  };
  

  if (!isApiLoaded) {
    return <p>Loading Google Maps API...</p>;
  }

  return (
    <div>
      <h2>Distance Calculator</h2>
      <p>
        Origin: <strong>{`(${origin.txt})`}</strong>
      </p>
      <p>
        Destination: <strong>{`(${destination.txt})`}</strong>
      </p>
      {distance && (
        <p>
          Distance: <strong>{distance}</strong>
        </p>
      )}
    </div>
  );
};

export default DistanceCalculator;


