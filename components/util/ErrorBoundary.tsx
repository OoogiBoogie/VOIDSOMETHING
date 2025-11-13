'use client'

import React from 'react'

type Props = { children: React.ReactNode; fallback: React.ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }
  
  static getDerivedStateFromError() { 
    return { hasError: true } 
  }
  
  componentDidCatch(err: unknown) {
    // Optional: send to your QA logger
    console.error('HUD ErrorBoundary caught error:', err)
  }
  
  render() { 
    return this.state.hasError ? this.props.fallback : this.props.children 
  }
}
