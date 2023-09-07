import styled from '@emotion/styled';
import { Avatar, Button, Stack } from '@mui/material';
import axios from 'axios';
import yaml from 'js-yaml';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { transformSdl } from '../_helpers/helpers';
import { ButtonTemplate } from '../components/Button';
import SocialIcon from '../components/Icons/SocialIcon';
import { isSDLSpec } from '../components/SdlConfiguration/settings';
import { Template } from '../components/SdlConfiguration/settings';
import { WalletDeployButtons } from '../components/WalletDeployButton';
import { fetchSdlList, fetchTemplateList } from '../recoil/api/sdl';
import { templateIcons } from '../assets/templates';

type SocialNetwork = {
  socialNetwork: string;
  url: string;
};

export interface SelectAppProps {
  folderName: string;
  onNextButtonClick: (id: string) => any;
  setFieldValue: (name: string, value: any) => void;
}

export default function SelectApp(props: SelectAppProps): JSX.Element {
  const { folderName, onNextButtonClick, setFieldValue } = props;
  const { data: directoryConfig } = useQuery(['sdlList', { folderName }], fetchSdlList, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const [selectedSdl, setSelectedSdl] = useState<Template>(
    directoryConfig?.topology?.topologyList?.find(
      (topology: any) => topology.title === directoryConfig?.topology?.selected
    )
  );

  const { data: templateListConfig } = useQuery(['templateList', 'nodes'], fetchTemplateList, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  const [social, setSocial] = useState<SocialNetwork[]>([]);

  useEffect(() => {
    setSelectedSdl(
      directoryConfig?.topology?.topologyList?.find(
        (topology: any) => topology.title === directoryConfig?.topology?.selected
      )
    );
  }, [directoryConfig]);

  useEffect(() => {
    const result = [];

    if (directoryConfig?.topology?.social) {
      for (const [key, value] of Object.entries(directoryConfig?.topology.social)) {
        if (typeof value === 'string' && value.length > 0) {
          result.push({
            socialNetwork: key,
            url: value,
          });
        }
      }

      setSocial(result);
    }
  }, []);

  const selectTemplateAndFetchSdl = async (template: Template) => {
    setSelectedSdl(template);
    try {
      const response = await axios.get(template.url);
      //const configuration = await yaml.load(response.data);
      const configuration = await yaml.load(response.data);
      // We need to transform storage property to be arrayed by default to be able to add persistent storage
      if (isSDLSpec(configuration)) {
        setFieldValue('sdl', transformSdl(configuration));
      } else {
        console.error('Selected template is not a valid SDL spec');
      }
    } catch (e) {
      new Error(e as any);
    }
  };

  const template = templateListConfig.tiles.find((template: any) => template.name === folderName);

  return (
    <Stack className="items-center">
      <SdlWrapper>
        <SdlIntro>
          {folderName && template && (
            <Avatar
              src={templateIcons[template.logoFileNameWithoutExt]}
              alt="Logo"
            />
          )}
          <SdlInformation>
            <SdlInformationTitle>{directoryConfig?.title.name}</SdlInformationTitle>
            <SdlInformationDescription>
              {directoryConfig?.title.description}
            </SdlInformationDescription>
          </SdlInformation>
          {/* Please look at the => https://app.zenhub.com/workspaces/overclock-engineering-62633c61724345001aa75887/issues/ovrclk/console/199 */}
          {/* Also un-comment line 303 when this feature should be visible */}
          {/*<ShareButton startIcon={<Icon type="share" />} variant="outlined" size="small">*/}
          {/*  Share*/}
          {/*</ShareButton>*/}
        </SdlIntro>
        {directoryConfig?.topology && (
          <React.Fragment>
            <Divider />
            {directoryConfig?.topology.topologyList?.length >= 1 && (
              <SdlInformationTitle fontWeight={500}>
                Choose from one of the available topology options
              </SdlInformationTitle>
            )}
            <TypologyWrapper>
              {directoryConfig?.topology.topologyList?.length >= 1 &&
                directoryConfig?.topology.topologyList?.map((typology: Template, index: number) => {
                  return (
                    <WalletDeployButtons
                      key={typology.title}
                      typology={typology}
                      selected={selectedSdl}
                      index={index}
                      length={directoryConfig.topology.topologyList.length}
                      onButtonSelect={selectTemplateAndFetchSdl}
                    />
                  );
                })}
            </TypologyWrapper>
            <DeployButton
              variant="contained"
              disabled={!selectedSdl}
              onClick={() => onNextButtonClick(selectedSdl.title.toLowerCase())}
            >
              Deploy Now
            </DeployButton>
          </React.Fragment>
        )}

        <SocialWrapper>
          {social?.map((obj: any, i: number) => {
            return <SocialIcon key={i} socialNetwork={obj.socialNetwork} url={obj.url} />;
          })}
        </SocialWrapper>

        {directoryConfig?.promotion && (
          <React.Fragment>
            <Divider />
            <PromotionWrapped>
              <PromotionInformation>
                <SdlInformationTitle fontWeight={500}>
                  {directoryConfig?.promotion.title}
                </SdlInformationTitle>
                <SdlInformationDescription>
                  {directoryConfig?.promotion.description}
                </SdlInformationDescription>
                <CTAButton>CTA Promotion</CTAButton>
              </PromotionInformation>
              <PromotionImage>
                <img src={directoryConfig?.promotion.image} alt="Promotion" />
              </PromotionImage>
            </PromotionWrapped>
          </React.Fragment>
        )}
        {directoryConfig?.headline && (
          <React.Fragment>
            <Divider />
            <Headline>
              <SdlInformationTitle fontWeight={500}>
                {directoryConfig?.headline.title}
              </SdlInformationTitle>
              <SdlInformationDescription>
                {directoryConfig?.headline.description}
              </SdlInformationDescription>
              <CTAButton>Button</CTAButton>
            </Headline>
          </React.Fragment>
        )}
        {directoryConfig?.video && (
          <React.Fragment>
            <Divider />
            <VideoWrapper>
              <SdlInformationTitle fontWeight={500}>Video</SdlInformationTitle>
              <img src={directoryConfig?.video} alt="Directory config"></img>
            </VideoWrapper>
          </React.Fragment>
        )}
      </SdlWrapper>
    </Stack>
  );
}

const SocialWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const SdlWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
  gap: 24px;
  max-width: 929px;
  width: 100%;

  background: #ffffff;
  box-shadow: 0px 1px 3px 0px #0000001a;
  border-radius: 8px;
`;

const SdlIntro = styled.div`
  display: flex;
  align-items: start;
  width: 100%;
`;

const SdlInformation = styled.div`
  padding: 0 20px;
`;

const SdlInformationTitle = styled.h4<{ fontWeight?: number }>`
  font-weight: ${(props) => props?.fontWeight ?? 700};
  font-size: 16px;
  line-height: 24px;
  color: #111827;
`;
const SdlInformationDescription = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #6b7280;
`;

const TypologyWrapper = styled.div`
  display: flex;
  width: 100%;
  column-gap: 12px;
`;

const DeployButton = styled(Button)`
  align-self: end;

  &:hover {
    background-color: #925562;
  }

  &:disabled {
    color: white;
    background-color: #7e7073;
  }
`;

// const ShareButton = styled(Button)`
//   ${ButtonTemplate};
//   margin-left: auto;
// `;

const CTAButton = styled(Button)`
  ${ButtonTemplate};
`;

const Divider = styled.div`
  width: 100%;
  background: #e5e7eb;
  height: 1px;
`;

const PromotionWrapped = styled.div`
  display: flex;
  column-gap: 30px;
`;

const PromotionInformation = styled.div`
  row-gap: 20px;
  display: flex;
  flex-direction: column;
  align-items: baseline;
`;

const PromotionImage = styled.div``;

const Headline = styled.div`
  row-gap: 20px;
  display: flex;
  flex-direction: column;
  align-items: baseline;
`;

const VideoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 30px;
  width: 100%;
`;
