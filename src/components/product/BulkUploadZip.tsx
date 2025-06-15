// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Button, CardContent, Divider, Typography } from '@mui/material'
import TccZipImageUpload from 'src/customComponents/Form-Elements/file-upload/zip-file-upload'
import { ZIPFILE_BULK_UPLOAD_ADD_PRODUCT } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { appErrors } from 'src/AppConstants'
import { useState } from 'react'
import Router from 'next/router'

interface BulkUploadZipProps {
  onSuccess?: () => void
}

const BulkUploadZip = ({ onSuccess }: BulkUploadZipProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const bulkUploadApi = async () => {
    if (files.length === 0) {
      return toast.error('Please select files to upload')
    }

    setIsLoading(true)
    const formData: any = new FormData()
    files.map((t: any) => {
      formData.append("product_zip", t)
    })

    try {
      const data = await ZIPFILE_BULK_UPLOAD_ADD_PRODUCT(formData);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        setFiles([])
        if (onSuccess) {
          onSuccess()
        } else {
          Router.push({ pathname: "/product/all-products" })
        }
      } else {
        toast.error(data.message);
        return toast.error(data.data.map((t: any) => t.error_message));
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    } finally {
      setIsLoading(false)
    }

    return false;
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Bulk Upload - ZIP Files'></CardHeader>
          <Divider />
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>Information:</Typography>
            <Typography sx={{ mb: 1 }}>1. Upload ZIP files containing product images</Typography>
            <Typography sx={{ mb: 1 }}>2. Ensure images are properly named and organized</Typography>
            <Typography sx={{ mb: 4 }}>3. Maximum file size limits apply</Typography>
            <form>
              <TccZipImageUpload onDrop={setFiles} />
              <Button 
                variant='contained' 
                sx={{ mt: 4 }} 
                type='button' 
                onClick={bulkUploadApi}
                disabled={isLoading || files.length === 0}
              >
                {isLoading ? 'Uploading...' : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default BulkUploadZip
