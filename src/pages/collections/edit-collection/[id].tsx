import { useState, useEffect } from 'react'
import { Grid, Card, CardHeader, CardContent, Divider, Button, TextField, FormControlLabel, Switch, Box } from '@mui/material'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ** Custom Components
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'

// ** API
import { EDIT_COLLECTION, GET_BY_ID_COLLECTION } from 'src/services/AdminServices'
import { appErrors } from 'src/AppConstants'

// ** Validation Schema
const schema = yup.object().shape({
  name: yup.string().required('Collection name is required').min(2, 'Name must be at least 2 characters'),
  slug: yup.string().required('Slug is required').matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: yup.string().max(5000, 'Description cannot exceed 5000 characters'),
  excerpt: yup.string().max(1000, 'Excerpt cannot exceed 1000 characters'),
  sort_order: yup.number().min(0, 'Sort order must be non-negative').integer('Sort order must be an integer'),
})

interface FormData {
  name: string
  slug: string
  description: string
  excerpt: string
  is_featured: boolean
  is_active: boolean
  sort_order: number
}

const EditCollection = () => {
  const router = useRouter()
  const { id } = router.query

  // ** States
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState<string>('')
  const [currentBannerImage, setCurrentBannerImage] = useState<string>('')

  // ** Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      excerpt: '',
      is_featured: false,
      is_active: true,
      sort_order: 0
    }
  })

  // ** Watch name to auto-generate slug
  const watchedName = watch('name')

  // ** Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // ** Handle name change and auto-generate slug
  const handleNameChange = (value: string) => {
    setValue('name', value)
    const slug = generateSlug(value)
    setValue('slug', slug)
  }

  // ** Fetch collection data
  useEffect(() => {
    if (id) {
      fetchCollectionData()
    }
  }, [id])

  const fetchCollectionData = async () => {
    try {
      setIsLoading(true)
      const response = await GET_BY_ID_COLLECTION(Number(id))

      if (response.code === 200 || response.code === '200') {
        const collection = response.data
        reset({
          name: collection.name || '',
          slug: collection.slug || '',
          description: collection.description || '',
          excerpt: collection.excerpt || '',
          is_featured: collection.is_featured === '1',
          is_active: collection.is_active === '1',
          sort_order: collection.sort_order || 0
        })

        if (collection.image?.image_path) {
          setCurrentImage(collection.image.image_path)
        }
        if (collection.banner_image?.image_path) {
          setCurrentBannerImage(collection.banner_image.image_path)
        }
      } else {
        toast.error('Failed to fetch collection data')
        router.push('/collections/collections-list')
      }
    } catch (error: any) {
      console.error('Error fetching collection:', error)
      toast.error(error?.data?.message || 'Failed to fetch collection data')
      router.push('/collections/collections-list')
    } finally {
      setIsLoading(false)
    }
  }

  // ** Submit Handler
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('id', id as string)
      formData.append('name', data.name)
      formData.append('slug', data.slug)
      formData.append('description', data.description)
      formData.append('excerpt', data.excerpt)
      formData.append('is_featured', data.is_featured ? '1' : '0')
      formData.append('is_active', data.is_active ? '1' : '0')
      formData.append('sort_order', data.sort_order.toString())

      if (imageFile) {
        formData.append('image', imageFile)
      }

      if (bannerImageFile) {
        formData.append('banner_image', bannerImageFile)
      }

      const response = await EDIT_COLLECTION(formData)

      if (response.code === 200 || response.code === '200') {
        toast.success('Collection updated successfully!')
        router.push('/collections/collections-list')
      } else {
        toast.error(response.message || 'Failed to update collection')
      }
    } catch (error: any) {
      console.error('Error updating collection:', error)
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                Loading collection data...
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Edit Collection" />
          <Divider />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={4}>
                {/* Collection Name */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Collection Name"
                        placeholder="Enter collection name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    )}
                  />
                </Grid>

                {/* Slug */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Slug"
                        placeholder="collection-slug"
                        error={!!errors.slug}
                        helperText={errors.slug?.message || 'URL-friendly version of the name'}
                      />
                    )}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        placeholder="Enter detailed description"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Excerpt */}
                <Grid item xs={12}>
                  <Controller
                    name="excerpt"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={2}
                        label="Excerpt"
                        placeholder="Enter short excerpt for preview"
                        error={!!errors.excerpt}
                        helperText={errors.excerpt?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Sort Order */}
                <Grid item xs={12} md={4}>
                  <Controller
                    name="sort_order"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Sort Order"
                        placeholder="0"
                        error={!!errors.sort_order}
                        helperText={errors.sort_order?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Featured Toggle */}
                <Grid item xs={12} md={4}>
                  <Controller
                    name="is_featured"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Featured Collection"
                      />
                    )}
                  />
                </Grid>

                {/* Active Toggle */}
                <Grid item xs={12} md={4}>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch {...field} checked={field.value} />}
                        label="Active"
                      />
                    )}
                  />
                </Grid>

                {/* Collection Image */}
                <Grid item xs={12} md={6}>
                  <TccSingleFileUpload
                    onDrop={(files: File[]) => setImageFile(files[0])}
                    onClick={(file: File) => setImageFile(file)}
                    clearFile={() => setImageFile(null)}
                    title="Collection Image"
                    currentImage={currentImage}
                  />
                </Grid>

                {/* Banner Image */}
                <Grid item xs={12} md={6}>
                  <TccSingleFileUpload
                    onDrop={(files: File[]) => setBannerImageFile(files[0])}
                    onClick={(file: File) => setBannerImageFile(file)}
                    clearFile={() => setBannerImageFile(null)}
                    title="Banner Image"
                    currentImage={currentBannerImage}
                  />
                </Grid>

                {/* Submit Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => router.push('/collections/collections-list')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Collection'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default EditCollection
