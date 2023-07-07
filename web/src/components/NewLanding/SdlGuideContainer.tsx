import React from 'react';
import styled from '@emotion/styled';


export const SdlGuideContainer: React.FC<{
  sdlGuideTiles: {
    introText: string; 
    introDescription: string; 
    tiles: {
      step: string; 
      text: string; 
      image: string }[] 
    }
}> = ({ sdlGuideTiles }) => {
  return <SdlGuideCardsWrapper>
    <GuideIntroCard>
      <GuideIntroHeader>
        {sdlGuideTiles?.introText}
      </GuideIntroHeader>
      <GuideIntroDescription>
        {sdlGuideTiles?.introDescription}
      </GuideIntroDescription>
    </GuideIntroCard>

    {sdlGuideTiles?.tiles?.map((c) => {
      return (
        <GuideCard key={c.text}>
          <GuideImageWrapper>
            <img src={'https://raw.githubusercontent.com/akash-network/deploy-templates/main' + c.image} />
          </GuideImageWrapper>
          <GuideHeader>{c.step}</GuideHeader>
          <GuideHeader>{c.text}</GuideHeader>
        </GuideCard>
      );
    })}
  </SdlGuideCardsWrapper>;
};

const SdlGuideCardsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;

  padding: 24px;
  gap: 24px;

  width: 100%;

  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;


const GuideImageWrapper = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
`;


const GuideIntroDescription = styled.div`
  font-size: 16px;
  line-height: 24px;
  margin-top: 8px;

  color: rgba(0, 0, 0, 0.5);
`;

const GuideHeader = styled.h3`
  font-weight: 700;
  font-size: 18px;
  line-height: 20px;


  color: #111827;
`;

const GuideIntroHeader = styled.h2`
  font-weight: 700;
  font-size: 24px;
  line-height: 32px;

  color: #111827;
`;

const GuideCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  flex: 1;
  min-width: 318.75px;
  height: 280px;
`;

const GuideIntroCard = styled(GuideCard)`
  justify-content: flex-start;
  height: auto;
`;