// ** Enhanced Hero Content Management with Better UX
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import Icon from 'src/@core/components/icon'
import EnhancedPreviewModal from '../../../components/hero-content/enhanced-preview-modal'
import URLInputSection from '../../../components/hero-content/url-input-section'

interface HeroContentData {
  id?: number
  desktop_video_url: string
  mobile_video_url: string
  desktop_image_url: string
  mobile_image_url: string
  content_type: 'video' | 'image'
  is_active: boolean
}

interface UploadedFile {
  id: string
  name: string
  url: string
  type: 'video' | 'image'
  size: number
  uploadedAt: Date
  preview?: string
  file?: File
  isUploaded?: boolean
}

interface PreviewData {
  desktop_url: string
  mobile_url: string
  desktop_content_type: 'video' | 'image'
  mobile_content_type: 'video' | 'image'
  content_type: 'video' | 'image'
  headline_font_family?: 'display-serif' | 'body-sans'
  supporting_text_font_family?: 'display-serif' | 'body-sans'
  cta_font_family?: 'display-serif' | 'body-sans'
  headline_color?: 'white' | 'soft-white' | 'gold'
  supporting_text_color?: 'white' | 'soft-white' | 'gold'
  cta_text_color?: 'white' | 'charcoal' | 'gold'
  cta_background_color?: 'gold' | 'charcoal' | 'white'
}

const EnhancedHeroContentManagement = () => {
  const [heroContent, setHeroContent] = useState<HeroContentData>({
    desktop_video_url: '',
    mobile_video_url: '',
    desktop_image_url: '',
    mobile_image_url: '',
    content_type: 'video',
    is_active: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<{
    desktop?: UploadedFile
    mobile?: UploadedFile
  }>({})
  const [pendingData, setPendingData] = useState<HeroContentData | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<HeroContentData>({
    defaultValues: heroContent
  })

  const contentType = watch('content_type')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxSize: 50 * 1024 * 1024,
    onDrop: handleFileDrop,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(rejection => {
        toast.error(`File ${rejection.file.name} was rejected: ${rejection.errors[0]?.message}`)
      })
    }
  })

  useEffect(() => {
    loadHeroContent()
    loadUploadedFiles()
  }, [])

  const loadHeroContent = async () => {
    try {
      setIsLoading(true)
      const apiUrl = `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/hero-content/config`

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `${localStorage.getItem('accessToken')}`
        }
      })

      if (response.ok) {
        const result = await response.json()

        if (result.code === 200 && result.data) {
          setHeroContent(result.data)
          Object.keys(result.data).forEach(key => {
            setValue(key as keyof HeroContentData, result.data[key])
          })
          localStorage.setItem('nungu_hero_content', JSON.stringify(result.data))
          toast.success('Current hero content loaded successfully')
        }
      } else {
        const storedContent = localStorage.getItem('nungu_hero_content')
        if (storedContent) {
          const parsedContent = JSON.parse(storedContent)
          setHeroContent(parsedContent)
          Object.keys(parsedContent).forEach(key => {
            setValue(key as keyof HeroContentData, parsedContent[key])
          })
        }
      }
    } catch (error) {
      toast.error('Failed to load hero content')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUploadedFiles = async () => {
    try {
      const storedFiles = localStorage.getItem('nungu_uploaded_files')
      if (storedFiles) {
        const parsedFiles = JSON.parse(storedFiles)
        setUploadedFiles(parsedFiles)
      }
    } catch (error) {
    }
  }

  async function handleFileDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) {
      return
    }

    const newFiles: UploadedFile[] = acceptedFiles.map((file) => {
      const fileId = `${Date.now()}-${file.name}`
      const blobUrl = URL.createObjectURL(file)

      return {
        id: fileId,
        name: file.name,
        url: blobUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size,
        uploadedAt: new Date(),
        preview: blobUrl,
        file: file,
        isUploaded: false
      }
    })

    const updatedFiles = [...uploadedFiles, ...newFiles]
    setUploadedFiles(updatedFiles)
    localStorage.setItem('nungu_uploaded_files', JSON.stringify(updatedFiles))

    toast.success(`Added ${acceptedFiles.length} file(s) for preview`)
  }

  async function uploadFileToS3(file: File, fileId: string): Promise<{ url: string; name: string }> {
    const formData = new FormData()
    formData.append('heroFile', file)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText)

            if (result.code === 200 && result.data && result.data.url) {
              resolve({
                url: result.data.url,
                name: file.name
              })
            } else {
              reject(new Error(result.message || 'Upload failed - no URL returned'))
            }
          } catch (error) {
            reject(new Error('Invalid response from server'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'))
      })

      xhr.timeout = 5 * 60 * 1000
      const apiEndpoint = `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/hero-content/upload`

      xhr.open('POST', apiEndpoint)

      const token = localStorage.getItem('accessToken')
      if (token) {
        xhr.setRequestHeader('Authorization', `${token}`)
      }

      xhr.send(formData)
    })
  }

  const handleFileSelect = (file: UploadedFile, device: 'desktop' | 'mobile') => {
    setSelectedFiles(prev => ({
      ...prev,
      [device]: file
    }))

    if (file.type === 'video') {
      const fieldName = device === 'desktop' ? 'desktop_video_url' : 'mobile_video_url'
      setValue(fieldName, file.url)
      setValue('content_type', 'video')
    } else {
      const fieldName = device === 'desktop' ? 'desktop_image_url' : 'mobile_image_url'
      setValue(fieldName, file.url)
      setValue('content_type', 'image')
    }
  }

  const handleURLAdded = (url: string, type: 'video' | 'image', device: 'desktop' | 'mobile') => {
    if (type === 'video') {
      setValue(device === 'desktop' ? 'desktop_video_url' : 'mobile_video_url', url)
      setValue('content_type', 'video')
    } else {
      setValue(device === 'desktop' ? 'desktop_image_url' : 'mobile_image_url', url)
      setValue('content_type', 'image')
    }
  }

  const handleURLPreview = (urls: { desktop: string; mobile: string; type: 'video' | 'image' }) => {
    const preview: PreviewData = {
      desktop_url: urls.desktop,
      mobile_url: urls.mobile,
      desktop_content_type: urls.type,
      mobile_content_type: urls.type,
      content_type: urls.type
    }
    setPreviewData(preview)
    setPreviewOpen(true)
  }

  const onSubmit = async (data: HeroContentData) => {
    const preview: PreviewData = {
      desktop_url: data.content_type === 'video' ? data.desktop_video_url : data.desktop_image_url,
      mobile_url: data.content_type === 'video' ?
        (data.mobile_video_url || data.desktop_video_url) :
        (data.mobile_image_url || data.desktop_image_url),
      desktop_content_type: data.content_type,
      mobile_content_type: data.content_type,
      content_type: data.content_type
    }

    setPendingData(data)
    setPreviewData(preview)
    setPreviewOpen(true)
  }

  const handleConfirmSave = async () => {
    if (!pendingData) {
      return
    }

    setIsLoading(true)

    try {
      const updatedData = { ...pendingData }
      const filesToUpload: { file: File; field: keyof HeroContentData }[] = []

      const urlFields: (keyof HeroContentData)[] = [
        'desktop_video_url',
        'mobile_video_url',
        'desktop_image_url',
        'mobile_image_url'
      ]

      for (const field of urlFields) {
        const url = updatedData[field] as string

        if (url && url.startsWith('blob:')) {
          const file = uploadedFiles.find(f => f.url === url || f.preview === url)

          if (file && file.file && !file.isUploaded) {
            filesToUpload.push({ file: file.file, field })
          }
        }
      }

      if (filesToUpload.length > 0) {
        setUploadStatus(`Uploading ${filesToUpload.length} file(s) to S3...`)

        for (let i = 0; i < filesToUpload.length; i++) {
          const { file, field } = filesToUpload[i]
          setUploadStatus(`Uploading ${file.name} (${i + 1}/${filesToUpload.length})...`)

          try {
            const uploadResult = await uploadFileToS3(file, `${Date.now()}-${file.name}`)
            ;(updatedData as Record<string, any>)[field] = uploadResult.url

            const fileIndex = uploadedFiles.findIndex(f => f.file === file)

            if (fileIndex !== -1) {
              const updatedFiles = [...uploadedFiles]
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                url: uploadResult.url,
                isUploaded: true
              }
              setUploadedFiles(updatedFiles)
              localStorage.setItem('nungu_uploaded_files', JSON.stringify(updatedFiles))
            }
          } catch (error) {
            toast.error(`Failed to upload ${file.name} to S3. Please try again.`)
            setIsLoading(false)
            
return
          }
        }

        setUploadStatus('Files uploaded successfully! Saving to database...')
      } else {
        setUploadStatus('Saving to database...')
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/hero-content/config`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        const result = await response.json()

        if (result.code === 200) {
          setHeroContent(updatedData)
          localStorage.setItem('nungu_hero_content', JSON.stringify(updatedData))
          toast.success('Hero content updated successfully!')
          setPreviewOpen(false)
          setPendingData(null)
          setUploadStatus('')
        } else {
          throw new Error(result.message || 'Failed to save to database')
        }
      } else {
        throw new Error('Failed to save hero content to database')
      }
    } catch (error) {
      toast.error(`Failed to save hero content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      setUploadStatus('')
    }
  }

  const handleReset = () => {
    reset(heroContent)
    setSelectedFiles({})
    toast('Form reset to last saved state')
  }

  const handleDeleteFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId)
    setUploadedFiles(updatedFiles)
    localStorage.setItem('nungu_uploaded_files', JSON.stringify(updatedFiles))

    if (selectedFiles.desktop?.id === fileId) {
      setSelectedFiles(prev => ({ ...prev, desktop: undefined }))
    }
    if (selectedFiles.mobile?.id === fileId) {
      setSelectedFiles(prev => ({ ...prev, mobile: undefined }))
    }

    toast.success('File deleted successfully')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Enhanced Hero Content Management' />
          <Divider />
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Manage Homepage Hero Content
            </Typography>
            <Typography sx={{ mb: 4, color: 'text.secondary' }}>
              Configure the hero video or image that appears on the homepage. Preview changes before publishing.
            </Typography>

            {isLoading && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Loading hero content...
                </Typography>
              </Box>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ mb: 4 }}>
                <Controller
                  name="content_type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Content Type</InputLabel>
                      <Select {...field} label="Content Type">
                        <MenuItem value="video">Video</MenuItem>
                        <MenuItem value="image">Image</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Box>

              <URLInputSection
                onURLAdded={handleURLAdded}
                onPreview={handleURLPreview}
              />

              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Upload New Files
                </Typography>
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <Icon icon='tabler:cloud-upload' fontSize='3rem' color='primary' />
                  <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                    {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Supports: MP4, WebM, MOV (videos) - JPG, PNG, WebP (images) - Max 50MB
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    Files are stored locally for preview. Upload to <strong>images/banners/</strong> happens when you confirm.
                  </Typography>
                </Paper>
              </Box>

              {uploadedFiles.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant='h6' sx={{ mb: 2 }}>
                    Uploaded Files ({uploadedFiles.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {uploadedFiles.map((file) => (
                      <Grid item xs={12} sm={6} md={4} key={file.id}>
                        <Card sx={{ position: 'relative' }}>
                          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                            {file.type === 'video' ? (
                              <video
                                src={file.preview || file.url}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                muted
                              />
                            ) : (
                              <img
                                src={file.preview || file.url}
                                alt={file.name}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                          </Box>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant='body2' noWrap title={file.name} sx={{ flexGrow: 1 }}>
                                {file.name}
                              </Typography>
                              {file.isUploaded ? (
                                <Chip
                                  label="S3"
                                  size="small"
                                  sx={{
                                    backgroundColor: '#e8f5e8',
                                    color: '#2e7d32',
                                    fontSize: '0.7rem',
                                    height: 20
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="Local"
                                  size="small"
                                  sx={{
                                    backgroundColor: '#fff3e0',
                                    color: '#f57c00',
                                    fontSize: '0.7rem',
                                    height: 20
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant='caption' color='text.secondary'>
                              {(file.size / 1024 / 1024).toFixed(1)} MB - {file.type}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleFileSelect(file, 'desktop')}
                                sx={{
                                  fontSize: '0.75rem',
                                  borderColor: selectedFiles.desktop?.id === file.id ? '#c6a55a' : 'grey.300',
                                  color: selectedFiles.desktop?.id === file.id ? '#c6a55a' : 'text.secondary'
                                }}
                              >
                                Desktop
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleFileSelect(file, 'mobile')}
                                sx={{
                                  fontSize: '0.75rem',
                                  borderColor: selectedFiles.mobile?.id === file.id ? '#c6a55a' : 'grey.300',
                                  color: selectedFiles.mobile?.id === file.id ? '#c6a55a' : 'text.secondary'
                                }}
                              >
                                Mobile
                              </Button>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteFile(file.id)}
                                sx={{ color: 'error.main', ml: 'auto' }}
                              >
                                <Icon icon='tabler:trash' fontSize='1rem' />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={!isDirty || isLoading}
                  sx={{
                    borderColor: '#666666',
                    color: '#666666',
                    '&:hover': { borderColor: '#333333', backgroundColor: '#f5f5f5' }
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Icon icon='tabler:eye' />}
                  sx={{
                    backgroundColor: '#c6a55a',
                    '&:hover': { backgroundColor: '#b8944d' }
                  }}
                >
                  {isLoading ? 'Processing...' : 'Preview & Update'}
                </Button>
              </Box>
            </form>

            <EnhancedPreviewModal
              open={previewOpen}
              onClose={() => {
                setPreviewOpen(false)
                setPendingData(null)
                setUploadStatus('')
              }}
              previewData={previewData}
              onConfirm={pendingData ? handleConfirmSave : undefined}
              showConfirmButton={!!pendingData}
              isLoading={isLoading}
              uploadStatus={uploadStatus}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default EnhancedHeroContentManagement
