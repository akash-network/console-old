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
    <div className="flex justify-center items-center mx-auto">
      <div>
        <div>
          <p className="flex justify-start text-2xl font-bold mt-8 ">{introText}</p>
          <hr className="text-[#e5e7eb] mb-5 mt-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-between items-center gap-4">
          {tiles && tiles.map((tile) => <TileCard item={tile} />)}
        </div>
        <hr className="text-[#e5e7eb] mb-5 mt-8" />
        <div className="w-full h-full p-6 bg-white border border-[#0000001A] rounded-lg mt-[72px]">
          <div className="block lg:flex gap-5">
            <div>
              <p className="text-2xl font-bold text-center md:text-left">{sdlGuideIntroText}</p>
              <p
                className="text-center w-[250px] md:w-72 md:text-left text-base my-4 mb-5 md:mb-5"
                dangerouslySetInnerHTML={{ __html: introDescription }}
              ></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-between items-center gap-4">
              {sdlGuideTiles &&
                sdlGuideTiles.map((tile) => (
                  <div className="">
                    <div>
                      <img className="guide-img" src={tile.image} alt={tile.step} />
                      <p className=" text-base font-bold mt-4">{tile.step}</p>
                      <p className="text-base md:text-lg mt-4 font-bold w-60 md:w-80 mb-8">
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
