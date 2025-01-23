interface LatLng {
  lat: number;
  lng: number;
}

const calculateDistance = (
  origin: LatLng,
  destination: LatLng
): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (
      typeof google !== "undefined" &&
      google.maps &&
      google.maps.DistanceMatrixService
    ) {
      const service = new google.maps.DistanceMatrixService();

      service.getDistanceMatrix(
        {
          origins: [new google.maps.LatLng(origin.lat, origin.lng)],
          destinations: [
            new google.maps.LatLng(destination.lat, destination.lng),
          ],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL, // For miles, use METRIC for kilometers
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK) {
            const distanceText =
              response?.rows[0]?.elements[0]?.distance?.value;
            resolve(distanceText || 0);
          } else {
            reject(`Error calculating distance: ${status}`);
          }
        }
      );
    } else {
      reject("Google Maps API is not loaded");
    }
  });
};

export function formatDistance(distanceInMeters: number) {
  const distanceInMiles = Math.round((distanceInMeters / 1609.344)); // Convert and round
  return distanceInMiles; // Append unit
}

export default calculateDistance;
