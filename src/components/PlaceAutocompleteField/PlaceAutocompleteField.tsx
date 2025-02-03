import { useState, useEffect, useRef, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { Controller, UseFormSetValue, useWatch } from "react-hook-form";

interface PlaceAutocompleteFieldProps {
  name: string; // Field name for react-hook-form
  label: string;
  placeholder?: string;
  rules?: any;
  control?: any;
  setValue: UseFormSetValue<any>;
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
  setValue,
  control,
  onPlaceSelect,
  className = "",
}: PlaceAutocompleteFieldProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  let inputRef = useRef<HTMLInputElement | null>(null);
  const places = useMapsLibrary("places");

  // Watch the field value to reset internal state when form resets
  const fieldValue = useWatch({ control, name });

  // Sync internal input state with field value
  useEffect(() => {
    setInputValue(fieldValue?.str || ""); // Use 'str' from the object
  }, [fieldValue]);

  // Initialize the Autocomplete API on component mount
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["address_components", "geometry", "formatted_address", "place_id", "types"],
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
        const details = extractPlaceDetails(place);
        setInputValue(details.formatted_address || "");

        // Use setValue from props instead of control.setValue
        setValue(name, {
          str: details.formatted_address!,
          lat: details.lat!,
          lng: details.lng!,
        },  { shouldValidate: true });

        if (onPlaceSelect) onPlaceSelect(details);
      }
    };

    placeAutocomplete.addListener("place_changed", handlePlaceChanged);

    return () => {
      google.maps.event.clearInstanceListeners(placeAutocomplete);
    };
  }, [placeAutocomplete, onPlaceSelect, control, name]);

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
      {
        control && (

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
              autoComplete="new-password" // Most effective way to disable autocomplete
              spellCheck="false" 
              aria-autocomplete="none"
              onChange={(e) => {
                setInputValue(e.target.value);
                field.onChange({
                  str: e.target.value, // Maintain object format
                  lat: field.value?.lat || null,
                  lng: field.value?.lng || null,
                });
              }}
            />
            {fieldState?.error && <span className="text-danger">{fieldState.error.message}</span>}
          </>
        )}
      />

        )
      }
    </div>
  );
};

export default PlaceAutocompleteField;
