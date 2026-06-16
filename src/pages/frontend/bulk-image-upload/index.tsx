// ** React Imports
import { useState, useCallback } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'

// ** Third Party Imports
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import axios from 'axios'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Config
import { API_ENDPOINT } from 'src/AppConfig'

interface UploadedImage {
  id: string
  name: string
  url: string
  size: number
  uploadedAt: Date
  mimetype: string
}

const BulkImageUpload = () => {
  const [files, setFiles] = useState<File[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Drag and drop configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: useCallback((acceptedFiles: File[]) => {
      setFiles(prev => [...prev, ...acceptedFiles])
      toast.success(`${acceptedFiles.length} file(s) added`)
    }, []),
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(rejection => {
        toast.error(`File ${rejection.file.name} was rejected: ${rejection.errors[0]?.message}`)
      })
    }
  })

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    setFiles([])
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload')
      
return
    }

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })

    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.post(
        `${API_ENDPOINT}bulk-image-upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total 
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0
            setUploadProgress(progress)
          }
        }
      )

      if (response.data.code === 200) {
        const { successful, failed, totalUploaded, totalFailed } = response.data.data
        
        setUploadedImages(prev => [...successful, ...prev])
        setFiles([])
        
        if (totalFailed > 0) {
          toast.error(`${totalUploaded} uploaded successfully, ${totalFailed} failed`)
        } else {
          toast.success(`Successfully uploaded ${totalUploaded} image(s) to CDN`)
        }
      } else {
        toast.error(response.data.message || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload images')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const handleCopyAllUrls = () => {
    const urls = uploadedImages.map(img => img.url).join('\n')
    navigator.clipboard.writeText(urls)
    toast.success(`Copied ${uploadedImages.length} URLs to clipboard`)
  }

  const handleRemoveUploaded = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
  }

  const handleClearUploaded = () => {
    setUploadedImages([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Box>
      <Card>
        <CardHeader 
          title='Bulk Image Upload Utility' 
          subtitle='Upload images to S3 and copy their CDN URLs into content/product fields.'
        />
        <CardContent>
          <Alert severity='info' sx={{ mb: 4 }}>
            This is a utility uploader, not a full media library. Uploaded URLs are shown during this session so staff can copy them into hero, banner, blog, or product forms.
          </Alert>
          {/* Drop Zone */}
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              borderRadius: 1,
              p: 6,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <input {...getInputProps()} />
            <Icon icon='tabler:upload' fontSize={48} />
            <Typography variant='h6' sx={{ mt: 2 }}>
              {isDragActive ? 'Drop files here' : 'Drag & drop images here, or click to select'}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Supported formats: JPG, PNG, WebP (Max 10MB per file, up to 20 files)
            </Typography>
          </Box>

          {/* Selected Files */}
          {files.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6'>
                  Selected Files ({files.length})
                </Typography>
                <Box>
                  <Button 
                    size='small' 
                    color='error' 
                    onClick={handleClearAll}
                    sx={{ mr: 2 }}
                  >
                    Clear All
                  </Button>
                  <Button 
                    variant='contained' 
                    onClick={handleUpload}
                    disabled={uploading}
                    startIcon={<Icon icon='tabler:cloud-upload' />}
                  >
                    {uploading ? 'Uploading...' : 'Upload to CDN'}
                  </Button>
                </Box>
              </Box>

              {uploading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant='determinate' value={uploadProgress} />
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}

              <List>
                {files.map((file, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={file.name}
                      secondary={formatFileSize(file.size)}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge='end' 
                        onClick={() => handleRemoveFile(index)}
                        disabled={uploading}
                      >
                        <Icon icon='tabler:x' />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card sx={{ mt: 4 }}>
          <CardHeader 
            title={`Uploaded Images (${uploadedImages.length})`}
            action={
              <Box>
                <Button 
                  size='small' 
                  onClick={handleCopyAllUrls}
                  startIcon={<Icon icon='tabler:copy' />}
                  sx={{ mr: 2 }}
                >
                  Copy All URLs
                </Button>
                <Button 
                  size='small' 
                  color='error' 
                  onClick={handleClearUploaded}
                >
                  Clear List
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Alert severity='info' sx={{ mb: 3 }}>
              Click on any URL to copy it to clipboard
            </Alert>
            
            <List>
              {uploadedImages.map((image) => (
                <ListItem key={image.id} divider>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant='subtitle2' fontWeight={600}>
                        {image.name}
                      </Typography>
                      <IconButton 
                        size='small' 
                        onClick={() => handleRemoveUploaded(image.id)}
                      >
                        <Icon icon='tabler:x' />
                      </IconButton>
                    </Box>
                    <Box 
                      onClick={() => handleCopyUrl(image.url)}
                      sx={{ 
                        p: 2, 
                        bgcolor: 'action.hover', 
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.selected'
                        }
                      }}
                    >
                      <Typography 
                        variant='body2' 
                        sx={{ 
                          fontFamily: 'monospace',
                          wordBreak: 'break-all'
                        }}
                      >
                        {image.url}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip label={formatFileSize(image.size)} size='small' />
                      <Chip label={image.mimetype} size='small' />
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default BulkImageUpload
