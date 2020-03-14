import { Component, ReactNode } from 'react'

// Error boundaries currently have to be classes.
export default class ErrorBoundary extends Component<{ fallback: NonNullable<ReactNode>|null }> {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error: Record<string, any>) {
    return {
      hasError: true,
      error
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
