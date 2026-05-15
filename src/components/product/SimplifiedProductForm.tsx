// ** Simplified Product Add Form
// ** Single-page product creation with inline validation, metal/diamond configuration
// ** Decoupled diamond attributes (cut, color, clarity, carat) instead of rigid groups

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  IconButton,
  Paper,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Checkbox,
  Collapse,
  Icon,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ListItemText,
  OutlinedInput
} from '@mui/material'
import { Icon as Iconify } from '@iconify/react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import ErrorBoundary from 'src/components/ErrorBoundary'
import MultiSelectDialog from 'src/components/common/MultiSelectDialog'
import InlineAttributeCreate from 'src/components/common/InlineAttributeCreate'
import {
  ADD_PRODUCT_BASIC_DETAILS,
  ADD_PRODUCT_DROPDOWN_LIST,
  ADD_PRODUCT_IMAGES,
  ADD_PRODUCT_METAL_DIAMOND_DETAILS
} from 'src/services/AdminServices'
import { appErrors } from 'src/AppConstants'

interface ProductFormData {
  name: string
  sku: string
  sort_description: string
  long_description: string
  making_charge: number
  other_charge: number
  category_id: number | null
  sub_category_id: number | null
  sub_sub_category_id: number | null
  tags: number[]
  gender: number[]
  item_sizes: number[]
  item_lengths: number[]
  is_purchasable_online: boolean
  is_price_on_request: boolean
  is_consult_to_purchase: boolean
  is_active: string
}

interface Category {
  id: number
  name: string
  category_name?: string
  parent_id: number | null
}

interface Tag {
  id: number
  name: string
}

interface MetalType {
  id: number
  name: string
  metal_rate: number
}

interface MetalKarat {
  id: number
  name: string
}

interface MetalTone {
  id: number
  id_metal: number
  name: string
}

interface DiamondStone {
  id: number
  name: string
}

interface DiamondShape {
  id: number
  name: string
}

interface DiamondCut {
  id: number
  value: string
}

interface DiamondColor {
  id: number
  name: string
}

interface DiamondClarity {
  id: number
  name: string
}

interface DiamondMMSize {
  id: number
  value: number
}

interface DiamondGroup {
  id: number
  name: string
  id_stone: number
  id_shape: number
  id_mm_size: number
  id_color: number
  id_clarity: number
  id_cuts: number
  rate: number
}

interface SelectedMetal {
  id_metal_type: number
  id_karat: number
  id_tone: number
  weight: number
}

interface SelectedDiamond {
  id_stone: number
  id_shape: number
  id_cuts: number
  id_color: number
  id_clarity: number
  id_mm_size: number
  weight: number
  count: number
  id_diamond_group?: number
  manual_price?: number
}

const GENDER_OPTIONS = [
  { id: 1, name: 'Male' },
  { id: 2, name: 'Female' },
  { id: 3, name: 'Unisex' }
]

const METAL_TYPES = [
  { id: 1, name: 'Gold', metal_rate: 0 },
  { id: 2, name: 'Silver', metal_rate: 0 },
  { id: 3, name: 'Platinum', metal_rate: 0 }
]

const TIP_STORAGE_KEY = 'nungu-admin:simplified-product-dismissed-tips'

const SimplifiedProductForm = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [metalLoading, setMetalLoading] = useState(false)
  const [dropdownData, setDropdownData] = useState<{
    categoryList: Category[]
    keyWords: Tag[]
    item_size: { id: number; size: string }[]
    item_length: { id: number; length: string }[]
    metalTypes: MetalType[]
    metalKarats: MetalKarat[]
    metalTones: MetalTone[]
    diamondStones: DiamondStone[]
    diamondShapes: DiamondShape[]
    diamondCuts: DiamondCut[]
    diamondColors: DiamondColor[]
    diamondClarities: DiamondClarity[]
    diamondMMSizes: DiamondMMSize[]
    diamondGroups: DiamondGroup[]
  } | null>(null)

  const [metalSectionOpen, setMetalSectionOpen] = useState(true)
  const [diamondSectionOpen, setDiamondSectionOpen] = useState(true)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false)
  const [genderDialogOpen, setGenderDialogOpen] = useState(false)
  const [sizesDialogOpen, setSizesDialogOpen] = useState(false)
  const [lengthsDialogOpen, setLengthsDialogOpen] = useState(false)
  const [dismissedTips, setDismissedTips] = useState<string[]>([])

  const [images, setImages] = useState<File[]>([])
  const [imageMetalToneId, setImageMetalToneId] = useState<number | ''>('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [selectedMetals, setSelectedMetals] = useState<SelectedMetal[]>([])
  const [selectedDiamonds, setSelectedDiamonds] = useState<SelectedDiamond[]>([])

  const [newMetal, setNewMetal] = useState<SelectedMetal>({
    id_metal_type: 0,
    id_karat: 0,
    id_tone: 0,
    weight: 0
  })

  const [newDiamond, setNewDiamond] = useState<SelectedDiamond>({
    id_stone: 0,
    id_shape: 0,
    id_cuts: 0,
    id_color: 0,
    id_clarity: 0,
    id_mm_size: 0,
    weight: 0,
    count: 1,
    manual_price: undefined
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      sku: '',
      sort_description: '',
      long_description: '',
      making_charge: 0,
      other_charge: 0,
      category_id: null,
      sub_category_id: null,
      sub_sub_category_id: null,
      tags: [],
      gender: [],
      item_sizes: [],
      item_lengths: [],
      is_purchasable_online: true,
      is_price_on_request: false,
      is_consult_to_purchase: false,
      is_active: '1'
    },
    mode: 'onChange'
  })

  const selectedCategoryId = watch('category_id')
  const selectedSubCategoryId = watch('sub_category_id')

  useEffect(() => {
    loadDropdownData()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const storedTips = window.localStorage.getItem(TIP_STORAGE_KEY)
      setDismissedTips(storedTips ? JSON.parse(storedTips) : [])
    } catch (error) {
      setDismissedTips([])
    }
  }, [])

  const dismissTip = (tipId: string) => {
    setDismissedTips(prev => {
      const next = Array.from(new Set([...prev, tipId]))

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TIP_STORAGE_KEY, JSON.stringify(next))
      }

      return next
    })
  }

  const shouldShowTip = (tipId: string) => !dismissedTips.includes(tipId)

  const loadDropdownData = async () => {
    try {
      setMetalLoading(true)
      const productData = await ADD_PRODUCT_DROPDOWN_LIST()

      if (productData.code === 200 || productData.code === '200') {
        setDropdownData({
          categoryList: productData.data?.categoryList || [],
          keyWords: productData.data?.keyWords || [],
          item_size: productData.data?.item_size || [],
          item_length: productData.data?.item_length || [],
          metalTypes: productData.data?.metal_list || [],
          metalKarats: productData.data?.metal_karat || [],
          metalTones: productData.data?.metal_tone || [],
          diamondStones: productData.data?.stone || [],
          diamondShapes: productData.data?.stone_shape || [],
          diamondCuts: productData.data?.stone_cut || [],
          diamondColors: productData.data?.stone_color || [],
          diamondClarities: productData.data?.stone_clarity || [],
          diamondMMSizes: productData.data?.MM_Size || [],
          diamondGroups: productData.data?.diamond_master || []
        })

        if (productData.data?.metal_list?.length > 0 && productData.data?.metal_list[0]?.metal_rate) {
          METAL_TYPES[0].metal_rate = productData.data.metal_list[0].metal_rate
        }
        if (productData.data?.metal_list?.length > 1) {
          METAL_TYPES[1].metal_rate = productData.data.metal_list[1].metal_rate || 0
        }
        if (productData.data?.metal_list?.length > 2) {
          METAL_TYPES[2].metal_rate = productData.data.metal_list[2].metal_rate || 0
        }
      } else {
        toast.error(productData.message || 'Failed to load dropdown data')
      }
    } catch (error) {
      console.error('Failed to load dropdown data:', error)
      toast.error('Failed to load form data')
    } finally {
      setMetalLoading(false)
    }
  }

  const subCategories = dropdownData?.categoryList.filter(
    (c: Category) => c.parent_id === selectedCategoryId || c.parent_id === Number(selectedCategoryId)
  ) || []

  const subSubCategories = dropdownData?.categoryList.filter(
    (c: Category) => c.parent_id === selectedSubCategoryId || c.parent_id === Number(selectedSubCategoryId)
  ) || []

  const isNecklaceCategory = () => {
    const getCategoryName = (id: number | null) => {
      if (!id) return null
      
return dropdownData?.categoryList.find(c => c.id === id)
    }
    const cat = getCategoryName(selectedCategoryId)
    const subCat = getCategoryName(selectedSubCategoryId)
    const subSubCat = getCategoryName(watch('sub_sub_category_id'))
    const name = (cat?.name || cat?.category_name || '').toLowerCase()
    const subName = (subCat?.name || subCat?.category_name || '').toLowerCase()
    const subSubName = (subSubCat?.name || subSubCat?.category_name || '').toLowerCase()
    
return name.includes('necklace') || subName.includes('necklace') || subSubName.includes('necklace')
  }

  const getMetalRate = (metalTypeId: number) => {
    const metal = METAL_TYPES.find(m => m.id === metalTypeId)
    
return metal?.metal_rate || 0
  }

  const calculateMetalCost = (metal: SelectedMetal) => {
    if (metal.id_metal_type === 0 || metal.id_karat === 0 || metal.weight <= 0) return 0
    const rate = getMetalRate(metal.id_metal_type)
    const karatValue = parseInt(dropdownData?.metalKarats.find(k => k.id === metal.id_karat)?.name || '0') / 24
    
return (metal.weight / 31.104) * karatValue * rate
  }

  const getDiamondGroupForSelection = (diamond: SelectedDiamond) => {
    if (!dropdownData) return null
    
return dropdownData.diamondGroups.find(g =>
      g.id_stone === diamond.id_stone &&
      g.id_shape === diamond.id_shape &&
      g.id_cuts === diamond.id_cuts &&
      g.id_color === diamond.id_color &&
      g.id_clarity === diamond.id_clarity &&
      g.id_mm_size === diamond.id_mm_size
    )
  }

  const calculateDiamondCost = (diamond: SelectedDiamond) => {
    const group = getDiamondGroupForSelection(diamond)
    if (group) {
      return diamond.weight * group.rate
    }
    if (diamond.manual_price && diamond.manual_price > 0) {
      return diamond.weight * diamond.manual_price
    }
    
return 0
  }

  const addMetal = () => {
    if (!newMetal.id_metal_type || !newMetal.id_karat || newMetal.weight <= 0) {
      toast.error('Please select metal type, karat and enter weight')
      
return
    }
    setSelectedMetals(prev => [...prev, { ...newMetal }])
    setNewMetal({ id_metal_type: 0, id_karat: 0, id_tone: 0, weight: 0 })
  }

  const removeMetal = (index: number) => {
    setSelectedMetals(prev => prev.filter((_, i) => i !== index))
  }

  const addDiamond = () => {
    if (!newDiamond.id_stone || !newDiamond.id_shape || !newDiamond.id_cuts || !newDiamond.id_color || !newDiamond.id_clarity || !newDiamond.id_mm_size) {
      toast.error('Please select all diamond attributes')
      
return
    }
    if (newDiamond.weight <= 0) {
      toast.error('Please enter a valid carat weight')
      
return
    }
    setSelectedDiamonds(prev => [...prev, { ...newDiamond }])
    setNewDiamond(prev => ({ ...prev, id_stone: 0, id_shape: 0, id_cuts: 0, id_color: 0, id_clarity: 0, id_mm_size: 0, count: 1, weight: 0, manual_price: undefined }))
  }

  const removeDiamond = (index: number) => {
    setSelectedDiamonds(prev => prev.filter((_, i) => i !== index))
  }

  const totalMetalCost = selectedMetals.reduce((sum, m) => sum + calculateMetalCost(m), 0)
  const totalDiamondCost = selectedDiamonds.reduce((sum, d) => sum + calculateDiamondCost(d), 0)

  const validateForm = (data: ProductFormData): boolean => {
    const errors: Record<string, string> = {}

    if (data.is_active === '1') {
      if (!data.name.trim()) errors.name = 'Product name is required'
      if (!data.sku.trim()) errors.sku = 'SKU is required'
      if (!data.category_id) errors.category_id = 'Category is required'
      if (images.length > 0 && !imageMetalToneId) errors.images = 'Choose a metal tone for the selected images'
    }

    setValidationErrors(errors)
    
return Object.keys(errors).length === 0
  }

  const onSubmit = async (data: ProductFormData) => {
    if (!validateForm(data)) {
      toast.error('Please fix the errors below')
      
return
    }

    setLoading(true)
    try {
      const basicPayload = {
        id_product: 0,
        name: data.name,
        sku: data.sku,
        sort_description: data.sort_description,
        long_description: data.long_description,
        making_charge: data.making_charge || 0,
        finding_charge: data.making_charge || 0,
        other_charge: data.other_charge || 0,
        product_categories: [{
          id: 0,
          id_category: data.category_id,
          id_sub_category: data.sub_category_id || null,
          id_sub_sub_category: data.sub_sub_category_id || null
        }],
        tag: data.tags || []
      }

      const response = await ADD_PRODUCT_BASIC_DETAILS(basicPayload)
      if (response.code === 200 || response.code === '200') {
        const productId = response.data?.id || response.data?.findProduct?.id

        if (productId && (selectedMetals.length > 0 || selectedDiamonds.length > 0) && data.is_active === '1') {
          const metalPayload = {
            id_product: productId,
            setting_style_type: [],
            size: data.item_sizes || [],
            length: data.item_lengths || [],
            metal_data: selectedMetals.map((m) => ({
              id: 0,
              id_metal: m.id_metal_type,
              id_karat: m.id_karat,
              id_metal_tone: m.id_tone || null,
              metal_weight: m.weight
            })),
            diamond_data: selectedDiamonds.map((d) => {
              const group = getDiamondGroupForSelection(d)
              
return {
                id: 0,
                id_diamond_group: group?.id || null,
                id_type: d.id_stone || 1,
                id_stone: d.id_stone,
                id_shape: d.id_shape,
                id_mm_size: d.id_mm_size,
                id_color: d.id_color,
                id_clarity: d.id_clarity,
                id_cuts: d.id_cuts,
                weight: d.weight,
                count: d.count,
                manual_price: d.manual_price || null,
                id_setting: null
              }
            })
          }

          await ADD_PRODUCT_METAL_DIAMOND_DETAILS(metalPayload)
        }

        if (productId && images.length > 0 && imageMetalToneId) {
          const imagePayload = new FormData()
          imagePayload.append('id_product', productId.toString())
          imagePayload.append('id_metal_tone', imageMetalToneId.toString())
          imagePayload.append('image_type', '2')
          images.forEach(file => imagePayload.append('images', file))

          const imageResponse = await ADD_PRODUCT_IMAGES(imagePayload)
          if (imageResponse.code !== 200 && imageResponse.code !== '200') {
            toast.error(imageResponse.message || 'Product created, but image upload failed')
          }
        }

        toast.success(data.is_active === '0' ? 'Product saved as draft!' : 'Product created successfully!')
        reset()
        setSelectedMetals([])
        setSelectedDiamonds([])
        setImages([])
        setImageMetalToneId('')
      } else {
        toast.error(response.message || 'Failed to create product')
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      setImages(prev => [...prev, ...acceptedFiles])
    }
  })

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <ErrorBoundary>
      <Box>
        <Typography variant='h4' sx={{ mb: 4, color: '#c6a55a', fontWeight: 600 }}>
          Add New Product
        </Typography>

        <Card>
          <CardContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                <Tab label="Basic Info" icon={<Iconify icon='fluent-mdl2:product-release' />} iconPosition="start" />
                <Tab label="Metals & Diamonds" icon={<Iconify icon='ion:diamond-outline' />} iconPosition="start" />
                <Tab label="Images" icon={<Iconify icon='tabler:cloud-upload' />} iconPosition="start" />
                <Tab label="Pricing" icon={<Iconify icon='tabler:currency-rupee' />} iconPosition="start" />
              </Tabs>
            </Box>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {activeTab === 0 && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='name'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Product Name *'
                          error={!!errors.name || !!validationErrors.name}
                          helperText={errors.name?.message || validationErrors.name}
                          onChange={(e) => {
                            field.onChange(e)
                            setValidationErrors(prev => ({ ...prev, name: '' }))
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Controller
                      name='sku'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='SKU *'
                          error={!!errors.sku || !!validationErrors.sku}
                          helperText={errors.sku?.message || validationErrors.sku}
                          onChange={(e) => {
                            field.onChange(e)
                            setValidationErrors(prev => ({ ...prev, sku: '' }))
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      Category *
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth error={!!validationErrors.category_id} disabled={metalLoading}>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={selectedCategoryId || ''}
                            label='Category'
                            onChange={(e) => {
                              setValue('category_id', e.target.value as number)
                              setValue('sub_category_id', null)
                              setValue('sub_sub_category_id', null)
                              setValidationErrors(prev => ({ ...prev, category_id: '' }))
                            }}
                          >
                            {metalLoading ? (
                              <MenuItem disabled>Loading categories...</MenuItem>
                            ) : dropdownData?.categoryList?.length === 0 ? (
                              <MenuItem disabled>No categories available</MenuItem>
                            ) : (
                              dropdownData?.categoryList
                                .filter((c: Category) => c.parent_id === null || Number(c.parent_id) === 0)
                                .map((category: Category) => (
                                  <MenuItem key={category.id} value={category.id}>
                                    {category.category_name || category.name}
                                  </MenuItem>
                                ))
                            )}
                          </Select>
                          {dropdownData?.categoryList?.length === 0 && !metalLoading && (
                            <Button
                              size="small"
                              onClick={() => loadDropdownData()}
                              sx={{ mt: 1 }}
                            >
                              Retry Loading Categories
                            </Button>
                          )}
                          {validationErrors.category_id && (
                            <FormHelperText>{validationErrors.category_id}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Sub Category</InputLabel>
                          <Select
                            value={selectedSubCategoryId || ''}
                            label='Sub Category'
                            onChange={(e) => {
                              setValue('sub_category_id', e.target.value as number)
                              setValue('sub_sub_category_id', null)
                            }}
                            disabled={!selectedCategoryId}
                          >
                            {subCategories.map((sub: Category) => (
                              <MenuItem key={sub.id} value={sub.id}>
                                {sub.category_name || sub.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Sub Sub Category</InputLabel>
                          <Select
                            value={watch('sub_sub_category_id') || ''}
                            label='Sub Sub Category'
                            onChange={(e) => setValue('sub_sub_category_id', e.target.value as number)}
                            disabled={!selectedSubCategoryId}
                          >
                            {subSubCategories.map((sub: Category) => (
                              <MenuItem key={sub.id} value={sub.id}>
                                {sub.category_name || sub.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={1}>
                        <Button
                          variant='outlined'
                          startIcon={<Iconify icon='tabler:plus' />}
                          onClick={() => setCategoryDialogOpen(true)}
                          fullWidth
                          sx={{ height: '56px' }}
                        >
                          New
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name='sort_description'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          label='Short Description'
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name='long_description'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={6}
                          label='Long Description'
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      Tags
                    </Typography>
                    <Controller
                      name='tags'
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <Button
                            fullWidth
                            variant='outlined'
                            onClick={() => setTagsDialogOpen(true)}
                            sx={{
                              justifyContent: 'flex-start',
                              py: 1.5,
                              borderColor: 'divider',
                              color: 'text.primary'
                            }}
                          >
                            {field.value && field.value.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {field.value.map((value: number) => {
                                  const tag = dropdownData?.keyWords.find((t: Tag) => t.id === value)
                                  
return (
                                    <Chip
                                      key={value}
                                      label={tag?.name || value}
                                      size='small'
                                      sx={{
                                        backgroundColor: '#c6a55a',
                                        color: '#000',
                                        fontWeight: 500
                                      }}
                                    />
                                  )
                                })}
                              </Box>
                            ) : (
                              <Typography color='text.secondary'>Select Tags</Typography>
                            )}
                          </Button>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      Gender
                    </Typography>
                    <Controller
                      name='gender'
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <Button
                            fullWidth
                            variant='outlined'
                            onClick={() => setGenderDialogOpen(true)}
                            sx={{
                              justifyContent: 'flex-start',
                              py: 1.5,
                              borderColor: 'divider',
                              color: 'text.primary'
                            }}
                          >
                            {field.value && field.value.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {field.value.map((value: number) => {
                                  const gender = GENDER_OPTIONS.find((g) => g.id === value)
                                  
return (
                                    <Chip
                                      key={value}
                                      label={gender?.name || value}
                                      size='small'
                                      sx={{
                                        backgroundColor: '#c6a55a',
                                        color: '#000',
                                        fontWeight: 500
                                      }}
                                    />
                                  )
                                })}
                              </Box>
                            ) : (
                              <Typography color='text.secondary'>Select Gender</Typography>
                            )}
                          </Button>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      Sizes
                    </Typography>
                    <Controller
                      name='item_sizes'
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <Button
                            fullWidth
                            variant='outlined'
                            onClick={() => setSizesDialogOpen(true)}
                            sx={{
                              justifyContent: 'flex-start',
                              py: 1.5,
                              borderColor: 'divider',
                              color: 'text.primary'
                            }}
                          >
                            {field.value && field.value.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {field.value.map((value: number) => {
                                  const size = dropdownData?.item_size.find((s) => s.id === value)
                                  
return (
                                    <Chip
                                      key={value}
                                      label={size?.size || value}
                                      size='small'
                                      sx={{
                                        backgroundColor: '#c6a55a',
                                        color: '#000',
                                        fontWeight: 500
                                      }}
                                    />
                                  )
                                })}
                              </Box>
                            ) : (
                              <Typography color='text.secondary'>Select Sizes</Typography>
                            )}
                          </Button>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {isNecklaceCategory() && (
                    <Grid item xs={12} md={6}>
                      <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                        Lengths
                      </Typography>
                      <Controller
                        name='item_lengths'
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <Button
                              fullWidth
                              variant='outlined'
                              onClick={() => setLengthsDialogOpen(true)}
                              sx={{
                                justifyContent: 'flex-start',
                                py: 1.5,
                                borderColor: 'divider',
                                color: 'text.primary'
                              }}
                            >
                              {field.value && field.value.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {field.value.map((value: number) => {
                                    const length = dropdownData?.item_length.find((l) => l.id === value)
                                    
return (
                                      <Chip
                                        key={value}
                                        label={length?.length || value}
                                        size='small'
                                        sx={{
                                          backgroundColor: '#c6a55a',
                                          color: '#000',
                                          fontWeight: 500
                                        }}
                                      />
                                    )
                                  })}
                                </Box>
                              ) : (
                                <Typography color='text.secondary'>Select Lengths</Typography>
                              )}
                            </Button>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                      Storefront Purchase Flow
                    </Typography>
                    {shouldShowTip('purchase-options') && (
                      <Alert severity='warning' sx={{ mb: 2 }} onClose={() => dismissTip('purchase-options')}>
                        The current product API does not persist separate purchase-mode flags. The storefront still shows pricing,
                        Add to Bag, wishlist, and Enquire Now based on the saved product and pricing data. Keep made-to-order
                        instructions in the product description until a backend-backed purchase-mode field is added.
                      </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip label='Current storefront: Add to Bag when product has pricing' size='small' color='success' variant='outlined' />
                      <Chip label='Current storefront: Enquire Now always available on detail page' size='small' color='info' variant='outlined' />
                      <Chip label='Future: backend-backed purchase mode required' size='small' color='warning' variant='outlined' />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant='contained'
                        onClick={() => setActiveTab(1)}
                        sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
                      >
                        Next: Metals & Diamonds
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}

            {activeTab === 1 && (
              <Box>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant='h6' sx={{ fontWeight: 600 }}>
                        <Iconify icon='tabler:coins' style={{ marginRight: 8 }} />
                        Metal Configuration
                      </Typography>
                      <Chip
                        label={`${selectedMetals.length} Selected`}
                        size='small'
                        sx={{ backgroundColor: '#c6a55a', color: '#000', fontWeight: 500 }}
                      />
                    </Box>
                    {shouldShowTip('metal-calculation') && (
                      <Alert severity='info' sx={{ mb: 2 }} onClose={() => dismissTip('metal-calculation')}>
                        Configure metals with type, karat, tone and weight to calculate rough metal cost.
                        Cost = (weight / 31.104) × (karat/24) × metal_rate
                      </Alert>
                    )}

                    <Card variant='outlined' sx={{ mb: 3 }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems='flex-end'>
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth size='small'>
                              <InputLabel>Metal Type</InputLabel>
                              <Select
                                value={newMetal.id_metal_type || ''}
                                label='Metal Type'
                                onChange={(e) => setNewMetal({ ...newMetal, id_metal_type: e.target.value as number })}
                              >
                                <MenuItem value=''><em>Select</em></MenuItem>
                                {dropdownData?.metalTypes.map((metal) => (
                                  <MenuItem key={metal.id} value={metal.id}>
                                    {metal.name} (R{metal.metal_rate?.toLocaleString()}/g)
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth size='small'>
                              <InputLabel>Karat</InputLabel>
                              <Select
                                value={newMetal.id_karat || ''}
                                label='Karat'
                                onChange={(e) => setNewMetal({ ...newMetal, id_karat: e.target.value as number })}
                              >
                                <MenuItem value=''><em>Select</em></MenuItem>
                                {dropdownData?.metalKarats.map((karat) => (
                                  <MenuItem key={karat.id} value={karat.id}>
                                    {karat.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth size='small'>
                              <InputLabel>Tone</InputLabel>
                              <Select
                                value={newMetal.id_tone || ''}
                                label='Tone'
                                onChange={(e) => setNewMetal({ ...newMetal, id_tone: e.target.value as number })}
                              >
                                <MenuItem value=''><em>None</em></MenuItem>
                                {dropdownData?.metalTones.map((tone) => (
                                  <MenuItem key={tone.id} value={tone.id}>
                                    {tone.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} md={2}>
                            <TextField
                              fullWidth
                              size='small'
                              type='number'
                              label='Weight (g)'
                              value={newMetal.weight || ''}
                              onChange={(e) => setNewMetal({ ...newMetal, weight: Math.abs(parseFloat(e.target.value)) || 0 })}
                              onWheel={(e) => e.currentTarget.blur()}
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </Grid>
                          <Grid item xs={12} md={1}>
                            <Button
                              fullWidth
                              variant='contained'
                              onClick={addMetal}
                              sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
                            >
                              Add
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {selectedMetals.length > 0 && (
                            <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Table size='small'>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell><strong>Metal</strong></TableCell>
                              <TableCell><strong>Karat</strong></TableCell>
                              <TableCell><strong>Tone</strong></TableCell>
                              <TableCell align='right'><strong>Weight</strong></TableCell>
                              <TableCell align='right'><strong>Est. Cost</strong></TableCell>
                              <TableCell align='center'><strong>Action</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedMetals.map((metal, index) => {
                              const metalType = dropdownData?.metalTypes.find(m => m.id === metal.id_metal_type)
                              const karat = dropdownData?.metalKarats.find(k => k.id === metal.id_karat)
                              const tone = dropdownData?.metalTones.find(t => t.id === metal.id_tone)
                              const cost = calculateMetalCost(metal)
                              
return (
                                <TableRow key={index}>
                                  <TableCell>{metalType?.name || '-'}</TableCell>
                                  <TableCell>{karat?.name || '-'}</TableCell>
                                  <TableCell>{tone?.name || '-'}</TableCell>
                                  <TableCell align='right'>{metal.weight}g</TableCell>
                                  <TableCell align='right'>R{cost.toLocaleString()}</TableCell>
                                  <TableCell align='center'>
                                    <IconButton size='small' color='error' onClick={() => removeMetal(index)}>
                                      <Iconify icon='tabler:trash' fontSize={18} />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                            <TableRow sx={{ backgroundColor: '#fafafa' }}>
                              <TableCell colSpan={4} align='right'><strong>Total Metal Cost:</strong></TableCell>
                              <TableCell align='right'><strong>R{totalMetalCost.toLocaleString()}</strong></TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 4 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant='h6' sx={{ fontWeight: 600 }}>
                        <Iconify icon='ion:diamond-outline' style={{ marginRight: 8 }} />
                        Diamond Configuration
                      </Typography>
                      <Chip
                        label={`${selectedDiamonds.length} Selected`}
                        size='small'
                        sx={{ backgroundColor: '#c6a55a', color: '#000', fontWeight: 500 }}
                      />
                    </Box>
                    {shouldShowTip('diamond-configuration') && (
                      <Alert severity='info' sx={{ mb: 2 }} onClose={() => dismissTip('diamond-configuration')}>
                        Decoupled diamond attributes allow mix-and-match. If no matching diamond group exists,
                        enter a price below to automatically create a new group.
                      </Alert>
                    )}

                    <Card variant='outlined' sx={{ mb: 3 }}>
                      <CardContent>
                        <Grid container spacing={2} alignItems='flex-end'>
                          <Grid item xs={6} md={2}>
                            <FormControl fullWidth size='small'>
                              <InputLabel>Stone Type</InputLabel>
                              <Select
                                value={newDiamond.id_stone || ''}
                                label='Stone Type'
                                onChange={(e) => setNewDiamond({ ...newDiamond, id_stone: e.target.value as number })}
                              >
                                <MenuItem value=''><em>Select</em></MenuItem>
                                {dropdownData?.diamondStones.map((stone) => (
                                  <MenuItem key={stone.id} value={stone.id}>{stone.name}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <FormControl fullWidth size='small'>
                              <InputLabel>Shape</InputLabel>
                              <Select
                                value={newDiamond.id_shape || ''}
                                label='Shape'
                                onChange={(e) => setNewDiamond({ ...newDiamond, id_shape: e.target.value as number })}
                              >
                                <MenuItem value=''><em>Select</em></MenuItem>
                                {dropdownData?.diamondShapes.map((shape) => (
                                  <MenuItem key={shape.id} value={shape.id}>{shape.name}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <FormControl fullWidth size='small'>
                              <InputLabel>Cut</InputLabel>
                              <Select
                                value={newDiamond.id_cuts || ''}
                                label='Cut'
                                onChange={(e) => setNewDiamond({ ...newDiamond, id_cuts: e.target.value as number })}
                              >
                                <MenuItem value=''><em>Select</em></MenuItem>
                                {dropdownData?.diamondCuts.map((cut) => (
                                  <MenuItem key={cut.id} value={cut.id}>{cut.value}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <FormControl fullWidth size='small'>
                              <InputLabel>Color</InputLabel>
                              <Select
                                value={newDiamond.id_color || ''}
                                label='Color'
                                onChange={(e) => setNewDiamond({ ...newDiamond, id_color: e.target.value as number })}
                              >
                                <MenuItem value=''><em>Select</em></MenuItem>
                                {dropdownData?.diamondColors.map((color) => (
                                  <MenuItem key={color.id} value={color.id}>{color.name}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <FormControl fullWidth size='small'>
                              <InputLabel>Clarity</InputLabel>
                              <Select
                                value={newDiamond.id_clarity || ''}
                                label='Clarity'
                                onChange={(e) => setNewDiamond({ ...newDiamond, id_clarity: e.target.value as number })}
                              >
                                <MenuItem value=''><em>Select</em></MenuItem>
                                {dropdownData?.diamondClarities.map((clarity) => (
                                  <MenuItem key={clarity.id} value={clarity.id}>{clarity.name}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <FormControl fullWidth size='small'>
                              <InputLabel>MM Size</InputLabel>
                              <Select
                                value={newDiamond.id_mm_size || ''}
                                label='MM Size'
                                onChange={(e) => setNewDiamond({ ...newDiamond, id_mm_size: e.target.value as number })}
                              >
                                <MenuItem value=''><em>Select</em></MenuItem>
                                {dropdownData?.diamondMMSizes.map((size) => (
                                  <MenuItem key={size.id} value={size.id}>{size.value}mm</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={4} md={1}>
                            <TextField
                              fullWidth
                              size='small'
                              type='number'
                              label='Carat'
                              value={newDiamond.weight || ''}
                              onChange={(e) => setNewDiamond({ ...newDiamond, weight: Math.abs(parseFloat(e.target.value)) || 0 })}
                              onWheel={(e) => e.currentTarget.blur()}
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </Grid>
                          <Grid item xs={4} md={1}>
                            <TextField
                              fullWidth
                              size='small'
                              type='number'
                              label='Count'
                              value={newDiamond.count}
                              onChange={(e) => setNewDiamond({ ...newDiamond, count: Math.abs(parseInt(e.target.value)) || 1 })}
                              onWheel={(e) => e.currentTarget.blur()}
                              inputProps={{ min: 1 }}
                            />
                          </Grid>
                          <Grid item xs={4} md={1}>
                            <TextField
                              fullWidth
                              size='small'
                              type='number'
                              label='Price/Carat'
                              value={newDiamond.manual_price || ''}
                              onChange={(e) => setNewDiamond({ ...newDiamond, manual_price: Math.abs(parseFloat(e.target.value)) || undefined })}
                              onWheel={(e) => e.currentTarget.blur()}
                              inputProps={{ min: 0, step: 0.01 }}
                              placeholder='Auto or enter'
                            />
                          </Grid>
                          <Grid item xs={4} md={1}>
                            <Button
                              fullWidth
                              variant='contained'
                              onClick={addDiamond}
                              sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
                            >
                              Add
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {selectedDiamonds.length > 0 && (
                      <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
                        <Table size='small'>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                              <TableCell><strong>Stone</strong></TableCell>
                              <TableCell><strong>Shape</strong></TableCell>
                              <TableCell><strong>Cut</strong></TableCell>
                              <TableCell><strong>Color</strong></TableCell>
                              <TableCell><strong>Clarity</strong></TableCell>
                              <TableCell><strong>MM Size</strong></TableCell>
                              <TableCell align='right'><strong>Carat</strong></TableCell>
                              <TableCell align='center'><strong>Count</strong></TableCell>
                              <TableCell align='right'><strong>Est. Cost</strong></TableCell>
                              <TableCell align='center'><strong>Action</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedDiamonds.map((diamond, index) => {
                              const stone = dropdownData?.diamondStones.find(s => s.id === diamond.id_stone)
                              const shape = dropdownData?.diamondShapes.find(s => s.id === diamond.id_shape)
                              const cut = dropdownData?.diamondCuts.find(c => c.id === diamond.id_cuts)
                              const color = dropdownData?.diamondColors.find(c => c.id === diamond.id_color)
                              const clarity = dropdownData?.diamondClarities.find(c => c.id === diamond.id_clarity)
                              const mmSize = dropdownData?.diamondMMSizes.find(m => m.id === diamond.id_mm_size)
                              const group = getDiamondGroupForSelection(diamond)
                              const cost = calculateDiamondCost(diamond)
                              
return (
                                <TableRow key={index}>
                                  <TableCell>{stone?.name || '-'}</TableCell>
                                  <TableCell>{shape?.name || '-'}</TableCell>
                                  <TableCell>{cut?.value || '-'}</TableCell>
                                  <TableCell>{color?.name || '-'}</TableCell>
                                  <TableCell>{clarity?.name || '-'}</TableCell>
                                  <TableCell>{mmSize?.value ? `${mmSize.value}mm` : '-'}</TableCell>
                                  <TableCell align='right'>{diamond.weight}</TableCell>
                                  <TableCell align='center'>{diamond.count}</TableCell>
                                  <TableCell align='right'>
                                    {group ? (
                                      <Box>
                                        <Typography variant='body2'>R{cost.toLocaleString()}</Typography>
                                        <Typography variant='caption' color='text.secondary'>
                                          {group.name}
                                        </Typography>
                                      </Box>
                                    ) : diamond.manual_price ? (
                                      <Box>
                                        <Typography variant='body2'>R{cost.toLocaleString()}</Typography>
                                        <Chip
                                          label='New group'
                                          size='small'
                                          sx={{ backgroundColor: '#4caf50', color: '#000', fontWeight: 500 }}
                                        />
                                      </Box>
                                    ) : (
                                      <Chip
                                        label='No price'
                                        size='small'
                                        sx={{ backgroundColor: '#ff9800', color: '#000', fontWeight: 500 }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell align='center'>
                                    <IconButton size='small' color='error' onClick={() => removeDiamond(index)}>
                                      <Iconify icon='tabler:trash' fontSize={18} />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                            <TableRow sx={{ backgroundColor: '#fafafa' }}>
                              <TableCell colSpan={5} align='right'><strong>Total Diamond Cost:</strong></TableCell>
                              <TableCell align='right'><strong>R{totalDiamondCost.toLocaleString()}</strong></TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Button variant='outlined' onClick={() => setActiveTab(0)}>
                        Back
                      </Button>
                      <Button
                        variant='contained'
                        onClick={() => setActiveTab(2)}
                        sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
                      >
                        Next: Images
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                  Product Images
                </Typography>

                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <input {...getInputProps()} />
                  <Iconify icon='tabler:cloud-upload' style={{ fontSize: 48, color: '#c6a55a', marginBottom: 16 }} />
                  <Typography variant='h6' gutterBottom>
                    {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    or click to browse (max 5MB per file, jpg/png/webp)
                  </Typography>
                </Paper>

                {images.length > 0 && (
                  <FormControl fullWidth sx={{ mt: 3 }} error={!!validationErrors.images}>
                    <InputLabel>Metal tone for uploaded images</InputLabel>
                    <Select
                      value={imageMetalToneId}
                      label='Metal tone for uploaded images'
                      onChange={(event) => setImageMetalToneId(Number(event.target.value))}
                    >
                      {dropdownData?.metalTones.map(tone => (
                        <MenuItem key={tone.id} value={tone.id}>
                          {tone.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {validationErrors.images || 'Images are saved against a metal tone so storefront variants remain clear.'}
                    </FormHelperText>
                  </FormControl>
                )}

                {images.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant='subtitle2' sx={{ mb: 2 }}>
                      Selected Images ({images.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {images.map((file, index) => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                          <Paper sx={{ position: 'relative', border: '1px solid', borderColor: 'divider' }}>
                            <Box
                              sx={{
                                height: 150,
                                backgroundImage: `url(${URL.createObjectURL(file)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            />
                            <IconButton
                              size='small'
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'error.dark' }
                              }}
                              onClick={() => removeImage(index)}
                            >
                              <Iconify icon='tabler:x' fontSize={16} />
                            </IconButton>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Button variant='outlined' onClick={() => setActiveTab(1)}>
                    Back
                  </Button>
                  <Button
                    variant='contained'
                    onClick={() => setActiveTab(3)}
                    sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
                  >
                    Next: Pricing
                  </Button>
                </Box>
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                  Pricing Configuration
                </Typography>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                          Charges
                        </Typography>

                        <Controller
                          name='making_charge'
                          control={control}
                          render={({ field }) => (
                            <TextField
                              fullWidth
                              size='small'
                              type='number'
                              label='Making Charge (Labor)'
                              value={field.value}
                              onChange={(e) => field.onChange(Math.abs(parseFloat(e.target.value)) || 0)}
                              onWheel={(e) => e.currentTarget.blur()}
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          )}
                        />

                          <Box sx={{ mt: 2 }}>
                            <Controller
                              name='other_charge'
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  fullWidth
                                  size='small'
                                  type='number'
                                  label='Other Charges'
                                  value={field.value}
                                  onChange={(e) => field.onChange(Math.abs(parseFloat(e.target.value)) || 0)}
                                  onWheel={(e) => e.currentTarget.blur()}
                                  inputProps={{ min: 0, step: 0.01 }}
                                />
                              )}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant='outlined' sx={{ backgroundColor: '#fafafa' }}>
                      <CardContent>
                        <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
                          Cost Breakdown
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant='body2'>Metal Cost:</Typography>
                          <Typography variant='body2'>R{totalMetalCost.toLocaleString()}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant='body2'>Diamond Cost:</Typography>
                          <Typography variant='body2'>R{totalDiamondCost.toLocaleString()}</Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant='body2'>Subtotal (Materials):</Typography>
                          <Typography variant='body2'>
                            R{(totalMetalCost + totalDiamondCost).toLocaleString()}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant='body2'>Making Charge:</Typography>
                          <Typography variant='body2'>
                            R{(watch('making_charge') || 0).toLocaleString()}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant='body2'>Other Charges:</Typography>
                          <Typography variant='body2'>
                            R{(watch('other_charge') || 0).toLocaleString()}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant='h6' fontWeight={600}>Total Cost:</Typography>
                          <Typography variant='h6' fontWeight={600} color='#c6a55a'>
                            R{(
                              totalMetalCost +
                              totalDiamondCost +
                              (watch('making_charge') || 0) +
                              (watch('other_charge') || 0)
                            ).toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: 2
                      }}
                    >
                      <Button variant='outlined' onClick={() => setActiveTab(2)}>
                        Back
                      </Button>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: { xs: 'stretch', sm: 'flex-end' },
                          alignItems: { xs: 'stretch', sm: 'center' },
                          gap: 2
                        }}
                      >
                        <Button variant='outlined' onClick={() => setResetDialogOpen(true)}>
                          Reset
                        </Button>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'stretch', sm: 'center' },
                            gap: 2
                          }}
                        >
                          <Controller
                            name='is_active'
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value === '1'}
                                    onChange={(e) => field.onChange(e.target.checked ? '1' : '0')}
                                    color='success'
                                  />
                                }
                                label={field.value === '1' ? 'Publish' : 'Save as Draft'}
                              />
                            )}
                          />
                          <Button
                            variant='contained'
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                            sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
                          >
                            {loading ? (watch('is_active') === '0' ? 'Saving...' : 'Creating...') : (watch('is_active') === '0' ? 'Save Draft' : 'Create Product')}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>

        <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
          <DialogTitle>Reset Form?</DialogTitle>
          <DialogContent>
            <Typography>This will clear all form data. Are you sure you want to reset?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                reset()
                setSelectedMetals([])
                setSelectedDiamonds([])
                setImages([])
                setResetDialogOpen(false)
              }}
              variant='contained'
              sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
            >
              Yes, Reset
            </Button>
          </DialogActions>
        </Dialog>

        <InlineAttributeCreate
          open={categoryDialogOpen}
          onClose={() => setCategoryDialogOpen(false)}
          onSuccess={(newAttribute) => {
            loadDropdownData()
          }}
          attributeType='category'
        />

        <MultiSelectDialog
          open={tagsDialogOpen}
          onClose={() => setTagsDialogOpen(false)}
          onConfirm={(selected) => setValue('tags', selected)}
          title='Select Tags'
          options={dropdownData?.keyWords || []}
          selectedIds={watch('tags') || []}
          loading={metalLoading}
        />

        <MultiSelectDialog
          open={genderDialogOpen}
          onClose={() => setGenderDialogOpen(false)}
          onConfirm={(selected) => setValue('gender', selected)}
          title='Select Gender'
          options={GENDER_OPTIONS}
          selectedIds={watch('gender') || []}
        />

        <MultiSelectDialog
          open={sizesDialogOpen}
          onClose={() => setSizesDialogOpen(false)}
          onConfirm={(selected) => setValue('item_sizes', selected)}
          title='Select Sizes'
          options={dropdownData?.item_size || []}
          selectedIds={watch('item_sizes') || []}
          labelKey='size'
          loading={metalLoading}
        />

        <MultiSelectDialog
          open={lengthsDialogOpen}
          onClose={() => setLengthsDialogOpen(false)}
          onConfirm={(selected) => setValue('item_lengths', selected)}
          title='Select Lengths'
          options={dropdownData?.item_length || []}
          selectedIds={watch('item_lengths') || []}
          labelKey='length'
          loading={metalLoading}
        />
      </Box>
    </ErrorBoundary>
  )
}

export default SimplifiedProductForm
