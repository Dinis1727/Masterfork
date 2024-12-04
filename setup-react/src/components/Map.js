// src/components/Map.js
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const Map = () => {
  const mapStyles = {
    height: "400px",
    width: "100%"
  };

  const defaultCenter = {
    lat: 40.859666057491275,
    lng: -8.658703899999999
  };

  return (
    <LoadScript googleMapsApiKey="SUA_CHAVE_API_AQUI"> {/* Substitua pela sua chave de API do Google Maps */}
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={13}
        center={defaultCenter}
      >
        <Marker position={defaultCenter} />  {/* Coloca o marcador no centro */}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
