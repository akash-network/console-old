import styled from '@emotion/styled';

const LoadingIcon = (props: React.Attributes) => {
  return <div {...props}></div>;
};

const LoadingSpinner = styled(LoadingIcon)`
  background: conic-gradient(from 180deg at 50% 50%, #d6d6d6 0deg, #090808 360deg);
  width: 60px;
  height: 60px;
  display: inline-block;
  border-radius: 30px;
  animation-name: spin;
  animation-duration: 2000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const Loading = ({ title, msg }: { msg?: string; title?: string }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="my-11">
        <LoadingSpinner />
      </div>
      {title && <div className="my-3 text-4xl font-bold">{title}</div>}
      {msg && <div className="my-3 text-2xl">{msg}</div>}
    </div>
  );
};

export default Loading;
