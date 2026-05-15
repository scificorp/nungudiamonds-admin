import Head from 'next/head'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Grid } from '@mui/material'
import { Icon } from '@iconify/react'
import Router from 'next/router'
import SimplifiedProductForm from 'src/components/product/SimplifiedProductForm'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import AdminPageHeader from 'src/components/common/AdminPageHeader'

const AddProductSimplified = () => {
  return (
    <AuthGuard>
      <Head>
        <title>Quick Add Product | Nungu Diamonds Admin</title>
      </Head>

      <Box sx={{ py: 3 }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <AdminPageHeader
                  title='Quick Add Product'
                  subtitle='Use this streamlined form for new products. Advanced edits, variants, and legacy paths stay in the product workspace.'
                  actions={
                    <>
                      <Button
                        variant='outlined'
                        onClick={() => Router.push('/product/product-bulk-upload/file-import/')}
                        startIcon={<Icon fontSize='1.125rem' icon='tabler:file-import' />}
                      >
                        Bulk Import
                      </Button>
                      <Button
                        variant='outlined'
                        onClick={() => Router.push('/product/add-products/')}
                        startIcon={<Icon fontSize='1.125rem' icon='tabler:tool' />}
                      >
                        Legacy Workspace
                      </Button>
                    </>
                  }
                />
              </CardContent>
            </Card>
            <SimplifiedProductForm />
          </Grid>
        </Grid>
      </Box>
    </AuthGuard>
  )
}

export default AddProductSimplified
