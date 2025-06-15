import { useState } from 'react'
import { Grid, Card, CardHeader, CardContent, Divider, Button, TextField, FormControlLabel, Switch, Box } from '@mui/material'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ** Custom Components
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'

// ** API
import { ADD_COLLECTION } from 'src/services/AdminServices'
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
  sort_order: number
}

const AddCollection = () => {
  const router = useRouter()

  // ** States
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ** Form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      excerpt: '',
      is_featured: false,
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

  // ** Submit Handler
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('slug', data.slug)
      formData.append('description', data.description)
      formData.append('excerpt', data.excerpt)
      formData.append('is_featured', data.is_featured ? '1' : '0')
      formData.append('sort_order', data.sort_order.toString())

      if (imageFile) {
        formData.append('image', imageFile)
      }

      if (bannerImageFile) {
        formData.append('banner_image', bannerImageFile)
      }

      const response = await ADD_COLLECTION(formData)

      if (response.code === 200 || response.code === '200') {
        toast.success('Collection added successfully!')
        router.push('/collections/collections-list')
      } else {
        toast.error(response.message || 'Failed to add collection')
      }
    } catch (error: any) {
      console.error('Error adding collection:', error)
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Add New Collection" />
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
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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

                {/* Collection Image */}
                <Grid item xs={12} md={6}>
                  <TccSingleFileUpload
                    onDrop={(files: File[]) => setImageFile(files[0])}
                    onClick={(file: File) => setImageFile(file)}
                    clearFile={() => setImageFile(null)}
                    title="Collection Image"
                  />
                </Grid>

                {/* Banner Image */}
                <Grid item xs={12} md={6}>
                  <TccSingleFileUpload
                    onDrop={(files: File[]) => setBannerImageFile(files[0])}
                    onClick={(file: File) => setBannerImageFile(file)}
                    clearFile={() => setBannerImageFile(null)}
                    title="Banner Image"
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
                      {isSubmitting ? 'Adding...' : 'Add Collection'}
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

export default AddCollection
