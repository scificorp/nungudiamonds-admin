import { Button, ButtonProps, CircularProgress } from '@mui/material'

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingIndicator?: React.ReactNode
}

const LoadingButton = ({
  loading = false,
  loadingIndicator,
  disabled,
  children,
  startIcon,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      disabled={disabled || loading}
      startIcon={
        loading ? (
          loadingIndicator ?? <CircularProgress size={16} color='inherit' />
        ) : (
          startIcon
        )
      }
      {...props}
    >
      {children}
    </Button>
  )
}

export default LoadingButton
