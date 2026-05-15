// ** Diamond Quality Matrix Page
// ** Manage diamond pricing based on quality factors (Cut, Color, Clarity, Carat)

import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material'
import { Icon as Iconify } from '@iconify/react'
import { toast } from 'react-hot-toast'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import { appErrors, PAGINATION_INITIAL_VALUE } from 'src/AppConstants'
import {
  DIAMOND_QUALITY_MATRIX_GET,
  DIAMOND_QUALITY_MATRIX_ADD,
  DIAMOND_QUALITY_MATRIX_EDIT,
  DIAMOND_QUALITY_MATRIX_DELETE,
  DIAMOND_SHAPE_MULTIPLIERS_GET,
  DIAMOND_SHAPE_MULTIPLIERS_EDIT,
  CARAT_SIZE_GET_ALL
} from 'src/services/AdminServices'
import { ICommonPagination } from 'src/data/interface'

interface DiamondQualityMatrix {
  id: number
  id_cut: number
  id_color: number
  id_clarity: number
  id_carat: number
  price_per_carat: number
  cut_name?: string
  color_name?: string
  clarity_name?: string
  carat_value?: number
  is_active: number
  created_at: string
  updated_at: string
}

interface DiamondShapeMultiplier {
  id: number
  shape_name: string
  multiplier: number
  description?: string
}

interface DiamondShape {
  id: number
  name: string
}

interface DiamondRateFormData {
  id_cut: number
  id_color: number
  id_clarity: number
  id_carat: number
  price_per_carat: number
}

const asArray = <T,>(value: any): T[] => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.result)) return value.result
  if (Array.isArray(value?.data)) return value.data

  return []
}

const toSafeNumber = (value: unknown) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

const DiamondRatesPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [matrixData, setMatrixData] = useState<DiamondQualityMatrix[]>([])
  const [shapeMultipliers, setShapeMultipliers] = useState<DiamondShapeMultiplier[]>([])
  const [caratOptions, setCaratOptions] = useState<{ id: number; name: string }[]>([])
  const [pagination, setPagination] = useState<ICommonPagination>(PAGINATION_INITIAL_VALUE)

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<DiamondQualityMatrix | null>(null)
  const [deletingItem, setDeletingItem] = useState<DiamondQualityMatrix | null>(null)

  const [formData, setFormData] = useState<DiamondRateFormData>({
    id_cut: 0,
    id_color: 0,
    id_clarity: 0,
    id_carat: 0,
    price_per_carat: 0
  })

  const [cutOptions, setCutOptions] = useState<{ id: number; name: string }[]>([])
  const [colorOptions, setColorOptions] = useState<{ id: number; name: string }[]>([])
  const [clarityOptions, setClarityOptions] = useState<{ id: number; name: string }[]>([])
  const [shapeOptions, setShapeOptions] = useState<DiamondShape[]>([])
  const diamondRatesApiAvailable = false

  useEffect(() => {
    loadDropdownData()
  }, [])

  const loadDropdownData = async () => {
    try {
      const [caratData] = await Promise.all([
        CARAT_SIZE_GET_ALL({ ...PAGINATION_INITIAL_VALUE, per_page_rows: 100 })
      ])

      if (caratData.code === 200 || caratData.code === '200') {
        setCaratOptions(asArray<any>(caratData.data).map(item => ({
          id: item.id,
          name: item.name || item.value || item.slug || String(item.id)
        })))
      }

      setCutOptions([
        { id: 1, name: 'Excellent' },
        { id: 2, name: 'Very Good' },
        { id: 3, name: 'Good' },
        { id: 4, name: 'Fair' },
        { id: 5, name: 'Poor' }
      ])

      setColorOptions([
        { id: 1, name: 'D (Colorless)' },
        { id: 2, name: 'E (Colorless)' },
        { id: 3, name: 'F (Colorless)' },
        { id: 4, name: 'G (Near Colorless)' },
        { id: 5, name: 'H (Near Colorless)' },
        { id: 6, name: 'I (Near Colorless)' },
        { id: 7, name: 'J (Near Colorless)' }
      ])

      setClarityOptions([
        { id: 1, name: 'FL (Flawless)' },
        { id: 2, name: 'IF (Internally Flawless)' },
        { id: 3, name: 'VVS1' },
        { id: 4, name: 'VVS2' },
        { id: 5, name: 'VS1' },
        { id: 6, name: 'VS2' },
        { id: 7, name: 'SI1' },
        { id: 8, name: 'SI2' }
      ])

      setShapeOptions([
        { id: 1, name: 'Round' },
        { id: 2, name: 'Princess' },
        { id: 3, name: 'Emerald' },
        { id: 4, name: 'Asscher' },
        { id: 5, name: 'Marquise' },
        { id: 6, name: 'Oval' },
        { id: 7, name: 'Radiant' },
        { id: 8, name: 'Pear' },
        { id: 9, name: 'Heart' },
        { id: 10, name: 'Cushion' }
      ])
    } catch (error) {
      console.error('Failed to load dropdown data:', error)
    }
  }

  const fetchMatrixData = async () => {
    setLoading(true)
    try {
      const response = await DIAMOND_QUALITY_MATRIX_GET(pagination)
      if (response.code === 200 || response.code === '200') {
        setMatrixData(asArray<DiamondQualityMatrix>(response.data))
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setLoading(false)
    }
  }

  const fetchShapeMultipliers = async () => {
    try {
      const response = await DIAMOND_SHAPE_MULTIPLIERS_GET()
      if (response.code === 200 || response.code === '200') {
        setShapeMultipliers(asArray<DiamondShapeMultiplier>(response.data))
      }
    } catch (error) {
      console.error('Failed to fetch shape multipliers:', error)
    }
  }

  const handleAddMatrixEntry = async () => {
    if (formData.price_per_carat <= 0) {
      toast.error('Please enter a valid price per carat')
      
return
    }

    setSaving(true)
    try {
      const response = await DIAMOND_QUALITY_MATRIX_ADD(formData)
      if (response.code === 200 || response.code === '200') {
        toast.success('Matrix entry added successfully')
        setShowAddDialog(false)
        resetForm()
        fetchMatrixData()
      } else {
        toast.error(response.message || 'Failed to add entry')
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setSaving(false)
    }
  }

  const handleEditMatrixEntry = async () => {
    if (!editingItem || formData.price_per_carat <= 0) {
      toast.error('Please enter a valid price per carat')
      
return
    }

    setSaving(true)
    try {
      const response = await DIAMOND_QUALITY_MATRIX_EDIT({
        id: editingItem.id,
        ...formData
      })
      if (response.code === 200 || response.code === '200') {
        toast.success('Matrix entry updated successfully')
        setShowEditDialog(false)
        setEditingItem(null)
        fetchMatrixData()
      } else {
        toast.error(response.message || 'Failed to update entry')
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMatrixEntry = async () => {
    if (!deletingItem) return

    setSaving(true)
    try {
      const response = await DIAMOND_QUALITY_MATRIX_DELETE({ id: deletingItem.id })
      if (response.code === 200 || response.code === '200') {
        toast.success('Matrix entry deleted successfully')
        setShowDeleteDialog(false)
        setDeletingItem(null)
        fetchMatrixData()
      } else {
        toast.error(response.message || 'Failed to delete entry')
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateShapeMultiplier = async (shapeId: number, multiplier: number) => {
    try {
      const response = await DIAMOND_SHAPE_MULTIPLIERS_EDIT({
        id: shapeId,
        multiplier
      })
      if (response.code === 200 || response.code === '200') {
        toast.success('Shape multiplier updated')
        fetchShapeMultipliers()
      } else {
        toast.error(response.message || 'Failed to update multiplier')
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const resetForm = () => {
    setFormData({
      id_cut: 0,
      id_color: 0,
      id_clarity: 0,
      id_carat: 0,
      price_per_carat: 0
    })
  }

  const openEditDialog = (item: DiamondQualityMatrix) => {
    setEditingItem(item)
    setFormData({
      id_cut: item.id_cut,
      id_color: item.id_color,
      id_clarity: item.id_clarity,
      id_carat: item.id_carat,
      price_per_carat: item.price_per_carat
    })
    setShowEditDialog(true)
  }

  const getQualityLabel = (options: { id: number; name: string }[], id: number) => {
    const option = options.find(o => o.id === id)
    
return option ? option.name : `Unknown (${id})`
  }

  return (
    <AuthGuard>
      <Head>
        <title>Diamond Rates | Nungu Diamonds Admin</title>
      </Head>

      <Box sx={{ py: 3 }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Typography variant='h4' sx={{ mb: 4, color: '#c6a55a', fontFamily: 'Canela Text Trial, serif' }}>
              Diamond Quality Matrix
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="ion:diamond-outline" color="#c6a55a" />
                    Diamond Pricing Configuration
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                {!diamondRatesApiAvailable && (
                  <Alert severity='warning' sx={{ mb: 3 }}>
                    Diamond pricing matrix routes are not available in the current API. This page is read-only until backend support exists.
                  </Alert>
                )}
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                  <Tab label="Quality Matrix" icon={<Iconify icon="tabler:table" />} iconPosition="start" />
                  <Tab label="Shape Multipliers" icon={<Iconify icon="tabler:shapes" />} iconPosition="start" />
                </Tabs>

                {activeTab === 0 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                      <Button
                        variant='contained'
                        startIcon={<Iconify icon="tabler:plus" />}
                        onClick={() => {
                          resetForm()
                          setShowAddDialog(true)
                        }}
                        disabled={!diamondRatesApiAvailable}
                        sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
                      >
                        Add Matrix Entry
                      </Button>
                    </Box>

                    {loading ? (
                      <Alert severity='info'>Loading matrix data...</Alert>
                    ) : matrixData.length === 0 ? (
                      <Alert severity='info'>
                        No diamond quality matrix entries found.
                        {!diamondRatesApiAvailable && ' Backend matrix routes need to be implemented before entries can be managed here.'}
                      </Alert>
                    ) : (
                      <TableContainer component={Paper} variant='outlined'>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell><strong>Cut</strong></TableCell>
                              <TableCell><strong>Color</strong></TableCell>
                              <TableCell><strong>Clarity</strong></TableCell>
                              <TableCell><strong>Carat</strong></TableCell>
                              <TableCell align="right"><strong>Price/Carat (USD)</strong></TableCell>
                              <TableCell align="center"><strong>Status</strong></TableCell>
                              <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {matrixData.map((row) => (
                              <TableRow key={row.id} hover>
                                <TableCell>{getQualityLabel(cutOptions, row.id_cut)}</TableCell>
                                <TableCell>{getQualityLabel(colorOptions, row.id_color)}</TableCell>
                                <TableCell>{getQualityLabel(clarityOptions, row.id_clarity)}</TableCell>
                                <TableCell>{row.carat_value || row.id_carat}</TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={600}>
                                    ${toSafeNumber(row.price_per_carat).toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    size="small"
                                    label={row.is_active === 1 ? 'Active' : 'Inactive'}
                                    color={row.is_active === 1 ? 'success' : 'default'}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                    <Tooltip title="Edit">
                                      <IconButton size="small" onClick={() => openEditDialog(row)}>
                                        <Iconify icon="tabler:edit" fontSize={18} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                          setDeletingItem(row)
                                          setShowDeleteDialog(true)
                                        }}
                                      >
                                        <Iconify icon="tabler:trash" fontSize={18} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                )}

                {activeTab === 1 && (
                  <>
                    <Alert severity='info' sx={{ mb: 3 }}>
                      Shape multipliers adjust the base price per carat based on the diamond shape. A multiplier of 1.0 means no adjustment.
                    </Alert>

                    <Grid container spacing={3}>
                      {shapeOptions.map((shape) => {
                        const multiplier = shapeMultipliers.find(s => s.shape_name === shape.name)
                        const currentMultiplier = multiplier?.multiplier || 1.0

                        return (
                          <Grid item xs={12} md={6} lg={4} key={shape.id}>
                            <Card variant='outlined'>
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Iconify icon="ion:diamond-outline" color="#c6a55a" />
                                    <Typography variant='subtitle1' fontWeight={600}>
                                      {shape.name}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={`${((currentMultiplier - 1) * 100).toFixed(0)}%`}
                                    color={currentMultiplier > 1 ? 'success' : currentMultiplier < 1 ? 'warning' : 'default'}
                                    size="small"
                                  />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    label="Multiplier"
                                    value={currentMultiplier}
                                    disabled={!diamondRatesApiAvailable}
                                    inputProps={{ step: '0.01', min: '0.1', max: '2.0' }}
                                    onChange={(e) => {
                                      const newValue = parseFloat(e.target.value)
                                      if (newValue > 0 && newValue <= 2) {
                                        handleUpdateShapeMultiplier(shape.id, newValue)
                                      }
                                    }}
                                  />
                                  <Typography variant='body2' color='text.secondary' sx={{ minWidth: 60 }}>
                                    {currentMultiplier.toFixed(2)}x
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        )
                      })}
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="tabler:info-circle" color="#c6a55a" />
                    Pricing Guidelines
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Alert severity='info' icon={<Iconify icon="tabler:currency-dollar" />}>
                      <Typography variant='subtitle2'>Price per Carat</Typography>
                      <Typography variant='body2'>
                        Higher quality diamonds (better cut, color, clarity) command higher prices per carat.
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Alert severity='warning' icon={<Iconify icon="tabler:alert-triangle" />}>
                      <Typography variant='subtitle2'>Shape Multipliers</Typography>
                      <Typography variant='body2'>
                        Rare shapes may have multipliers above 1.0 due to higher cutting waste and demand.
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Alert severity='success' icon={<Iconify icon="tabler:check-circle" />}>
                      <Typography variant='subtitle2'>Live Calculations</Typography>
                      <Typography variant='body2'>
                        Pricing matrix changes are not wired to the current API. Verify backend support before relying on live calculations.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Add Quality Matrix Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Cut</InputLabel>
                <Select
                  value={formData.id_cut}
                  label="Cut"
                  onChange={(e) => setFormData({ ...formData, id_cut: e.target.value as number })}
                >
                  {cutOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={formData.id_color}
                  label="Color"
                  onChange={(e) => setFormData({ ...formData, id_color: e.target.value as number })}
                >
                  {colorOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Clarity</InputLabel>
                <Select
                  value={formData.id_clarity}
                  label="Clarity"
                  onChange={(e) => setFormData({ ...formData, id_clarity: e.target.value as number })}
                >
                  {clarityOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Carat Size</InputLabel>
                <Select
                  value={formData.id_carat}
                  label="Carat Size"
                  onChange={(e) => setFormData({ ...formData, id_carat: e.target.value as number })}
                >
                  {caratOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Price per Carat (USD)"
                value={formData.price_per_carat}
                onChange={(e) => setFormData({ ...formData, price_per_carat: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddMatrixEntry}
            disabled={saving || formData.price_per_carat <= 0}
            sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
          >
            {saving ? 'Adding...' : 'Add Entry'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Edit Quality Matrix Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Cut</InputLabel>
                <Select
                  value={formData.id_cut}
                  label="Cut"
                  onChange={(e) => setFormData({ ...formData, id_cut: e.target.value as number })}
                >
                  {cutOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={formData.id_color}
                  label="Color"
                  onChange={(e) => setFormData({ ...formData, id_color: e.target.value as number })}
                >
                  {colorOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Clarity</InputLabel>
                <Select
                  value={formData.id_clarity}
                  label="Clarity"
                  onChange={(e) => setFormData({ ...formData, id_clarity: e.target.value as number })}
                >
                  {clarityOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Carat Size</InputLabel>
                <Select
                  value={formData.id_carat}
                  label="Carat Size"
                  onChange={(e) => setFormData({ ...formData, id_carat: e.target.value as number })}
                >
                  {caratOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Price per Carat (USD)"
                value={formData.price_per_carat}
                onChange={(e) => setFormData({ ...formData, price_per_carat: parseFloat(e.target.value) || 0 })}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditMatrixEntry}
            disabled={saving || formData.price_per_carat <= 0}
            sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Alert severity='error' sx={{ mb: 2 }}>
            Are you sure you want to delete this matrix entry? This action cannot be undone.
          </Alert>
          {deletingItem && (
            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant='body2'>
                <strong>Cut:</strong> {getQualityLabel(cutOptions, deletingItem.id_cut)} <br />
                <strong>Color:</strong> {getQualityLabel(colorOptions, deletingItem.id_color)} <br />
                <strong>Clarity:</strong> {getQualityLabel(clarityOptions, deletingItem.id_clarity)} <br />
                <strong>Price/Carat:</strong> ${toSafeNumber(deletingItem.price_per_carat).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleDeleteMatrixEntry}
            disabled={saving}
          >
            {saving ? 'Deleting...' : 'Delete Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </AuthGuard>
  )
}

export default DiamondRatesPage
