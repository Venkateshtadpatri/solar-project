import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log error messages to an error reporting service here
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI with Tailwind CSS classes
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-blue-200 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">
            Something went wrong.
          </h1>
          <p className="text-lg text-black">
            We are working to fix the issue. Please try again later.
          </p>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
