import { useState, useEffect, useRef, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Controller, useWatch } from "react-hook-form";

interface PlaceAutocompleteFieldProps {
  name: string; // Field name for react-hook-form
  label: string;
  placeholder?: string;
  rules?: any;
  control?: any;
  disabled?: boolean;
  onPlaceSelect?: (placeDetails: {
    formatted_address: string | null;
    street_number: string | null;
    route: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lng: number | null;
  }) => void;
  className?: string; // Custom class for the input field
}

const PlaceAutocompleteField = ({
  name,
  label,
  placeholder = "Enter your address",
  rules,
  control,
  disabled= false,
  onPlaceSelect,
  className = "",
}: PlaceAutocompleteFieldProps) => {
  const [inputValue, setInputValue] = useState<string>(""); // Internal state for display
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  let inputRef = useRef<HTMLInputElement | null>(null);
  const places = useMapsLibrary("places");

  // Watch the field value to reset internal state when form resets
  const fieldValue = useWatch({ control, name });

  // Sync `inputValue` with the external field value
  useEffect(() => {
    if (fieldValue?.str === undefined || fieldValue?.str === null) {
      setInputValue(""); // Reset internal state
    } else {
      setInputValue(fieldValue.str); // Sync with external field value
    }
  }, [fieldValue]);

  // Initialize the Autocomplete API on component mount
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: [
        "address_components",
        "geometry",
        "formatted_address",
        "name",
        "place_id",
        "types",
      ],
    };

    const autocompleteInstance = new places.Autocomplete(inputRef.current, options);
    setPlaceAutocomplete(autocompleteInstance);

    return () => {
      // Cleanup: clear all event listeners on the instance
      if (autocompleteInstance) {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [places]);

  // Handle place selection and extract details when a place is chosen
  useEffect(() => {
    if (!placeAutocomplete) return;

    const handlePlaceChanged = () => {
      const place = placeAutocomplete.getPlace();
      if (place) {
        console.log(place);
        
        const details = extractPlaceDetails(place);
        setInputValue(details.formatted_address || ""); // Update internal input display
        if (onPlaceSelect) onPlaceSelect(details); // Trigger parent callback
      }
    };

    placeAutocomplete.addListener("place_changed", handlePlaceChanged);

    return () => {
      google.maps.event.clearInstanceListeners(placeAutocomplete);
    };
  }, [placeAutocomplete, onPlaceSelect]);

  // Extract relevant place details
  const extractPlaceDetails = useCallback((place: google.maps.places.PlaceResult) => {
    const addressComponents = place.address_components || [];
    const getComponent = (type: string) =>
      addressComponents.find((component) => component.types.includes(type))?.long_name || null;

    return {
      formatted_address: place.formatted_address || null,
      street_number: getComponent("street_number"), // Street number
      route: getComponent("route"), // Street name/route
      city: getComponent("locality"), // City
      state: getComponent("administrative_area_level_1"), // State
      postal_code: getComponent("postal_code"), // Postal code
      country: getComponent("country"), // Country
      lat: place.geometry?.location?.lat() || null,
      lng: place.geometry?.location?.lng() || null,
    };
  }, []);

  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label className="form-label text-dark-blue" htmlFor={`autocomplete-${name}`}>
          {label}
          {rules?.required && " *"}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <input
              id={`autocomplete-${name}`}
              ref={(el) => {
                field.ref(el); // React Hook Form's ref
                inputRef.current = el; // Local ref
              }}
              className={`form-control form-control-lg ${fieldState?.invalid ? "is-invalid" : ""}`}
              placeholder={placeholder}
              onBlur={field.onBlur}
              disabled={field.disabled}
              name={field.name}
              value={inputValue}
              autoComplete="off"
              onChange={(e) => {
                setInputValue(e.target.value); // Update display value
                field.onChange({ str: e.target.value }); // Update form state
              }}
            />
            {fieldState?.error && (
              <span className="text-danger">{fieldState?.error?.message}</span>
            )}
          </>
        )}
      />
    </div>
  );
};

export default PlaceAutocompleteField;

