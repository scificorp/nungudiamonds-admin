import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button } from '@mui/material'
import Icon from 'src/@core/components/icon'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo: errorInfo.componentStack || null
    })

    console.error('ErrorBoundary caught an error:', error, errorInfo)

    if (this.isAuthError()) {
      console.log('Authentication error detected, redirecting to login...')
      this.handleRedirectToLogin()
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  private handleRedirectToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  private isAuthError = (): boolean => {
    if (!this.state.error) return false
    const errorMessage = this.state.error.message || ''
    const errorString = errorMessage.toLowerCase()
    
return (
      errorString.includes('401') ||
      errorString.includes('unauthorized') ||
      errorString.includes('invalid user') ||
      errorString.includes('jwt') ||
      errorString.includes('token') ||
      errorString.includes('auth')
    )
  }

  public render() {
    if (this.state.hasError) {
      if (this.isAuthError()) {
        return null
      }

      return this.props.fallback || (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 4,
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <Icon icon='tabler:alert-circle' fontSize='2.5rem' color='error' />
          </Box>

          <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
            Something went wrong
          </Typography>

          <Typography variant='body1' color='text.secondary' sx={{ mb: 3, maxWidth: 500 }}>
            We encountered an unexpected error. This has been logged and our team will investigate.
          </Typography>

          {this.state.error && (
            <Typography
              variant='body2'
              color='text.disabled'
              sx={{ mb: 3, fontFamily: 'monospace' }}
            >
              {this.state.error.message}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant='contained'
              onClick={this.handleReload}
              startIcon={<Icon icon='tabler:refresh' />}
              sx={{
                backgroundColor: '#c6a55a',
                '&:hover': { backgroundColor: '#b8944d' }
              }}
            >
              Reload Page
            </Button>

            <Button
              variant='outlined'
              onClick={this.handleGoBack}
              startIcon={<Icon icon='tabler:arrow-left' />}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      )
    }
    
return this.props.children
  }
}

export default ErrorBoundary
