export interface ErrorProps {
  message: string;
}

const Error: React.FC<ErrorProps> = ({ message }: ErrorProps) => {
  return <div>Oh No! Something seems to have gone wrong: {message}</div>;
};

export default Error;
