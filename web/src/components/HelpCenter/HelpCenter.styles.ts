import styled from '@emotion/styled';

export const HelpCenterWrapper = styled.div`
  position: fixed;
  z-index: 9999;
  right: 8px; // Add some margin to the right
  top: 8px; // Add some margin to the top
  bottom: 8px; // Add some margin to the bottom
  width: 360px;
  background-color: #ffffff;
  border-left: 1px solid #e5e7eb;
  padding: 16px;
  overflow-y: auto;
  border-radius: 8px; // Add rounded edges
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); // Add a box shadow for depth
  display: flex;
  flex-direction: column;
`;
export const CloseButton = styled.button`
  position: absolute;

  right: 15px;
  background: transparent;
  border: none;
  font-size: 24px;
`;

export const HelpCenterTitle = styled.h3`
  font-weight: bold;
  font-size: 17px;
  line-height: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
export const ContentTitle = styled.h3`
  font-weight: bold;
  font-size: 23px;
  line-height: 24px;
  padding-bottom: 8px;
  margin-bottom: 16px;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HelpCenterContent = styled.div``;

export const ContentBody = styled.p`
  // Add your content styles here
  font-size: 12.3px;
  margin-bottom: 16px;
`;

export const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); // Add a box shadow for depth
`;

export const CardTitle = styled.h4`
  font-weight: 800;
  font-size: 16px;
  margin-bottom: 8px;
  color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CardTitle2 = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  // Add the marginBottom property here
  marginbottom: 16px;
`;
export const CardTitle3 = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  // Add the marginBottom property here
  marginbottom: 16px;
`;
export const CardBody = styled.p`
  font-weight: 100;
  font-size: 12px;
  line-height: 20px;
  color: black;
`;

export const HelpCenterFooter = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  top: 30px;
`;

export const FooterEntry = styled.a`
  font-size: 12px; // Reduce the font size
  color: black; // Change the font color to black
  text-decoration: none;
  &:hover {
    text-decoration: underline; // Add underline on hover
  }
`;

export const FooterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
`;
export const HelpCenterOverlay = styled.div`
  position: fixed;
  z-index: 9998;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;
