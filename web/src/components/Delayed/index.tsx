import React from 'react';

interface DelayedProps {
  children: React.ReactNode;
  delayTime?: number;
}

const Delayed = ({ children, delayTime = 1000 }: DelayedProps) => {
  const [isShown, setIsShown] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, delayTime);
    return () => clearTimeout(timer);
  }, [delayTime]);

  return isShown ? <>{children}</> : null;
};

export default Delayed;
