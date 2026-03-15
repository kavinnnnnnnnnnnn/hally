import React from 'react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, error });
    try {
      fetch('http://localhost:5000/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.toString(), stack: errorInfo.componentStack })
      });
    } catch(e) {}
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: '20px', color: 'red'}}><h1>Something went wrong.</h1><pre>{this.state.error?.toString()}</pre></div>;
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
