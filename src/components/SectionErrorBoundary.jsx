import React from 'react';

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    console.error(`Error in ${this.props.section || 'section'}:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="mb-4">
            <i className="fas fa-exclamation-circle text-red-500 text-4xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {this.props.title || 'Something went wrong'}
          </h3>
          <p className="text-gray-600 mb-4">
            {this.props.message || 'We encountered an error loading this section. Please try again.'}
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Error Details
              </summary>
              <div className="bg-white p-3 rounded text-xs overflow-auto max-h-32 border border-red-200">
                <p className="font-mono text-red-600">{this.state.error.toString()}</p>
              </div>
            </details>
          )}
          
          <button
            onClick={this.handleRetry}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
