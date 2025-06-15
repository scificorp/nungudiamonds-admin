// ** React Imports
import { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react'

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
    let imagePath = `${IMG_ENDPOINT}${props.imageShow}`

    async function createFile(fileUrl: string) {
        const response = await fetch(IMG_ENDPOINT + "/" + fileUrl);
        const extension = fileUrl.split(".").pop();
        const data = await response.blob();
        const metadata = {
            type: (extension == "jpeg" ? "image/jpeg" : (extension == "svg" ? "image/svg+xml" : (extension == "jpg" ? "image/jpg" : "image/png")))
        };
        const segments = fileUrl.split('/');
        const imageName = segments.pop() || segments.pop(); // Handle potential trailing slash

        const file = new File([data], imageName || "", metadata);
        const filesArray = [file];
        setFiles(filesArray);

        // ... do something with the file or return it
    }

    useEffect(() => {
        if (props.imageFile && props.imageFile != null) {

            //File Exists
            createFile(props.imageFile as string)
        }
    }, [props.imageFile])

    // ** Hooks
    const theme = useTheme()
    const { getRootProps, getInputProps } = useDropzone({
        maxSize: 5000000,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
        },
        multiple: false,
        onDrop: (acceptedFiles: File[]) => {

            setFiles(acceptedFiles.map((file: File) => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })))
            if (props.onDrop) { props.onDrop(acceptedFiles[0]); }

            // const newFiles = acceptedFiles.map(file => {
            //     return Object.assign(file, {
            //         preview: URL.createObjectURL(file)
            //     })
            // })
            // setFiles(newFiles)
            // console.log(newFiles);


        },
        onDropRejected: () => {
            toast.error('You can only upload maximum size of 5 MB.', {
                duration: 2000,
            })
        }
    })



    const renderFilePreview = (file: FileProp) => {
        imagePath = "";
        if (file.type.startsWith('image')) {

            return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file as any)} />
        } else {
            return <Icon icon='tabler:file-description' />
        }
    }


    const handleRemoveFile = (file: FileProp) => {
        imagePath = ""
        const uploadedFiles = files
        const filtered = uploadedFiles.filter((i: FileProp) => i.name !== file.name)
        setFiles([...filtered])
        if (props.onDrop) { props.onDrop([...filtered]); }
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

    const handleRemoveAllFiles = () => {
        setFiles([])
        if (props.onDrop) { props.onDrop(); }
    }

    useEffect(() => {
        if (props.onClick == '0') {
            handleRemoveAllFiles()
        }
    }, [props.onClick])

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
                        {/* <Typography sx={{ color: 'text.secondary' }}>
                            (This is just a demo drop zone. Selected files are not actually uploaded.)
                        </Typography> */}
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

            </Fragment>
        </FileUploadWapper>
    )
}

export default TccSingleFileUpload
