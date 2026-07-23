// ** Enhanced Variant Management Component
// ** Supports multiple variant dimensions: Size, Metal, Karat
// ** Bulk generation and individual variant management

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Divider,
  Icon
} from '@mui/material'
import { Icon as Iconify } from '@iconify/react'
import { toast } from 'react-hot-toast'
import {
  GET_BY_ID_PRODUCTS,
  ADD_PRODUCT_DETAILS,
  METAL_MASTER_DROPDOWN,
  CARAT_MASTER_DROPDOWN,
  METAL_TONE_DROPDOWN,
  ADD_PRODUCT_DROPDOWN_LIST,
  DELETE_PRODUCT_API,
  STATUS_UPDATE_PRODUCT
} from 'src/services/AdminServices'

interface VariantOption {
  id: number
  name: string
  type: 'size' | 'metal' | 'karat' | 'tone'
}

interface ProductVariant {
  id: number
  name: string
  sku: string
  size?: string
  metal?: string
  karat?: string
  tone?: string
  making_charge: number
  finding_charge: number
  other_charge: number
  is_active: string
  is_featured: string
  is_trending: string
  price?: number
}

interface EnhancedVariantManagementProps {
  productId: number
  onVariantsChange?: () => void
  parentProductName?: string
  parentProductSku?: string
}

const EnhancedVariantManagement: React.FC<EnhancedVariantManagementProps> = ({
  productId,
  onVariantsChange,
  parentProductName = '',
  parentProductSku = ''
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [parentProduct, setParentProduct] = useState<any>(null)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)

  const [availableOptions, setAvailableOptions] = useState<{
    sizes: { id: number; size: string }[]
    metals: { id: number; name: string; karat: string }[]
    karats: { id: number; name: string }[]
    tones: { id: number; name: string }[]
  }>({
    sizes: [],
    metals: [],
    karats: [],
    tones: []
  })

  const [selectedOptions, setSelectedOptions] = useState<{
    sizes: number[]
    metals: number[]
    karats: number[]
  }>({
    sizes: [],
    metals: [],
    karats: []
  })

  const [basePrice, setBasePrice] = useState({
    making_charge: 0,
    finding_charge: 0,
    other_charge: 0
  })

  const [newVariantData, setNewVariantData] = useState({
    size: '',
    metal: '',
    karat: '',
    tone: '',
    making_charge: 0,
    finding_charge: 0,
    other_charge: 0
  })

  const loadDropdownData = useCallback(async () => {
    try {
      const [productData, metalData, karatData, toneData] = await Promise.all([
        ADD_PRODUCT_DROPDOWN_LIST(),
        METAL_MASTER_DROPDOWN(),
        CARAT_MASTER_DROPDOWN(),
        METAL_TONE_DROPDOWN()
      ])

      if (productData.code === 200 || productData.code === '200') {
        setAvailableOptions(prev => ({
          ...prev,
          sizes: productData.data.item_size || [],
          karats: karatData.data || [],
          tones: toneData.data || []
        }))
      }

      if (metalData.code === 200 || metalData.code === '200') {
        setAvailableOptions(prev => ({
          ...prev,
          metals: metalData.data || []
        }))
      }
    } catch (error) {
      console.error('Failed to load dropdown data:', error)
    }
  }, [])

  const fetchProductAndVariants = useCallback(async () => {
    setLoading(true)
    try {
      const response = await GET_BY_ID_PRODUCTS(productId)
      if (response.code === 200) {
        const product = response.data.findProduct
        setParentProduct(product)
        setVariants(product.variants || [])

        if (product.making_charge) setBasePrice(prev => ({ ...prev, making_charge: product.making_charge }))
        if (product.finding_charge) setBasePrice(prev => ({ ...prev, finding_charge: product.finding_charge }))
        if (product.other_charge) setBasePrice(prev => ({ ...prev, other_charge: product.other_charge }))
      }
    } catch (error) {
      toast.error('Failed to fetch product variants')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    loadDropdownData()
    if (productId) {
      fetchProductAndVariants()
    }
  }, [fetchProductAndVariants, loadDropdownData, productId])

  const generateVariantSKU = (size: string, metal: string, karat: string) => {
    const sizeCode = size ? size.replace(/\s+/g, '').toUpperCase() : ''
    const metalCode = metal ? metal.substring(0, 2).toUpperCase() : ''
    const karatCode = karat ? karat.replace(/\D/g, '') : ''

    return `${parentProductSku || 'SKU'}-${sizeCode}${metalCode}${karatCode}`.toUpperCase()
  }

  const generateVariants = async () => {
    if (selectedOptions.sizes.length === 0 && selectedOptions.metals.length === 0 && selectedOptions.karats.length === 0) {
      toast.error('Please select at least one option to generate variants')

      return
    }

    setLoading(true)
    try {
      const newVariants: ProductVariant[] = []

      for (const sizeId of selectedOptions.sizes) {
        const sizeObj = availableOptions.sizes.find(s => s.id === sizeId)
        for (const metalId of selectedOptions.metals) {
          const metalObj = availableOptions.metals.find(m => m.id === metalId)
          for (const karatId of selectedOptions.karats) {
            const karatObj = availableOptions.karats.find(k => k.id === karatId)

            const variantSku = generateVariantSKU(
              sizeObj?.size || '',
              metalObj?.name || '',
              karatObj?.name || ''
            )

            const variantData = {
              name: `${parentProductName} - ${sizeObj?.size || ''} ${metalObj?.name || ''} ${karatObj?.name || ''}`.trim(),
              sku: variantSku,
              size: sizeObj?.size || '',
              metal: metalObj?.name || '',
              karat: karatObj?.name || '',
              making_charge: basePrice.making_charge,
              finding_charge: basePrice.finding_charge,
              other_charge: basePrice.other_charge,
              is_parent: '0',
              parent_product_id: parentProduct?.id,
              is_active: '1',
              is_featured: '0',
              is_trending: '0'
            }

            const response = await ADD_PRODUCT_DETAILS(variantData)
            if (response.code === 200) {
              newVariants.push({
                id: response.data?.id || Date.now(),
                ...variantData
              })
            }
          }
        }
      }

      if (newVariants.length > 0) {
        toast.success(`Generated ${newVariants.length} variants successfully`)
        setVariants(prev => [...prev, ...newVariants])
        setShowGenerateDialog(false)
        onVariantsChange?.()
      } else {
        toast.error('Failed to generate variants')
      }
    } catch (error) {
      toast.error('Failed to generate variants')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSingleVariant = async () => {
    if (!newVariantData.size && !newVariantData.metal && !newVariantData.karat) {
      toast.error('Please enter at least one variant attribute')

      return
    }

    setLoading(true)
    try {
      const variantSku = generateVariantSKU(newVariantData.size, newVariantData.metal, newVariantData.karat)

      const variantData = {
        name: `${parentProductName} - ${newVariantData.size} ${newVariantData.metal} ${newVariantData.karat}`.trim(),
        sku: variantSku,
        size: newVariantData.size,
        metal: newVariantData.metal,
        karat: newVariantData.karat,
        tone: newVariantData.tone,
        making_charge: newVariantData.making_charge || basePrice.making_charge,
        finding_charge: newVariantData.finding_charge || basePrice.finding_charge,
        other_charge: newVariantData.other_charge || basePrice.other_charge,
        is_parent: '0',
        parent_product_id: parentProduct?.id,
        is_active: '1',
        is_featured: '0',
        is_trending: '0'
      }

      const response = await ADD_PRODUCT_DETAILS(variantData)
      if (response.code === 200) {
        toast.success('Variant added successfully')
        const newVariant: ProductVariant = {
          id: response.data?.id || Date.now(),
          ...variantData
        }
        setVariants(prev => [...prev, newVariant])
        setNewVariantData({
          size: '',
          metal: '',
          karat: '',
          tone: '',
          making_charge: 0,
          finding_charge: 0,
          other_charge: 0
        })
        onVariantsChange?.()
      } else {
        toast.error(response.message || 'Failed to add variant')
      }
    } catch (error) {
      toast.error('Failed to add variant')
    } finally {
      setLoading(false)
    }
  }

  const handleEditVariant = async () => {
    if (!editingVariant) return

    setLoading(true)
    try {
      const response = await ADD_PRODUCT_DETAILS({
        ...editingVariant,
        id: editingVariant.id
      })

      if (response.code === 200) {
        toast.success('Variant updated successfully')
        setVariants(prev => prev.map(v => v.id === editingVariant.id ? editingVariant : v))
        setShowEditDialog(false)
        setEditingVariant(null)
        onVariantsChange?.()
      } else {
        toast.error(response.message || 'Failed to update variant')
      }
    } catch (error) {
      toast.error('Failed to update variant')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm('Are you sure you want to delete this variant?')) return

    setLoading(true)
    try {
      const response = await DELETE_PRODUCT_API({ id: variantId })
      if (response.code === 200) {
        toast.success('Variant deleted successfully')
        setVariants(prev => prev.filter(v => v.id !== variantId))
        onVariantsChange?.()
      } else {
        toast.error(response.message || 'Failed to delete variant')
      }
    } catch (error) {
      toast.error('Failed to delete variant')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVariantStatus = async (variant: ProductVariant) => {
    setLoading(true)
    try {
      const response = await STATUS_UPDATE_PRODUCT({
        id_product: variant.id,
        is_active: variant.is_active === '1' ? '0' : '1'
      })

      if (response.code === 200) {
        toast.success('Variant status updated')
        setVariants(prev => prev.map(v =>
          v.id === variant.id ? { ...v, is_active: variant.is_active === '1' ? '0' : '1' } : v
        ))
        onVariantsChange?.()
      } else {
        toast.error(response.message || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  if (!parentProduct) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Loading product information...</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#c6a55a', fontFamily: 'Canela Text Trial, serif' }}>
          Variant Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="tabler:plus" />}
            onClick={() => setShowGenerateDialog(true)}
          >
            Bulk Generate
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="tabler:plus" />}
            onClick={() => setActiveTab(1)}
            sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
          >
            Add Single Variant
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
            <Tab label="All Variants" icon={<Iconify icon="tabler:list" />} iconPosition="start" />
            <Tab label="Add Single Variant" icon={<Iconify icon="tabler:plus" />} iconPosition="start" />
          </Tabs>

          {activeTab === 0 && (
            <>
              {variants.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No variants found. Click "Bulk Generate" to create multiple variants at once, or "Add Single Variant" to create one manually.
                </Alert>
              ) : (
                <>
                  <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`${variants.length} Variants`} color="primary" />
                    <Chip
                      label={`${variants.filter(v => v.is_active === '1').length} Active`}
                      color="success"
                      variant="outlined"
                    />
                    <Chip
                      label={`${variants.filter(v => v.is_active === '0').length} Inactive`}
                      color="error"
                      variant="outlined"
                    />
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell><strong>Variant</strong></TableCell>
                          <TableCell><strong>SKU</strong></TableCell>
                          <TableCell><strong>Attributes</strong></TableCell>
                          <TableCell align="right"><strong>Price</strong></TableCell>
                          <TableCell align="center"><strong>Status</strong></TableCell>
                          <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {variants.map((variant) => (
                          <TableRow key={variant.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {variant.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {variant.sku}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {variant.size && <Chip label={variant.size} size="small" />}
                                {variant.metal && <Chip label={variant.metal} size="small" color="secondary" />}
                                {variant.karat && <Chip label={variant.karat} size="small" color="info" />}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={500}>
                                R {((variant.other_charge || 0) + (variant.making_charge || 0) + (variant.finding_charge || 0)).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Switch
                                size="small"
                                checked={variant.is_active === '1'}
                                onChange={() => handleToggleVariantStatus(variant)}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingVariant(variant)
                                      setShowEditDialog(true)
                                    }}
                                  >
                                    <Iconify icon="tabler:edit" fontSize={18} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteVariant(variant.id)}
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
                </>
              )}
            </>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Creating variant for: <strong>{parentProductName}</strong>
                </Alert>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Size</InputLabel>
                  <Select
                    value={newVariantData.size}
                    label="Size"
                    onChange={(e) => setNewVariantData({ ...newVariantData, size: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {availableOptions.sizes.map((size) => (
                      <MenuItem key={size.id} value={size.size}>
                        {size.size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Metal</InputLabel>
                  <Select
                    value={newVariantData.metal}
                    label="Metal"
                    onChange={(e) => setNewVariantData({ ...newVariantData, metal: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {availableOptions.metals.map((metal) => (
                      <MenuItem key={metal.id} value={metal.name}>
                        {metal.name} ({metal.karat})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Karat</InputLabel>
                  <Select
                    value={newVariantData.karat}
                    label="Karat"
                    onChange={(e) => setNewVariantData({ ...newVariantData, karat: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {availableOptions.karats.map((karat) => (
                      <MenuItem key={karat.id} value={karat.name}>
                        {karat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Tone</InputLabel>
                  <Select
                    value={newVariantData.tone}
                    label="Tone"
                    onChange={(e) => setNewVariantData({ ...newVariantData, tone: e.target.value })}
                  >
                    <MenuItem value="">None</MenuItem>
                    {availableOptions.tones.map((tone) => (
                      <MenuItem key={tone.id} value={tone.name}>
                        {tone.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Price Adjustments
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Making Charge"
                  value={newVariantData.making_charge}
                  onChange={(e) => setNewVariantData({ ...newVariantData, making_charge: parseFloat(e.target.value) || 0 })}
                  InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>R</Typography> }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Finding Charge"
                  value={newVariantData.finding_charge}
                  onChange={(e) => setNewVariantData({ ...newVariantData, finding_charge: parseFloat(e.target.value) || 0 })}
                  InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>R</Typography> }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Other Charge"
                  value={newVariantData.other_charge}
                  onChange={(e) => setNewVariantData({ ...newVariantData, other_charge: parseFloat(e.target.value) || 0 })}
                  InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>R</Typography> }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleAddSingleVariant}
                    disabled={loading}
                    sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
                  >
                    {loading ? 'Adding...' : 'Add Variant'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Bulk Generate Dialog */}
      <Dialog open={showGenerateDialog} onClose={() => setShowGenerateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="tabler:package" color="#c6a55a" />
            Bulk Generate Variants
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Select the options below to generate all possible variant combinations.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Base Price
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Making Charge"
                    value={basePrice.making_charge}
                    onChange={(e) => setBasePrice({ ...basePrice, making_charge: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Finding Charge"
                    value={basePrice.finding_charge}
                    onChange={(e) => setBasePrice({ ...basePrice, finding_charge: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Other Charge"
                    value={basePrice.other_charge}
                    onChange={(e) => setBasePrice({ ...basePrice, other_charge: parseFloat(e.target.value) || 0 })}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Sizes
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                {availableOptions.sizes.map((size) => (
                  <FormControlLabel
                    key={size.id}
                    control={
                      <Checkbox
                        checked={selectedOptions.sizes.includes(size.id)}
                        onChange={(e) => {
                          setSelectedOptions(prev => ({
                            ...prev,
                            sizes: e.target.checked
                              ? [...prev.sizes, size.id]
                              : prev.sizes.filter(id => id !== size.id)
                          }))
                        }}
                      />
                    }
                    label={size.size}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Metals
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                {availableOptions.metals.map((metal) => (
                  <FormControlLabel
                    key={metal.id}
                    control={
                      <Checkbox
                        checked={selectedOptions.metals.includes(metal.id)}
                        onChange={(e) => {
                          setSelectedOptions(prev => ({
                            ...prev,
                            metals: e.target.checked
                              ? [...prev.metals, metal.id]
                              : prev.metals.filter(id => id !== metal.id)
                          }))
                        }}
                      />
                    }
                    label={`${metal.name} (${metal.karat})`}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Karats
              </Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                {availableOptions.karats.map((karat) => (
                  <FormControlLabel
                    key={karat.id}
                    control={
                      <Checkbox
                        checked={selectedOptions.karats.includes(karat.id)}
                        onChange={(e) => {
                          setSelectedOptions(prev => ({
                            ...prev,
                            karats: e.target.checked
                              ? [...prev.karats, karat.id]
                              : prev.karats.filter(id => id !== karat.id)
                          }))
                        }}
                      />
                    }
                    label={karat.name}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Alert severity="warning">
                This will generate <strong>{selectedOptions.sizes.length * selectedOptions.metals.length * selectedOptions.karats.length || 0}</strong> variants.
                {selectedOptions.sizes.length === 0 && selectedOptions.metals.length === 0 && selectedOptions.karats.length === 0 && (
                  <> Please select at least one option.</>
                )}
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowGenerateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={generateVariants}
            disabled={loading || (selectedOptions.sizes.length === 0 && selectedOptions.metals.length === 0 && selectedOptions.karats.length === 0)}
            sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
          >
            {loading ? 'Generating...' : 'Generate Variants'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Variant Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Variant</DialogTitle>
        <DialogContent>
          {editingVariant && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Variant Name"
                  value={editingVariant.name}
                  onChange={(e) => setEditingVariant({ ...editingVariant, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SKU"
                  value={editingVariant.sku}
                  onChange={(e) => setEditingVariant({ ...editingVariant, sku: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Making Charge"
                  value={editingVariant.making_charge}
                  onChange={(e) => setEditingVariant({ ...editingVariant, making_charge: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Finding Charge"
                  value={editingVariant.finding_charge}
                  onChange={(e) => setEditingVariant({ ...editingVariant, finding_charge: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Other Charge"
                  value={editingVariant.other_charge}
                  onChange={(e) => setEditingVariant({ ...editingVariant, other_charge: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditVariant}
            disabled={loading}
            sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EnhancedVariantManagement
