import React from 'react';
import Map from '../components/Map';

const Location = () => {
  return (
    <div>
      <h2>Morada</h2>
      <p>R. Família Colares Pinto 1695, 3880-163 Ovar</p> {/* Endereço da sua empresa */}
      
      <h3>Veja no mapa abaixo:</h3>
      <Map /> {/* Componente que exibe o mapa */}
    </div>
  );
};

export default Location;