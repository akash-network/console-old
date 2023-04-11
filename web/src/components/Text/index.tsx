import styled from '@emotion/styled';

const FontSatoshi = styled.div`
  font-family: 'Satoshi-Regular';
`;

const TitleBase = styled(FontSatoshi)`
  font-style: normal;
  font-weight: 600;
  color: #111827;
  margin: auto;
`;

const Title24 = styled(TitleBase)`
  font-size: 24px;
`;

const Title18 = styled(TitleBase)`
  font-size: 18px;
`;

const Title16 = styled(TitleBase)`
  font-size: 16px;
`;

const Title14 = styled(TitleBase)`
  font-size: 14px;
`;

const Title12 = styled(TitleBase)`
  font-size: 12px;
`;

const TextBase = styled(FontSatoshi)`
  font-style: normal;
  font-weight: 400;
  color: #6b7280;
  margin: auto;
`;

const Text24 = styled(TextBase)`
  font-size: 24px;
`;

const Text18 = styled(TextBase)`
  font-size: 18px;
`;

const Text16 = styled(TextBase)`
  font-size: 16px;
`;

const Text14 = styled(TextBase)`
  font-size: 14px;
`;

const Text12 = styled(TextBase)`
  font-size: 12px;
`;

const titleMap = {
  24: Title24,
  18: Title18,
  16: Title16,
  14: Title14,
  12: Title12,
};

const textMap = {
  24: Text24,
  18: Text18,
  16: Text16,
  14: Text14,
  12: Text12,
};

type TitleType = keyof typeof titleMap;
type TextType = keyof typeof textMap;

type TitleProps = {
  size: TitleType;
  children: React.ReactNode;
  className?: string;
};

type TextProps = {
  size: TextType;
  children: React.ReactNode;
  className?: string;
};

export const Title: React.FC<TitleProps> = ({ size, className, ...rest }: TextProps) => {
  const Component = titleMap[size];
  return <Component {...rest} className={className} />;
};

export const Text: React.FC<TextProps> = ({ size, className, ...rest }: TextProps) => {
  const Component = textMap[size];
  return <Component {...rest} className={className} />;
};
