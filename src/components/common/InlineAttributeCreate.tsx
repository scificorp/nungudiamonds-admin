// ** Inline Attribute Creation Dialog
// ** Allows creating new attributes (categories, tags, etc.) from within product forms

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material'
import { Icon } from '@iconify/react'
import { toast } from 'react-hot-toast'
import {
  createAttributeInline,
  createCategoryInline,
  createTagInline,
  createGemstoneInline,
  createDiamondShapeInline,
  createColorInline,
  createClarityInline,
  createCutInline,
  createMmSizeInline,
  createCaratSizeInline
} from 'src/services/AttributeService'

interface AttributeType {
  value: string
  label: string
  endpoint: string
}

const ATTRIBUTE_TYPES: AttributeType[] = [
  { value: 'category', label: 'Category', endpoint: '/category/add' },
  { value: 'tag', label: 'Tag', endpoint: '/attribute/tag' },
  { value: 'gemstone', label: 'Gemstone', endpoint: '/attribute/gemstones/add' },
  { value: 'diamond-shape', label: 'Diamond Shape', endpoint: '/attribute/diamondShapes/add' },
  { value: 'color', label: 'Color', endpoint: '/attribute/colors/add' },
  { value: 'clarity', label: 'Clarity', endpoint: '/attribute/clarity/add' },
  { value: 'cut', label: 'Cut', endpoint: '/attribute/cuts/add' },
  { value: 'mm-size', label: 'MM Size', endpoint: '/attribute/mmSize/add' },
  { value: 'carat-size', label: 'Carat Size', endpoint: '/attribute/caratSize/add' }
]

interface InlineAttributeCreateProps {
  open: boolean
  onClose: () => void
  onSuccess: (newAttribute: { id: number; name: string }) => void
  attributeType?: string
}

const InlineAttributeCreate = ({
  open,
  onClose,
  onSuccess,
  attributeType: initialType = 'category'
}: InlineAttributeCreateProps) => {
  const [attributeType, setAttributeType] = useState(initialType)
  const [name, setName] = useState('')
  const [numericValue, setNumericValue] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedTypeInfo = ATTRIBUTE_TYPES.find(t => t.value === attributeType)

  const handleCreate = async () => {
    if (!name.trim() && !numericValue) {
      setError('Please enter a value')
      
return
    }

    setLoading(true)
    setError('')

    try {
      let response

      switch (attributeType) {
        case 'category':
        case 'tag':
        case 'gemstone':
        case 'diamond-shape':
        case 'color':
        case 'clarity':
        case 'cut':
          response = await createAttributeInline(attributeType, { name: name.trim() })
          break
        case 'mm-size':
          response = await createMmSizeInline({ size: parseFloat(numericValue), description: name.trim() })
          break
        case 'carat-size':
          response = await createCaratSizeInline({ carat: parseFloat(numericValue), description: name.trim() })
          break
        default:
          throw new Error('Unknown attribute type')
      }

      if (response.code === 200 || response.code === '200') {
        toast.success(`${selectedTypeInfo?.label} created successfully!`)
        onSuccess({
          id: response.data?.id || Date.now(),
          name: name.trim() || numericValue
        })
        handleReset()
      } else {
        setError(response.message || 'Failed to create attribute')
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to create attribute')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setName('')
    setNumericValue('')
    setError('')
    onClose()
  }

  const requiresNumericValue = attributeType === 'mm-size' || attributeType === 'carat-size'

  return (
    <Dialog open={open} onClose={handleReset} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon='tabler:plus-circle' color='#c6a55a' />
          Create New {selectedTypeInfo?.label || 'Attribute'}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Attribute Type Selector */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Attribute Type</InputLabel>
            <Select
              value={attributeType}
              label='Attribute Type'
              onChange={(e) => {
                setAttributeType(e.target.value)
                setName('')
                setNumericValue('')
                setError('')
              }}
            >
              {ATTRIBUTE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Name Input */}
          {!requiresNumericValue && (
            <TextField
              autoFocus
              fullWidth
              label={`${selectedTypeInfo?.label} Name *`}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              sx={{ mb: 2 }}
              error={!!error && !requiresNumericValue}
            />
          )}

          {/* Numeric Input for sizes */}
          {requiresNumericValue && (
            <TextField
              autoFocus
              fullWidth
              type='number'
              label={`${selectedTypeInfo?.label} Value *`}
              value={numericValue}
              onChange={(e) => {
                setNumericValue(e.target.value)
                setError('')
              }}
              sx={{ mb: 2 }}
              error={!!error}
              inputProps={{ step: '0.01' }}
            />
          )}

          {/* Optional Description */}
          <TextField
            fullWidth
            label='Description (Optional)'
            value={name}
            onChange={(e) => setName(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
            placeholder='Add a description for this attribute'
          />

          {/* Error Message */}
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Help Text */}
          <Alert severity='info' sx={{ mb: 2 }}>
            The new {selectedTypeInfo?.label.toLowerCase()} will be available immediately after creation.
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleReset} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant='contained'
          disabled={loading || (!name.trim() && !numericValue)}
          sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
        >
          {loading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InlineAttributeCreate
