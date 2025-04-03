import { Component } from "react";

class ErrorBoundary extends Component {
  /**
   * Initializes the ErrorBoundary component with the given props, and sets the
   * initial state for error handling.
   *
   * @param {object} props - The properties passed to the component.
   */

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * Returns a new state with hasError set to true, which causes the fallback
   * UI to be rendered on the next render.
   *
   * This method is a static method of the ErrorBoundary class, and is called
   * automatically by React when an error occurs in the subtree rooted at this
   * component.
   *
   * @return {object} The new state with hasError set to true.
   */
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  /**
   * Catch any errors that occur in the subtree rooted at this component, log the
   * error to the console, and update the state to show the fallback UI.
   *
   * The signature of this method is defined in the React documentation:
   * https://reactjs.org/docs/react-component.html#componentdidcatch
   *
   * @param {Error} error The error that was thrown. This can be an instance of
   *     any error type, including syntax errors and runtime errors.
   * @param {object} errorInfo An object with a component stack property that
   *     contains information about which component threw the error.
   */
  componentDidCatch(error, errorInfo) {
    // You can also log error messages to an error reporting service here
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  /**
   * Renders either the children of this component (if there is no error),
   * or a fallback UI if there is an error.
   *
   * @return {React.ReactElement} The rendered component.
   */
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

    // eslint-disable-next-line react/prop-types
    return this.props.children; 
  }
}

export default ErrorBoundary;
