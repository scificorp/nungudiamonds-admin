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
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import { useState, useEffect, useRef } from 'react'
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
  file?: File // Store the actual file for later S3 upload
  isUploaded?: boolean // Track if file is uploaded to S3
}

interface PreviewData {
  desktop_url: string
  mobile_url: string
  content_type: 'video' | 'image'
}

const debugLog = (..._args: unknown[]) => {
  if (process.env.NEXT_PUBLIC_DEBUG_HERO_CONTENT === 'true') {
    // Keep verbose upload diagnostics opt-in for local troubleshooting only.
    console.info(..._args)
  }
}

const HeroContentManagement = () => {
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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [uploadErrors, setUploadErrors] = useState<{[key: string]: string}>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<{
    desktop?: UploadedFile
    mobile?: UploadedFile
  }>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingData, setPendingData] = useState<HeroContentData | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors, isDirty }
  } = useForm<HeroContentData>({
    defaultValues: heroContent
  })

  const contentType = watch('content_type')

  // Drag and drop configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
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

    // Hero content initializes once, then explicit refreshes reload after save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load hero content from API
  const loadHeroContent = async () => {
    debugLog('📥 loadHeroContent called')

    try {
      setIsLoading(true)
      const apiUrl = `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/hero-content/config`
      debugLog('🌐 Loading from API:', apiUrl)

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `${localStorage.getItem('accessToken')}`
        }
      })

      debugLog('🌐 Load response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        debugLog('📋 Loaded hero content from API:', result)

        if (result.code === 200 && result.data) {
          debugLog('✅ Setting hero content from API data')
          setHeroContent(result.data)

          // Update form with loaded data
          Object.keys(result.data).forEach(key => {
            debugLog(`📝 Setting form field ${key} to:`, result.data[key])
            setValue(key as keyof HeroContentData, result.data[key])
          })

          // Store in localStorage for offline access
          localStorage.setItem('nungu_hero_content', JSON.stringify(result.data))
          toast.success('Current hero content loaded successfully')
        }
      } else {
        debugLog('⚠️ API failed, falling back to localStorage')

        // Fallback to localStorage
        const storedContent = localStorage.getItem('nungu_hero_content')
        if (storedContent) {
          const parsedContent = JSON.parse(storedContent)
          debugLog('📋 Loaded hero content from localStorage:', parsedContent)
          setHeroContent(parsedContent)
          Object.keys(parsedContent).forEach(key => {
            setValue(key as keyof HeroContentData, parsedContent[key])
          })
          toast('Loaded hero content from local cache (API unavailable)')
        } else {
          debugLog('⚠️ No localStorage data found')
          toast('No existing hero content found')
        }
      }
    } catch (error) {
      debugLog('❌ Failed to load hero content:', error)
      toast.error('Failed to load hero content')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUploadedFiles = async () => {
    debugLog('📁 loadUploadedFiles called')

    try {
      const storedFiles = localStorage.getItem('nungu_uploaded_files')
      if (storedFiles) {
        const parsedFiles = JSON.parse(storedFiles)
        debugLog('📁 Loaded uploaded files from localStorage:', parsedFiles.map((f: UploadedFile) => ({ name: f.name, url: f.url, isUploaded: f.isUploaded })))
        setUploadedFiles(parsedFiles)
      } else {
        debugLog('📁 No uploaded files found in localStorage')
      }
    } catch (error) {
      debugLog('❌ Failed to load uploaded files:', error)
    }
  }

  // Handle file drop - just create local previews, don't upload to S3 yet
  async function handleFileDrop(acceptedFiles: File[]) {
    debugLog('🔄 handleFileDrop called with files:', acceptedFiles.map(f => f.name))

    if (acceptedFiles.length === 0) {
      debugLog('❌ No files to process')
      
return
    }

    const newFiles: UploadedFile[] = acceptedFiles.map((file) => {
      const fileId = `${Date.now()}-${file.name}`
      const blobUrl = URL.createObjectURL(file)

      debugLog(`📁 Creating file entry for ${file.name}:`, {
        id: fileId,
        name: file.name,
        blobUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size,
        isUploaded: false
      })

      return {
        id: fileId,
        name: file.name,
        url: blobUrl, // Use blob URL for preview
        type: file.type.startsWith('video/') ? 'video' : 'image',
        size: file.size,
        uploadedAt: new Date(),
        preview: blobUrl,
        file: file, // Store the actual file for later upload
        isUploaded: false // Not uploaded to S3 yet
      }
    })

    // Add to uploaded files list
    const updatedFiles = [...uploadedFiles, ...newFiles]
    debugLog('📋 Updated files list:', updatedFiles.map(f => ({ name: f.name, url: f.url, isUploaded: f.isUploaded })))
    setUploadedFiles(updatedFiles)

    // Save to localStorage for persistence
    localStorage.setItem('nungu_uploaded_files', JSON.stringify(updatedFiles))

    toast.success(`Added ${acceptedFiles.length} file(s) for preview`)
    debugLog('✅ Files added successfully for preview')
  }

  // Upload file to S3 (only called when confirming save)
  async function uploadFileToS3(file: File, fileId: string): Promise<{ url: string; name: string }> {
    debugLog(`📤 uploadFileToS3 called for ${file.name} with ID ${fileId}`)

    const formData = new FormData()
    formData.append('heroFile', file)
    debugLog('📦 FormData created with heroFile field')

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          debugLog(`📊 Upload progress for ${file.name}: ${progress}%`)
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
        }
      })

      xhr.addEventListener('load', () => {
        debugLog(`🌐 Upload completed for ${file.name}, status: ${xhr.status}`)
        debugLog('🌐 Response text:', xhr.responseText)

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText)
            debugLog('📋 Parsed response:', result)

            if (result.code === 200 && result.data && result.data.url) {
              debugLog(`✅ Upload successful for ${file.name}, URL: ${result.data.url}`)
              resolve({
                url: result.data.url,
                name: file.name
              })
            } else {
              debugLog('❌ Upload failed - invalid response structure:', result)
              reject(new Error(result.message || 'Upload failed - no URL returned'))
            }
          } catch (error) {
            debugLog('❌ Failed to parse response:', error)
            reject(new Error('Invalid response from server'))
          }
        } else {
          debugLog(`❌ Upload failed with status ${xhr.status}`)
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        debugLog(`❌ Network error during upload of ${file.name}`)
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('timeout', () => {
        debugLog(`❌ Upload timeout for ${file.name}`)
        reject(new Error('Upload timeout'))
      })

      xhr.timeout = 5 * 60 * 1000
      const apiEndpoint = `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/hero-content/upload`
      debugLog('🌐 Upload endpoint:', apiEndpoint)

      xhr.open('POST', apiEndpoint)

      const token = localStorage.getItem('accessToken')
      if (token) {
        debugLog('🔑 Adding authorization header')
        xhr.setRequestHeader('Authorization', `${token}`)
      } else {
        debugLog('⚠️ No token found for authorization')
      }

      debugLog(`🚀 Starting upload for ${file.name}`)
      xhr.send(formData)
    })
  }

  // Handle file selection for hero content
  const handleFileSelect = (file: UploadedFile, device: 'desktop' | 'mobile') => {
    debugLog(`🎯 handleFileSelect called:`, {
      fileName: file.name,
      device,
      fileUrl: file.url,
      fileType: file.type,
      isUploaded: file.isUploaded
    })

    setSelectedFiles(prev => ({
      ...prev,
      [device]: file
    }))

    // Update form values
    if (file.type === 'video') {
      const fieldName = device === 'desktop' ? 'desktop_video_url' : 'mobile_video_url'
      debugLog(`📝 Setting ${fieldName} to:`, file.url)
      setValue(fieldName, file.url)
      setValue('content_type', 'video')
    } else {
      const fieldName = device === 'desktop' ? 'desktop_image_url' : 'mobile_image_url'
      debugLog(`📝 Setting ${fieldName} to:`, file.url)
      setValue(fieldName, file.url)
      setValue('content_type', 'image')
    }

    debugLog('✅ File selection completed')
  }

  // Handle URL input
  const handleURLAdded = (url: string, type: 'video' | 'image', device: 'desktop' | 'mobile') => {
    if (type === 'video') {
      setValue(device === 'desktop' ? 'desktop_video_url' : 'mobile_video_url', url)
      setValue('content_type', 'video')
    } else {
      setValue(device === 'desktop' ? 'desktop_image_url' : 'mobile_image_url', url)
      setValue('content_type', 'image')
    }
  }

  // Handle preview from URL input
  const handleURLPreview = (urls: { desktop: string; mobile: string; type: 'video' | 'image' }) => {
    const preview: PreviewData = {
      desktop_url: urls.desktop,
      mobile_url: urls.mobile,
      content_type: urls.type
    }
    setPreviewData(preview)
    setPreviewOpen(true)
  }

  // Handle form submission - show preview first
  const onSubmit = async (data: HeroContentData) => {
    debugLog('🚀 onSubmit called with data:', data)

    const preview: PreviewData = {
      desktop_url: data.content_type === 'video' ? data.desktop_video_url : data.desktop_image_url,
      mobile_url: data.content_type === 'video' ?
        (data.mobile_video_url || data.desktop_video_url) :
        (data.mobile_image_url || data.desktop_image_url),
      content_type: data.content_type
    }

    debugLog('👀 Preview data created:', preview)
    debugLog('📋 Setting pending data for confirmation:', data)

    setPendingData(data)
    setPreviewData(preview)
    setPreviewOpen(true)

    debugLog('✅ Preview modal should now be open')
  }

  // Confirm and save changes - upload to S3 first, then save to database
  const handleConfirmSave = async () => {
    debugLog('💾 handleConfirmSave called')

    if (!pendingData) {
      debugLog('❌ No pending data to save')
      
return
    }

    debugLog('📋 Pending data to save:', pendingData)
    setIsLoading(true)

    try {
      // First, upload any blob URLs to S3
      const updatedData = { ...pendingData }
      const filesToUpload: { file: File; field: keyof HeroContentData }[] = []

      debugLog('🔍 Checking for blob URLs that need uploading...')

      // Check each URL field to see if it's a blob URL that needs uploading
      const urlFields: (keyof HeroContentData)[] = [
        'desktop_video_url',
        'mobile_video_url',
        'desktop_image_url',
        'mobile_image_url'
      ]

      for (const field of urlFields) {
        const url = updatedData[field] as string
        debugLog(`🔍 Checking field ${field}:`, url)

        if (url && url.startsWith('blob:')) {
          debugLog(`🎯 Found blob URL in ${field}:`, url)

          // Find the file associated with this blob URL
          const file = uploadedFiles.find(f => f.url === url || f.preview === url)
          debugLog(`📁 Found associated file:`, file ? { name: file.name, isUploaded: file.isUploaded } : 'NOT FOUND')

          if (file && file.file && !file.isUploaded) {
            debugLog(`➕ Adding ${file.name} to upload queue for field ${field}`)
            filesToUpload.push({ file: file.file, field })
          }
        } else if (url) {
          debugLog(`✅ Field ${field} has non-blob URL:`, url)
        } else {
          debugLog(`⚪ Field ${field} is empty`)
        }
      }

      debugLog(`📤 Files to upload: ${filesToUpload.length}`, filesToUpload.map(f => ({ name: f.file.name, field: f.field })))

      // Upload files to S3
      if (filesToUpload.length > 0) {
        debugLog(`📤 Starting S3 upload for ${filesToUpload.length} files`)
        setUploadStatus(`Uploading ${filesToUpload.length} file(s) to S3...`)

        for (let i = 0; i < filesToUpload.length; i++) {
          const { file, field } = filesToUpload[i]
          debugLog(`📤 Uploading file ${i + 1}/${filesToUpload.length}: ${file.name} for field ${field}`)
          setUploadStatus(`Uploading ${file.name} (${i + 1}/${filesToUpload.length})...`)

          try {
            const uploadResult = await uploadFileToS3(file, `${Date.now()}-${file.name}`)
            debugLog(`✅ Upload successful for ${file.name}:`, uploadResult.url)
            ;(updatedData as Record<string, any>)[field] = uploadResult.url

            // Update the file in our list to mark as uploaded
            const fileIndex = uploadedFiles.findIndex(f => f.file === file)
            debugLog(`🔄 Updating file status in list, index: ${fileIndex}`)

            if (fileIndex !== -1) {
              const updatedFiles = [...uploadedFiles]
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                url: uploadResult.url,
                isUploaded: true
              }
              debugLog(`✅ File ${file.name} marked as uploaded with URL:`, uploadResult.url)
              setUploadedFiles(updatedFiles)
              localStorage.setItem('nungu_uploaded_files', JSON.stringify(updatedFiles))
            }
          } catch (error) {
            debugLog('❌ S3 upload failed for', file.name, error)
            toast.error(`Failed to upload ${file.name} to S3. Please try again.`)
            setIsLoading(false)
            
return
          }
        }

        debugLog('✅ All files uploaded successfully')
        setUploadStatus('Files uploaded successfully! Saving to database...')
      } else {
        debugLog('⚪ No files to upload, proceeding to database save')
        setUploadStatus('Saving to database...')
      }

      debugLog('💾 Final data to save to database:', updatedData)

      // Now save to database with the S3 URLs
      debugLog('🌐 Making API call to save to database...')
      const apiUrl = `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT}/hero-content/config`
      debugLog('🌐 API URL:', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(updatedData)
      })

      debugLog('🌐 API response status:', response.status)

      if (response.ok) {
        const result = await response.json()
        debugLog('🌐 API response:', result)

        if (result.code === 200) {
          debugLog('✅ Database save successful')
          setHeroContent(updatedData)
          localStorage.setItem('nungu_hero_content', JSON.stringify(updatedData))
          toast.success('Hero content updated successfully! The new content is now live on your website.')
          setPreviewOpen(false)
          setPendingData(null)
          setUploadStatus('')

          // Reload the hero content to show the updated version
          setTimeout(() => {
            loadHeroContent()
          }, 1000)
        } else {
          throw new Error(result.message || 'Failed to save to database')
        }
      } else {
        const errorText = await response.text()
        debugLog('❌ API error response:', errorText)
        throw new Error('Failed to save hero content to database')
      }
    } catch (error) {
      debugLog('❌ Save error:', error)
      toast.error(`Failed to save hero content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
      setUploadStatus('')
    }
  }

  // Reset form
  const handleReset = () => {
    reset(heroContent)
    setSelectedFiles({})
    toast('Form reset to last saved state')
  }

  // Delete uploaded file
  const handleDeleteFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId)
    setUploadedFiles(updatedFiles)
    localStorage.setItem('nungu_uploaded_files', JSON.stringify(updatedFiles))

    // Clear selection if deleted file was selected
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

            {/* Current Hero Content Display */}
            {heroContent && (
              <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant='h6' sx={{ mb: 2, color: 'primary.main' }}>
                  Current Live Hero Content
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Desktop Content:</Typography>
                    {heroContent.content_type === 'video' && heroContent.desktop_video_url ? (
                      <Box sx={{ position: 'relative', width: '100%', height: 200, borderRadius: 1, overflow: 'hidden' }}>
                        <video
                          src={heroContent.desktop_video_url}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          controls
                          muted
                        />
                      </Box>
                    ) : heroContent.content_type === 'image' && heroContent.desktop_image_url ? (
                      <Box sx={{ position: 'relative', width: '100%', height: 200, borderRadius: 1, overflow: 'hidden' }}>
                        <img
                          src={heroContent.desktop_image_url}
                          alt="Desktop hero content"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No desktop content set</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Mobile Content:</Typography>
                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' } }}>
                      <Box
                        sx={{
                          width: 180,
                          height: 320,
                          p: 1,
                          borderRadius: '28px',
                          border: theme => `1px solid ${theme.palette.divider}`,
                          bgcolor: 'common.black',
                          boxShadow: theme => theme.shadows[4],
                          position: 'relative',
                          '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 8,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 52,
                            height: 5,
                            borderRadius: 999,
                            bgcolor: 'grey.800',
                            zIndex: 1
                          }
                        }}
                      >
                    {heroContent.content_type === 'video' && (heroContent.mobile_video_url || heroContent.desktop_video_url) ? (
                      <Box sx={{ position: 'relative', width: '100%', height: '100%', borderRadius: '22px', overflow: 'hidden' }}>
                        <video
                          src={heroContent.mobile_video_url || heroContent.desktop_video_url}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          controls
                          muted
                        />
                      </Box>
                    ) : heroContent.content_type === 'image' && (heroContent.mobile_image_url || heroContent.desktop_image_url) ? (
                      <Box sx={{ position: 'relative', width: '100%', height: '100%', borderRadius: '22px', overflow: 'hidden' }}>
                        <img
                          src={heroContent.mobile_image_url || heroContent.desktop_image_url}
                          alt="Mobile hero content"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'background.paper',
                          p: 2,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">Using desktop content for mobile</Typography>
                      </Box>
                    )}
                      </Box>
                    </Box>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1, textAlign: { xs: 'left', md: 'center' } }}>
                      Phone-frame preview approximates portrait crop; confirm final art direction on the storefront.
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Content Type: <strong>{heroContent.content_type}</strong> •
                  Status: <strong style={{ color: heroContent.is_active ? 'green' : 'red' }}>
                    {heroContent.is_active ? 'Active' : 'Inactive'}
                  </strong>
                </Typography>
              </Box>
            )}

            <form onSubmit={handleSubmit((data) => {
              debugLog('📝 Form submitted with data:', data)
              debugLog('📝 Current form values:', getValues())
              onSubmit(data)
            })}>
              {/* Content Type Selection */}
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

              {/* URL Input Section */}
              <URLInputSection
                onURLAdded={handleURLAdded}
                onPreview={handleURLPreview}
              />

              {/* File Upload Area */}
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
                    Supports: MP4, WebM, MOV (videos) • JPG, PNG, WebP (images) • Max 50MB
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    💡 Files are stored locally for preview. Upload to <strong>images/banners/</strong> happens when you confirm.
                  </Typography>
                </Paper>
              </Box>

              {/* Uploaded Files Gallery */}
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
                              {(file.size / 1024 / 1024).toFixed(1)} MB • {file.type}
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

              {/* Action Buttons */}
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

            {/* Enhanced Preview Modal */}
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

export default HeroContentManagement
