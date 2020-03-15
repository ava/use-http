import { Component, ReactNode } from 'react'

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

// Error boundaries currently have to be classes.
export default class ErrorBoundary extends Component<{ fallback: NonNullable<ReactNode>|null }, ErrorBoundaryState> {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error: Record<string, any>) {
    return {
      hasError: true,
      error
    }
  }

  render() {
    if (this.state.hasError) {
      console.error(this.state.error)
      return this.props.fallback
    }
    return this.props.children
  }
}
