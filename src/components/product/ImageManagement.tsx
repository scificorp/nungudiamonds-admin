import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material'
import { Icon } from '@iconify/react'
import { toast } from 'react-hot-toast'
import TccMultipleImageUpload from 'src/customComponents/Form-Elements/file-upload/image-upload'
import DeleteDataModel from 'src/customComponents/delete-model'
import {
  ADD_PRODUCT_IMAGES,
  PRODUCT_IMAGE_DELETE,
  GET_BY_ID_PRODUCTS,
  METAL_TONE_DROPDOWN_LIST,
  SET_MAIN_PRODUCT_IMAGE
} from 'src/services/AdminServices'
import { IMG_ENDPOINT } from 'src/AppConfig'
import { appErrors } from 'src/AppConstants'

interface ImageData {
  id: number
  image_path: string
  image_type: number
  id_metal_tone: number
  metal_tone_name?: string
  created_date?: string
}

interface MetalTone {
  id: number
  name: string
  value: string
}

interface ImageManagementProps {
  productId: number
  onImagesChange?: () => void
}

const ImageManagement: React.FC<ImageManagementProps> = ({ productId, onImagesChange }) => {
  const [images, setImages] = useState<ImageData[]>([])
  const [metalTones, setMetalTones] = useState<MetalTone[]>([])
  const [selectedMetalTone, setSelectedMetalTone] = useState<number | ''>('')
  const [uploadingImages, setUploadingImages] = useState<File[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null)
  const [selectedImageType, setSelectedImageType] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadImageType, setUploadImageType] = useState<number>(2) // Default to regular images

  const imageTypeLabels = {
    1: 'Featured',
    2: 'Regular',
    3: '360°',
    4: 'Video'
  }

  const imageTypeColors = {
    1: 'primary',
    2: 'default',
    3: 'secondary',
    4: 'success'
  } as const

  const fetchProductImages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await GET_BY_ID_PRODUCTS(productId)
      if (response.code === 200) {
        const productImages = response.data.findProduct.product_images || []
        const metalToneData = response.data.metal_tone || []

        // Enrich images with metal tone names
        const enrichedImages = productImages.map((img: any) => ({
          ...img,
          metal_tone_name: metalToneData.find((mt: any) => mt.id == img.id_metal_tone)?.name || 'Unknown'
        }))

        setImages(enrichedImages)
      }
    } catch (error) {
      toast.error('Failed to fetch product images')
    } finally {
      setLoading(false)
    }
  }, [productId])

  const fetchMetalTones = useCallback(async () => {
    try {
      const payload = {
        product_id: productId
      }
      const response = await METAL_TONE_DROPDOWN_LIST(payload)
      if (response.code === 200) {
        setMetalTones(response.data || [])
      }
    } catch (error) {
      toast.error('Failed to fetch metal tones')
    }
  }, [productId])

  useEffect(() => {
    if (productId) {
      fetchProductImages()
      fetchMetalTones()
    }
  }, [fetchMetalTones, fetchProductImages, productId])

  const handleImageUpload = async () => {
    if (!selectedMetalTone || uploadingImages.length === 0) {
      toast.error('Please select a metal tone and add images')
      
return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('id_product', productId.toString())
      formData.append('id_metal_tone', selectedMetalTone.toString())
      formData.append('image_type', uploadImageType.toString())

      uploadingImages.forEach((file) => {
        formData.append('images', file)
      })

      const response = await ADD_PRODUCT_IMAGES(formData)
      if (response.code === 200) {
        toast.success('Images uploaded successfully')
        setShowUploadDialog(false)
        setUploadingImages([])
        setSelectedMetalTone('')
        fetchProductImages()
        onImagesChange?.()
      } else {
        toast.error(response.message || 'Failed to upload images')
      }
    } catch (error) {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = (imageId: number, imageType: string) => {
    setSelectedImageId(imageId)
    setSelectedImageType(imageType)
    setShowDeleteModal(true)
  }

  const handleSetAsMainImage = async (imageId: number, metalToneId: number, imageType: number) => {
    try {
      const response = await SET_MAIN_PRODUCT_IMAGE({
        id_product: productId,
        id_image: imageId,
        id_metal_tone: metalToneId,
        image_type: imageType
      })

      if (response.code === 200) {
        toast.success('Main image updated successfully')
        fetchProductImages()
        onImagesChange?.()
      } else {
        toast.error(response.message || 'Failed to update main image')
      }
    } catch (error: any) {
      console.error('Error setting main image:', error)
      toast.error(error?.data?.message || 'Failed to update main image')
    }
  }

  const confirmDeleteImage = async () => {
    if (!selectedImageId) return

    try {
      const response = await PRODUCT_IMAGE_DELETE({
        id_product: productId,
        id: selectedImageId
      })

      if (response.code === 200) {
        toast.success('Image deleted successfully')
        setShowDeleteModal(false)
        fetchProductImages()
        onImagesChange?.()
      } else {
        toast.error(response.message || 'Failed to delete image')
      }
    } catch (error) {
      toast.error('Failed to delete image')
    }
  }

  const groupedImages = images.reduce((acc, image) => {
    const key = `${image.id_metal_tone}-${image.image_type}`
    if (!acc[key]) {
      acc[key] = {
        metalTone: image.metal_tone_name || 'Unknown',
        metalToneId: image.id_metal_tone,
        imageType: image.image_type,
        images: []
      }
    }
    acc[key].images.push(image)
    
return acc
  }, {} as Record<string, { metalTone: string; metalToneId: number; imageType: number; images: ImageData[] }>)

  // Sort images within each group to ensure consistent ordering
  // The backend promotes the chosen image by updating created_date, so the newest image stays first.
  Object.values(groupedImages).forEach(group => {
    group.images.sort((a, b) => {
      return new Date(b.created_date || 0).getTime() - new Date(a.created_date || 0).getTime()
    })
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Image Management</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="tabler:upload" />}
          onClick={() => setShowUploadDialog(true)}
        >
          Upload Images
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {Object.keys(groupedImages).length === 0 ? (
            <Alert severity="info">
              No images found for this product. Click "Upload Images" to add some.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {Object.entries(groupedImages).map(([key, group]) => (
                <Grid item xs={12} key={key}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ mr: 2 }}>
                          {group.metalTone}
                        </Typography>
                        <Chip
                          label={imageTypeLabels[group.imageType as keyof typeof imageTypeLabels]}
                          color={imageTypeColors[group.imageType as keyof typeof imageTypeColors]}
                          size="small"
                        />
                      </Box>

                      <Grid container spacing={2}>
                        {group.images.map((image, index) => (
                          <Grid item xs={6} sm={4} md={3} lg={2} key={image.id}>
                            <Box
                              sx={{
                                position: 'relative',
                                height: 150,
                                border: '2px solid',
                                borderColor: index === 0 ? 'primary.main' : 'grey.300',
                                borderRadius: 2,
                                overflow: 'hidden',
                                '&:hover': {
                                  borderColor: 'primary.main'
                                }
                              }}
                            >
                              <img
                                src={`${IMG_ENDPOINT}/${image.image_path}`}
                                alt={`Product image ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />

                              {index === 0 && (
                                <Chip
                                  label="Main"
                                  size="small"
                                  color="primary"
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    left: 4
                                  }}
                                />
                              )}

                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  display: 'flex',
                                  gap: 0.5
                                }}
                              >
                                {index !== 0 && (
                                  <Tooltip title="Set as main image">
                                    <IconButton
                                      size="small"
                                      sx={{
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                                      }}
                                      onClick={() => handleSetAsMainImage(
                                        image.id,
                                        group.metalToneId,
                                        group.imageType
                                      )}
                                    >
                                      <Icon icon="tabler:star" fontSize={16} />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                <Tooltip title="Delete image">
                                  <IconButton
                                    size="small"
                                    sx={{
                                      backgroundColor: 'rgba(255,255,255,0.9)',
                                      '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' }
                                    }}
                                    onClick={() => handleDeleteImage(
                                      image.id,
                                      imageTypeLabels[image.image_type as keyof typeof imageTypeLabels]
                                    )}
                                  >
                                    <Icon icon="tabler:trash" fontSize={16} color="error" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Product Images</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Metal Tone</InputLabel>
                <Select
                  value={selectedMetalTone}
                  onChange={(e) => setSelectedMetalTone(e.target.value as number)}
                  label="Metal Tone"
                >
                  {metalTones.map((tone) => (
                    <MenuItem key={tone.id} value={tone.id}>
                      {tone.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Image Type</InputLabel>
                <Select
                  value={uploadImageType}
                  onChange={(e) => setUploadImageType(e.target.value as number)}
                  label="Image Type"
                >
                  <MenuItem value={1}>Featured Images</MenuItem>
                  <MenuItem value={2}>Regular Images</MenuItem>
                  <MenuItem value={3}>360° Images</MenuItem>
                  <MenuItem value={4}>Video</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TccMultipleImageUpload
                onDrop={(files: File[]) => setUploadingImages(files)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleImageUpload}
            variant="contained"
            disabled={uploading || !selectedMetalTone || uploadingImages.length === 0}
            startIcon={uploading ? <CircularProgress size={16} /> : <Icon icon="tabler:upload" />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteDataModel
        showModel={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        onClick={confirmDeleteImage}
        title={`Delete ${selectedImageType}`}
        description={`Are you sure you want to delete this ${selectedImageType.toLowerCase()}? This action cannot be undone.`}
      />
    </Box>
  )
}

export default ImageManagement
