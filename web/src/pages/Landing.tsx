import React from 'react';
import { metadata } from '../Landing-Metadata/landing';
import TileCard from '../components/TileCard/TileCard';

import '../style/landing.css';

function Landing() {
  const { introText, tiles } = metadata.categoriesTiles;
  const {
    introText: sdlGuideIntroText,
    introDescription,
    tiles: sdlGuideTiles,
  } = metadata.sdlGuideTiles;

  return (
    <div className="tile_card_top-wrapper con" style={{ marginTop: '-50px' }}>
      <div className="tile_card_container">
        <div>
          <p className="landing-head">{introText}</p>
          {/* <hr className="landing_hr" /> */}
        </div>
        <div className="tile-card_wrapper">
          {tiles && tiles.map((tile) => <TileCard item={tile} />)}
        </div>
        {/* <hr className="landing_hr" /> */}
        <div className="sdlguide_wrapper">
          <div className="sdlguide_flex-wrapper">
            <div className="top_sdlText-wrapper">
              <p className="intro_text">{sdlGuideIntroText}</p>
              <p className="intro_desc">{introDescription}</p>
            </div>
            <div className="sdlguide_card-wrapper">
              {sdlGuideTiles &&
                sdlGuideTiles.map((tile) => (
                  <div className="sdlguide-content-wrapper">
                    <div>
                      <img className="guide-img" src={tile.image} alt={tile.step} />
                      <p className="sdl_step">{tile.step}</p>
                      <p className="sdl-guide-text">{tile.text}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
