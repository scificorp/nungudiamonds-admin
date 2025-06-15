// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Button, CardContent, Divider, Input, InputLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from 'next/link'
import TccFileUpload from 'src/customComponents/Form-Elements/file-upload/xml-file-upload'
import { BULK_UPLOAD_ADD_PRODUCT } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { appErrors } from 'src/AppConstants'
import Router from 'next/router'

const ProductBulkUploadFile = () => {

    const [file, setFile] = useState<File>()
    const [bulkErrorMeassage, setBulkErrorMeassage] = useState([])

    const URL = 'https://nungu-diamonds.s3.eu-north-1.amazonaws.com/samplecsv/SAMPLE_PRODUCT_Import.xlsx'

    const onButtonClick = () => {
        fetch(URL).then(response => {
            response.blob().then(blob => {
                const fileURL = window.URL.createObjectURL(blob);
                let alink = document.createElement('a');
                alink.href = fileURL;
                alink.download = 'SAMPLE_PRODUCT_Import.xlsx';
                alink.click();
            })
        })
    }

    /////////////////////// BULK UPLOAD API ///////////////////////

    const bulkUploadApi = async () => {
        const formData: any = new FormData()
        formData.append("product_csv", file || "")

        try {
            const data = await BULK_UPLOAD_ADD_PRODUCT(formData);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                Router.push({ pathname: "/product/all-products" })
            } else {
                return toast.error(data.data.map((t: any) => t.error_message));
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
            setBulkErrorMeassage(e.data.data)
        }

        return false;
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='File Export'></CardHeader>
                    <Divider />
                    <CardContent>
                        <Typography variant='h6'>Information:</Typography>
                        <Typography>1.</Typography>
                        <Typography>2.</Typography>
                        <Typography sx={{ mb: 4 }}>3.</Typography>
                        <form>
                            <TccFileUpload onDrop={setFile} />
                            <Box sx={{ mt: 4 }}>
                                <Link href='' onClick={onButtonClick}>Download demo file</Link>
                            </Box>
                            <Button variant='contained' sx={{ mt: 4 }} type='button' onClick={bulkUploadApi}>
                                Submit
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </Grid>
            {bulkErrorMeassage != null && bulkErrorMeassage.length > 0 ? <Grid item xs={12} sm={12}>
                <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                    <Table stickyHeader aria-label='sticky table'>
                        <TableHead>
                            <TableRow>
                                <TableCell align='center'>Product Name</TableCell>
                                <TableCell align='center'>Product SKU</TableCell>
                                <TableCell align='center'>Error Message</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bulkErrorMeassage && bulkErrorMeassage.map((t: any, index: any) =>
                                <TableRow key={"ERR_" + index}>
                                    <TableCell align='center' >
                                        {t.product_name}
                                    </TableCell>
                                    <TableCell align='center' >
                                        {t.product_sku}
                                    </TableCell>
                                    <TableCell align='center' >
                                        {t.error_message}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid> : <></>}
        </Grid>
    )
}

export default ProductBulkUploadFile
