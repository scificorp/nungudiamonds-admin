// ** React Imports
import { Fragment, useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { styled, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useDropzone } from 'react-dropzone'
import FileUploadWapper from '../../styles/file-upload'
import { Chip } from '@mui/material'

import { IMG_ENDPOINT } from 'src/AppConfig'
import toast from 'react-hot-toast'

interface FileProp {
    name: string
    type: string
    size: number
}

// Styled component for the upload image inside the dropzone area
const Img = styled('img')(({ theme }) => ({
    width: 48,
    height: 48,
    marginBottom: theme.spacing(8.75)
}))

const TccSingleFileUpload = (props: any) => {
    // ** State
    const [files, setFiles] = useState<File[]>([])
    const [hasExistingImage, setHasExistingImage] = useState<boolean>(false)
    const [existingImageUrl, setExistingImageUrl] = useState<string>('')
    let imagePath = `${IMG_ENDPOINT}${props.imageShow}`

    const createFile = useCallback(async (fileUrl: string) => {
        const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${IMG_ENDPOINT}${fileUrl}`
        let response: Response | null = null

        try {
            // First attempt: Standard CORS request
            response = await fetch(fullUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'image/*',
                },
            })

            if (!response.ok && response.status !== 0) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const extension = fileUrl.split('.').pop()?.toLowerCase()
            const data = await response.blob()

            // More comprehensive MIME type mapping
            const getMimeType = (ext: string) => {
                switch (ext) {
                    case 'jpeg':
                    case 'jpg':
                        return 'image/jpeg'
                    case 'png':
                        return 'image/png'
                    case 'gif':
                        return 'image/gif'
                    case 'svg':
                        return 'image/svg+xml'
                    case 'webp':
                        return 'image/webp'
                    default:
                        return 'image/jpeg'
                }
            }

            const metadata = {
                type: getMimeType(extension || 'jpg')
            }

            const segments = fileUrl.split('/')
            const imageName = segments.pop() || segments.pop() || 'image'

            const file = new File([data], imageName, metadata)
            const filesArray = [file]
            setFiles(filesArray)
            setHasExistingImage(false)
        } catch (error) {
            console.error('Error loading image file:', error)

            // Set fallback state to show existing image URL
            setHasExistingImage(true)
            setExistingImageUrl(fullUrl)
        }
    }, [])

    useEffect(() => {
        if (props.imageFile && props.imageFile != null && typeof props.imageFile === 'string' && props.imageFile.trim() !== '') {
            // File Exists and is a valid string
            createFile(props.imageFile as string)
        } else {
            // Reset states when no image file
            setHasExistingImage(false)
            setExistingImageUrl('')
        }
    }, [createFile, props.imageFile])

    // ** Hooks
    const theme = useTheme()
    const { getRootProps, getInputProps } = useDropzone({
        maxSize: 5000000,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
        },
        multiple: false,
        onDrop: (acceptedFiles: File[]) => {
            // Add safety check for acceptedFiles
            if (!acceptedFiles || acceptedFiles.length === 0) {
                return
            }

            setFiles(acceptedFiles.map((file: File) => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })))

            // Pass the full array to parent component for consistency
            if (props.onDrop) {
                props.onDrop(acceptedFiles)
            }
        },
        onDropRejected: () => {
            toast.error('You can only upload maximum size of 5 MB.', {
                duration: 2000,
            })
        }
    })



    const renderFilePreview = (file: FileProp) => {
        imagePath = ''
        if (file.type.startsWith('image')) {
            return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file as any)} />
        } else {
            return <Icon icon='tabler:file-description' />
        }
    }


    const handleRemoveFile = (file: FileProp) => {
        imagePath = ''
        const uploadedFiles = files
        const filtered = uploadedFiles.filter((i: FileProp) => i.name !== file.name)
        setFiles([...filtered])
        if (props.onDrop) { props.onDrop([...filtered]) }
    }

    const img = files.map((file: FileProp) => (
        <ListItem key={file.name}>
            <div className='file-details'>
                <div className='file-preview'>{renderFilePreview(file)}</div>
                <div>
                    <Typography className='file-name'>{file.name}</Typography>
                    <Typography className='file-size' variant='body2'>
                        {Math.round(file.size / 100) / 10 > 1000
                            ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
                            : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
                    </Typography>
                </div>
            </div>
            <IconButton onClick={() => handleRemoveFile(file)}>
                <Icon icon='tabler:x' fontSize={20} />
            </IconButton>
        </ListItem>
    ))

    const handleRemoveAllFiles = useCallback(() => {
        setFiles([])
        setHasExistingImage(false)
        setExistingImageUrl('')
        if (props.onDrop) { props.onDrop([]) }
    }, [props])

    useEffect(() => {
        if (props.onClick == '0') {
            handleRemoveAllFiles()
        }
    }, [handleRemoveAllFiles, props.onClick])

    return (
        <FileUploadWapper>
            <Fragment>
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>

                        <Icon icon='tabler:file-upload' width={60} />
                        <Typography sx={{ mb: 2.5 }}>
                            Drop files here or click to upload.
                        </Typography>
                    </Box>
                </div>
                {files.length ? (
                    <Fragment>
                        <List>{img}</List>
                        <div className='buttons'>
                            <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                                Remove
                            </Button>
                        </div>
                    </Fragment>
                ) : null}

                {/* Display existing image when fetch fails but image exists */}
                {hasExistingImage && existingImageUrl && !files.length ? (
                    <Fragment>
                        <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                            <Typography variant='body2' sx={{ mb: 1, color: 'text.secondary' }}>
                                Existing Image:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <img
                                    src={existingImageUrl}
                                    alt='Existing image'
                                    style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: 'cover',
                                        borderRadius: 4,
                                        border: '1px solid #ddd'
                                    }}
                                    onError={(e) => {
                                        // Hide image if it fails to load
                                        (e.target as HTMLImageElement).style.display = 'none'
                                    }}
                                />
                                <Box>
                                    <Typography variant='body2'>
                                        Current image will be kept unless you upload a new one
                                    </Typography>
                                    <Chip
                                        label='Existing'
                                        size='small'
                                        color='primary'
                                        variant='outlined'
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Fragment>
                ) : null}

            </Fragment>
        </FileUploadWapper>
    )
}

export default TccSingleFileUpload
