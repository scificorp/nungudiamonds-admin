import { useState, useMemo, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Typography,
  IconButton,
  Checkbox,
  ListItemText,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import { Icon as Iconify } from '@iconify/react'

interface Option {
  id: number
  name?: string
  [key: string]: any
}

interface MultiSelectDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (selected: number[]) => void
  title: string
  options: Option[]
  selectedIds: number[]
  labelKey?: string
  idKey?: string
  loading?: boolean
}

const MultiSelectDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  options,
  selectedIds,
  labelKey = 'name',
  idKey = 'id',
  loading = false
}: MultiSelectDialogProps) => {
  const [search, setSearch] = useState('')
  const [tempSelected, setTempSelected] = useState<number[]>(selectedIds)

  useEffect(() => {
    if (open) {
      setTempSelected(selectedIds)
    }
  }, [open, selectedIds])

  const filteredOptions = useMemo(() => {
    if (!search) return options
    
return options.filter(opt =>
      String(opt[labelKey]).toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search, labelKey])

  const handleToggle = (id: number) => {
    setTempSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (tempSelected.length === filteredOptions.length) {
      setTempSelected([])
    } else {
      setTempSelected(filteredOptions.map(opt => opt[idKey]))
    }
  }

  const handleConfirm = () => {
    onConfirm(tempSelected)
    onClose()
  }

  const handleClose = () => {
    setTempSelected(selectedIds)
    setSearch('')
    onClose()
  }

  const selectedNames = tempSelected.map(id => {
    const opt = options.find(o => o[idKey] === id)
    
return opt ? opt[labelKey] : ''
  }).filter(Boolean)

  if (options.length === 0 && !loading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify icon='tabler:checkbox' />
          {title}
        </DialogTitle>
        <DialogContent dividers>
          <Typography color='text.secondary' align='center' sx={{ py: 4 }}>
            No options available
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose} variant='outlined'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon='tabler:checkbox' />
        {title}
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} sx={{ color: '#c6a55a' }} />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size='small'
                placeholder='Search...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Iconify icon='tabler:search' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {selectedNames.length === 0 ? (
                <Typography color='text.secondary' variant='body2'>
                  No items selected
                </Typography>
              ) : (
                selectedNames.map((name, idx) => (
                  <Chip
                    key={idx}
                    label={name}
                    size='small'
                    sx={{
                      backgroundColor: '#c6a55a',
                      color: '#000',
                      fontWeight: 500
                    }}
                  />
                ))
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Button size='small' onClick={handleSelectAll}>
                {tempSelected.length === filteredOptions.length && filteredOptions.length > 0
                  ? 'Clear All'
                  : 'Select All'}
              </Button>
              <Typography variant='caption' color='text.secondary'>
                {tempSelected.length} selected
              </Typography>
            </Box>

            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {filteredOptions.length === 0 ? (
                <Typography color='text.secondary' align='center' sx={{ py: 2 }}>
                  No results found
                </Typography>
              ) : (
                filteredOptions.map(option => {
                  const id = option[idKey]
                  const isSelected = tempSelected.includes(id)
                  
return (
                    <Box
                      key={id}
                      onClick={() => handleToggle(id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        cursor: 'pointer',
                        borderRadius: 1,
                        bgcolor: isSelected ? 'rgba(198, 165, 90, 0.15)' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <Checkbox checked={isSelected} />
                      <ListItemText
                        primary={option[labelKey]}
                        primaryTypographyProps={{
                          fontWeight: isSelected ? 600 : 400
                        }}
                      />
                      {isSelected && (
                        <Iconify icon='tabler:check' color='#c6a55a' />
                      )}
                    </Box>
                  )
                })
              )}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MultiSelectDialog
