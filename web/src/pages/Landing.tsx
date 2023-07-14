import React from 'react';
import { metadata } from '../Landing-Metadata/landing';
import TileCard from '../components/TileCard/TileCard';

import '../style/landing.css';

function Landing() {
  const { introText, tiles } = metadata.categoriesTiles;

  return (
    <div className="tile_card_top-wrapper">
     
      <div className="tile_card_container">
      <div className="landing-head">{introText}</div>
      <div style={{ display:'flex', justifyContent:'space-between'}}>
      {tiles && tiles.map((tile) => <TileCard item={tile} />)}
      </div>
 
      </div>
    </div>
  );
}

export default Landing;
