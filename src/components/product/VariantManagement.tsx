import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { Icon } from '@iconify/react'
import { toast } from 'react-hot-toast'
import {
  ADD_PRODUCT_BASIC_DETAILS,
  ADD_PRODUCT_METAL_DIAMOND_DETAILS,
  ADD_PRODUCT_DROPDOWN_LIST,
  CARAT_MASTER_DROPDOWN,
  GET_BY_ID_PRODUCTS,
  METAL_MASTER_DROPDOWN,
  METAL_TONE_DROPDOWN,
  STATUS_UPDATE_PRODUCT
} from 'src/services/AdminServices'

interface ProductCategory {
  id?: number
  id_category: number
  id_sub_category?: number | null
  id_sub_sub_category?: number | null
}

interface ProductVariant {
  id: number
  name: string
  sku: string
  size?: string
  making_charge?: number
  finding_charge?: number
  other_charge?: number
  is_active: string
  is_featured: string
  is_trending: string
  is_parent?: string
  parent_product_id?: number | null
}

interface ProductDetail extends ProductVariant {
  sort_description?: string
  long_description?: string
  tag?: string | number[] | null
  product_categories?: ProductCategory[]
  PMO?: Array<{
    id: number
    id_metal?: number
    id_karat?: number | null
    metal_weight?: number | string | null
    metal_tone?: string | number | null
  }>
  variants?: ProductVariant[]
}

interface DropdownOption {
  id: number
  name?: string
  size?: string
}

interface VariantFormState {
  id_product: number
  name: string
  sku: string
  size: string
  id_size: number
  product_categories: ProductCategory[]
  making_charge: number
  finding_charge: number
  other_charge: number
  id_metal: number
  id_karat: number
  id_metal_tone: number
  metal_weight: number
  product_metal_option_id: number
}

interface VariantManagementProps {
  productId: number
  onVariantsChange?: () => void
}

const emptyForm: VariantFormState = {
  id_product: 0,
  name: '',
  sku: '',
  size: '',
  id_size: 0,
  product_categories: [],
  making_charge: 0,
  finding_charge: 0,
  other_charge: 0,
  id_metal: 0,
  id_karat: 0,
  id_metal_tone: 0,
  metal_weight: 0,
  product_metal_option_id: 0
}

const isSuccess = (response: any) => response?.code === 200 || response?.code === '200'

const toNumber = (value: unknown) => {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

const splitIds = (value: unknown) => {
  if (Array.isArray(value)) return value.map(Number).filter(Boolean)
  if (typeof value === 'number') return [value]
  if (typeof value === 'string') {
    if (!value || value === '{}') return []

    return value.split('|').map(Number).filter(Boolean)
  }

  return []
}

const getProductIdFromResponse = (response: any) => {
  const data = response?.data

  return toNumber(typeof data === 'number' || typeof data === 'string' ? data : data?.id || data?.findProduct?.id)
}

const getSizeOptionLabel = (size: DropdownOption) => String(size.size || size.name || size.id)

const normalizeProductCategories = (categories: ProductCategory[], preserveRowIds: boolean) => {
  return categories
    .filter(category => category.id_category)
    .map(category => ({
      id: preserveRowIds ? category.id || 0 : 0,
      id_category: category.id_category,
      id_sub_category: category.id_sub_category || null,
      id_sub_sub_category: category.id_sub_sub_category || null
    }))
}

const VariantManagement: React.FC<VariantManagementProps> = ({ productId, onVariantsChange }) => {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [parentProduct, setParentProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<VariantFormState>(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [sizes, setSizes] = useState<DropdownOption[]>([])
  const [metals, setMetals] = useState<DropdownOption[]>([])
  const [karats, setKarats] = useState<DropdownOption[]>([])
  const [tones, setTones] = useState<DropdownOption[]>([])

  const parentCategories = useMemo(() => {
    return normalizeProductCategories(parentProduct?.product_categories || [], false)
  }, [parentProduct])

  const loadDropdowns = useCallback(async () => {
    try {
      const [productDropdowns, metalDropdowns, karatDropdowns, toneDropdowns] = await Promise.all([
        ADD_PRODUCT_DROPDOWN_LIST(),
        METAL_MASTER_DROPDOWN(),
        CARAT_MASTER_DROPDOWN(),
        METAL_TONE_DROPDOWN()
      ])

      if (isSuccess(productDropdowns)) setSizes(productDropdowns.data?.item_size || [])
      if (isSuccess(metalDropdowns)) setMetals(metalDropdowns.data || [])
      if (isSuccess(karatDropdowns)) setKarats(karatDropdowns.data || [])
      if (isSuccess(toneDropdowns)) setTones(toneDropdowns.data || [])
    } catch (error) {
      toast.error('Variant dropdown data could not be loaded')
    }
  }, [])

  const loadProductAndVariants = useCallback(async () => {
    if (!productId) return

    setLoading(true)
    setParentProduct(null)
    setVariants([])
    try {
      const response = await GET_BY_ID_PRODUCTS(productId)
      if (!isSuccess(response)) {
        toast.error(response?.message || 'Product variants could not be loaded')

        return
      }

      const product = response.data?.findProduct as ProductDetail
      if (!product?.id) {
        toast.error('Product variants could not be loaded')

        return
      }

      if (product?.is_parent === '0' && product.parent_product_id) {
        const parentResponse = await GET_BY_ID_PRODUCTS(product.parent_product_id)
        const parent = isSuccess(parentResponse) ? (parentResponse.data?.findProduct as ProductDetail) : null

        if (parent?.id) {
          setParentProduct(parent)
          setVariants(parent?.variants || [])
        } else {
          toast.error(parentResponse?.message || 'Parent product could not be loaded')
        }
      } else {
        setParentProduct(product)
        setVariants(product?.variants || [])
      }
    } catch (error) {
      toast.error('Product variants could not be loaded')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    loadDropdowns()
    loadProductAndVariants()
  }, [loadDropdowns, loadProductAndVariants])

  const buildVariantName = (size: string) => {
    const parentName = parentProduct?.name || 'Product'

    return size ? `${parentName} - ${size}` : `${parentName} - Variant`
  }

  const findSizeOption = useCallback(
    (value: unknown) => {
      const numericValue = toNumber(value)
      if (numericValue) {
        const byId = sizes.find(size => size.id === numericValue)
        if (byId) return byId
      }

      if (typeof value === 'string' && value.trim()) {
        const normalized = value.trim()

        return sizes.find(size => getSizeOptionLabel(size) === normalized)
      }

      return undefined
    },
    [sizes]
  )

  const openAddDialog = () => {
    const nextSku = parentProduct?.sku ? `${parentProduct.sku}-VAR${variants.length + 1}` : ''
    setForm({
      ...emptyForm,
      name: buildVariantName(''),
      sku: nextSku,
      making_charge: toNumber(parentProduct?.making_charge),
      finding_charge: toNumber(parentProduct?.finding_charge),
      other_charge: toNumber(parentProduct?.other_charge)
    })
    setFormErrors({})
    setDialogOpen(true)
  }

  const openEditDialog = async (variant: ProductVariant) => {
    setLoading(true)
    try {
      const response = await GET_BY_ID_PRODUCTS(variant.id)
      const detail = isSuccess(response) ? (response.data?.findProduct as ProductDetail) : (variant as ProductDetail)
      const firstMetal = detail.PMO?.[0]
      const metalToneId = splitIds(firstMetal?.metal_tone)[0] || 0
      const sizeId = splitIds(detail.size)[0] || splitIds(variant.size)[0] || 0
      const sizeOption = findSizeOption(sizeId || detail.size || variant.size || '')
      const sizeLabel = sizeOption ? getSizeOptionLabel(sizeOption) : String(detail.size || variant.size || '')

      setForm({
        id_product: variant.id,
        name: detail.name || variant.name,
        sku: detail.sku || variant.sku,
        size: sizeLabel,
        id_size: sizeOption?.id || sizeId,
        product_categories: normalizeProductCategories(detail.product_categories || [], true),
        making_charge: toNumber(detail.making_charge),
        finding_charge: toNumber(detail.finding_charge),
        other_charge: toNumber(detail.other_charge),
        id_metal: toNumber(firstMetal?.id_metal),
        id_karat: toNumber(firstMetal?.id_karat),
        id_metal_tone: metalToneId,
        metal_weight: toNumber(firstMetal?.metal_weight),
        product_metal_option_id: toNumber(firstMetal?.id)
      })
      setFormErrors({})
      setDialogOpen(true)
    } catch (error) {
      toast.error('Variant detail could not be loaded')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    const hasPartialMetal = Boolean(form.id_metal || form.id_karat || form.id_metal_tone || form.metal_weight)
    const hasProductCategories = form.product_categories.length > 0 || parentCategories.length > 0

    if (!form.name.trim()) errors.name = 'Variant name is required'
    if (!form.sku.trim()) errors.sku = 'Variant SKU is required'
    if (!form.id_size) errors.size = 'Choose size or option'
    if (!parentProduct?.id) errors.parent = 'Parent product is not loaded'
    if (!hasProductCategories) errors.parent = 'Parent product needs a category before variants can be saved'
    if (hasPartialMetal) {
      if (!form.id_metal) errors.id_metal = 'Choose metal'
      if (!form.id_karat) errors.id_karat = 'Choose karat'
      if (!form.id_metal_tone) errors.id_metal_tone = 'Choose tone'
      if (form.metal_weight <= 0) errors.metal_weight = 'Enter weight'
    }

    setFormErrors(errors)

    return Object.keys(errors).length === 0
  }

  const saveVariant = async () => {
    if (!validateForm() || !parentProduct) return

    setSaving(true)
    try {
      const isNewVariant = !form.id_product
      const productCategories =
        isNewVariant || form.product_categories.length === 0 ? parentCategories : form.product_categories
      const variantResponse = await ADD_PRODUCT_BASIC_DETAILS({
        id_product: form.id_product,
        name: form.name.trim(),
        sku: form.sku.trim(),
        sort_description: parentProduct.sort_description || '',
        long_description: parentProduct.long_description || '',
        tag: splitIds(parentProduct.tag),
        product_categories: productCategories,
        making_charge: form.making_charge,
        finding_charge: form.finding_charge,
        other_charge: form.other_charge,
        is_parent: '0',
        parent_product_id: parentProduct.id,
        size: form.size.trim()
      })

      if (!isSuccess(variantResponse)) {
        toast.error(variantResponse?.message || 'Variant could not be saved')

        return
      }

      const savedVariantId = form.id_product || getProductIdFromResponse(variantResponse)
      const hasMetal = Boolean(form.id_metal && form.id_karat && form.id_metal_tone && form.metal_weight > 0)

      if (!savedVariantId) {
        toast.error('Variant saved, but the product id was not returned')
        setDialogOpen(false)
        await loadProductAndVariants()
        onVariantsChange?.()

        return
      }

      if (isNewVariant) {
        setForm(prev => ({ ...prev, id_product: savedVariantId }))
        await loadProductAndVariants()
        onVariantsChange?.()
      }

      if (savedVariantId && hasMetal) {
        const metalPayload = {
          id_product: savedVariantId,
          setting_style_type: [],
          size: [form.id_size],
          length: [],
          metal_data: [
            {
              id: form.product_metal_option_id,
              id_metal: form.id_metal,
              id_karat: form.id_karat,
              id_metal_tone: form.id_metal_tone,
              metal_weight: form.metal_weight
            }
          ],
          ...(isNewVariant ? { diamond_data: [] } : {})
        }

        const metalResponse = await ADD_PRODUCT_METAL_DIAMOND_DETAILS(metalPayload)

        if (!isSuccess(metalResponse)) {
          toast.error(metalResponse?.message || 'Variant saved, but metal details could not be saved')

          return
        }
      }

      toast.success(isNewVariant ? 'Variant added' : 'Variant updated')
      setDialogOpen(false)
      if (!isNewVariant) {
        await loadProductAndVariants()
        onVariantsChange?.()
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Variant could not be saved')
    } finally {
      setSaving(false)
    }
  }

  const toggleVariantStatus = async (variant: ProductVariant) => {
    setLoading(true)
    try {
      const response = await STATUS_UPDATE_PRODUCT({
        id_product: variant.id,
        is_active: variant.is_active === '1' ? '0' : '1'
      })

      if (isSuccess(response)) {
        toast.success('Variant status updated')
        await loadProductAndVariants()
        onVariantsChange?.()
      } else {
        toast.error(response?.message || 'Variant status could not be updated')
      }
    } catch (error) {
      toast.error('Variant status could not be updated')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !parentProduct) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='info'>Loading product variants...</Alert>
      </Box>
    )
  }

  if (!parentProduct) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='warning'>Product information could not be loaded.</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant='h6'>Variant Management</Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage size and metal-specific child products for {parentProduct.name}.
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={openAddDialog}>
          Add Variant
        </Button>
      </Box>

      <Alert severity='info' sx={{ mb: 3 }}>
        This first workflow saves variant product records, size labels, pricing, active state and one metal component.
        Diamond component variants remain part of the atomic diamond model follow-up.
      </Alert>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`${variants.length} variants`} color='primary' variant='outlined' />
            <Chip
              label={`${variants.filter(variant => variant.is_active === '1').length} active`}
              color='success'
              variant='outlined'
            />
            <Chip label={`Parent SKU: ${parentProduct.sku || '-'}`} variant='outlined' />
          </Box>

          {variants.length === 0 ? (
            <Alert severity='info'>No variants exist yet. Add a variant to create the first child product.</Alert>
          ) : (
            <TableContainer component={Paper} variant='outlined'>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Variant</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Size / Option</TableCell>
                    <TableCell align='right'>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align='center'>Active</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.map(variant => (
                    <TableRow key={variant.id} hover>
                      <TableCell>
                        <Typography variant='body2' fontWeight={600}>
                          {variant.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                          {variant.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>{variant.size || '-'}</TableCell>
                      <TableCell align='right'>
                        {`R${(
                          toNumber(variant.making_charge) +
                          toNumber(variant.finding_charge) +
                          toNumber(variant.other_charge)
                        ).toLocaleString()}`}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size='small'
                          label={variant.is_active === '1' ? 'Active' : 'Inactive'}
                          color={variant.is_active === '1' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Switch
                          size='small'
                          checked={variant.is_active === '1'}
                          onChange={() => toggleVariantStatus(variant)}
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <Tooltip title='Edit variant'>
                          <IconButton size='small' onClick={() => openEditDialog(variant)}>
                            <Icon icon='tabler:edit' fontSize={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>{form.id_product ? 'Edit Variant' : 'Add Variant'}</DialogTitle>
        <DialogContent>
          {formErrors.parent && (
            <Alert severity='warning' sx={{ mb: 3 }}>
              {formErrors.parent}
            </Alert>
          )}
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Variant name'
                value={form.name}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name}
                onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='SKU'
                value={form.sku}
                error={Boolean(formErrors.sku)}
                helperText={formErrors.sku}
                onChange={event => setForm(prev => ({ ...prev, sku: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.size)}>
                <InputLabel>Size / option</InputLabel>
                <Select
                  value={form.id_size || ''}
                  label='Size / option'
                  onChange={event => {
                    const sizeOption = findSizeOption(event.target.value)
                    const size = sizeOption ? getSizeOptionLabel(sizeOption) : ''
                    setForm(prev => ({
                      ...prev,
                      id_size: sizeOption?.id || 0,
                      size,
                      name: prev.name && prev.name !== buildVariantName(prev.size) ? prev.name : buildVariantName(size)
                    }))
                  }}
                >
                  <MenuItem value=''>
                    <em>Select size</em>
                  </MenuItem>
                  {sizes.map(size => (
                    <MenuItem key={size.id} value={size.id}>
                      {getSizeOptionLabel(size)}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {formErrors.size || 'Use the customer-facing size or option label for this variant.'}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type='number'
                label='Making'
                value={form.making_charge}
                onChange={event =>
                  setForm(prev => ({ ...prev, making_charge: Math.max(0, toNumber(event.target.value)) }))
                }
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type='number'
                label='Finding'
                value={form.finding_charge}
                onChange={event =>
                  setForm(prev => ({ ...prev, finding_charge: Math.max(0, toNumber(event.target.value)) }))
                }
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type='number'
                label='Other'
                value={form.other_charge}
                onChange={event =>
                  setForm(prev => ({ ...prev, other_charge: Math.max(0, toNumber(event.target.value)) }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='subtitle2'>Optional metal component</Typography>
              <Typography variant='body2' color='text.secondary'>
                Complete all four fields to save metal data for this variant.
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth error={Boolean(formErrors.id_metal)}>
                <InputLabel>Metal</InputLabel>
                <Select
                  value={form.id_metal || ''}
                  label='Metal'
                  onChange={event => setForm(prev => ({ ...prev, id_metal: toNumber(event.target.value) }))}
                >
                  <MenuItem value=''>
                    <em>None</em>
                  </MenuItem>
                  {metals.map(metal => (
                    <MenuItem key={metal.id} value={metal.id}>
                      {metal.name || metal.id}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formErrors.id_metal}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth error={Boolean(formErrors.id_karat)}>
                <InputLabel>Karat</InputLabel>
                <Select
                  value={form.id_karat || ''}
                  label='Karat'
                  onChange={event => setForm(prev => ({ ...prev, id_karat: toNumber(event.target.value) }))}
                >
                  <MenuItem value=''>
                    <em>None</em>
                  </MenuItem>
                  {karats.map(karat => (
                    <MenuItem key={karat.id} value={karat.id}>
                      {karat.name || karat.id}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formErrors.id_karat}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth error={Boolean(formErrors.id_metal_tone)}>
                <InputLabel>Tone</InputLabel>
                <Select
                  value={form.id_metal_tone || ''}
                  label='Tone'
                  onChange={event => setForm(prev => ({ ...prev, id_metal_tone: toNumber(event.target.value) }))}
                >
                  <MenuItem value=''>
                    <em>None</em>
                  </MenuItem>
                  {tones.map(tone => (
                    <MenuItem key={tone.id} value={tone.id}>
                      {tone.name || tone.id}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formErrors.id_metal_tone}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type='number'
                label='Weight (g)'
                value={form.metal_weight}
                error={Boolean(formErrors.metal_weight)}
                helperText={formErrors.metal_weight}
                onChange={event =>
                  setForm(prev => ({ ...prev, metal_weight: Math.max(0, toNumber(event.target.value)) }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={saveVariant} disabled={saving}>
            {saving ? 'Saving...' : 'Save Variant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default VariantManagement
