import React from 'react';
import { metadata } from '../Landing-Metadata/landing';
import TileCard from '../components/TileCard/TileCard';

function Landing() {
  const { introText, tiles } = metadata.categoriesTiles;
  const {
    introText: sdlGuideIntroText,
    introDescription,
    tiles: sdlGuideTiles,
  } = metadata.sdlGuideTiles;

  return (
    <div className="flex items-center justify-center mx-auto">
      <div>
        <div>
          <p className="flex justify-start mt-8 text-2xl font-bold ">{introText}</p>
          <hr className="text-[#e5e7eb] mb-5 mt-8" />
        </div>
        <div className="grid items-center justify-between grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiles && tiles.map((tile, idx) => <TileCard key={`type-tile_${idx}`} item={tile} />)}
        </div>
        <hr className="text-[#e5e7eb] mb-5 mt-8" />
        <div className="w-full h-full p-6 bg-white border border-[#0000001A] rounded-lg mt-[72px]">
          <div className="block gap-5 lg:flex">
            <div>
              <p className="text-2xl font-bold text-center md:text-left">{sdlGuideIntroText}</p>
              <p
                className="text-center w-[250px] md:w-72 md:text-left text-base my-4 mb-5 md:mb-5"
                dangerouslySetInnerHTML={{ __html: introDescription }}
              ></p>
            </div>
            <div className="grid items-center justify-between grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sdlGuideTiles &&
                sdlGuideTiles.map((tile, idx) => (
                  <div key={`guide-tile_${idx}`}>
                    <div>
                      <img className="guide-img" src={tile.image} alt={tile.step} />
                      <p className="mt-4 text-base font-bold ">{tile.step}</p>
                      <p className="mt-4 mb-8 text-base font-bold md:text-lg w-60 md:w-80">
                        {tile.text}
                      </p>
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
