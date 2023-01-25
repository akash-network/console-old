import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <h1>Something went wrong.</h1>
          <p>{(this.state as any).error.message}</p>
          <p>{(this.state as any).error.stack}</p>
        </>
      );
    }

    return (this.props as any)?.children;
  }
}
