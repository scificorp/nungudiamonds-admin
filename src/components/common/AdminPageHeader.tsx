import { Box, Button, TextField, Typography } from '@mui/material'
import { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  subheader?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  actions?: ReactNode
}

const AdminPageHeader = ({
  title,
  subtitle,
  subheader,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  actions
}: AdminPageHeaderProps) => {
  const description = subtitle ?? subheader

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant='h5' sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        {description ? (
          <Typography variant='body2' color='text.secondary'>
            {description}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        {onSearchChange ? (
          <TextField
            size='small'
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={event => onSearchChange(event.target.value)}
            sx={{ width: { xs: '100%', sm: 320 } }}
          />
        ) : (
          <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
        )}

        {actions ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' },
              '& .MuiButton-root': {
                flex: { xs: '1 1 100%', sm: '0 0 auto' }
              }
            }}
          >
            {actions}
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}

export default AdminPageHeader
