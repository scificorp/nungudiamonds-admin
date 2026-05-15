// ** MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import { useCallback, useEffect, useState } from 'react'
import { 
  Box, 
  Button, 
  Divider, 
  TextField, 
  Typography,
  Chip,
  Alert
} from '@mui/material'
import { toast } from 'react-hot-toast'
import { appErrors } from 'src/AppConstants'
import Router, { useRouter } from 'next/router'
import Icon from 'src/@core/components/icon'
import TccDataTable from 'src/customComponents/data-table/table'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import AdminPageHeader from 'src/components/common/AdminPageHeader'
import { 
  GET_PRODUCTS_BY_COLLECTION,
  REMOVE_PRODUCTS_FROM_COLLECTION
} from 'src/services/AdminServices'

const CollectionProducts = () => {
  const router = useRouter()
  const { id } = router.query
  
  const [collection, setCollection] = useState<any>(null)
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [searchFilter, setSearchFilter] = useState('')
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [loading, setLoading] = useState(false)

  // Get collection details and products
  const getCollectionProducts = useCallback(async (mbPagination: ICommonPagination) => {
    if (!id) return
    
    try {
      const data = await GET_PRODUCTS_BY_COLLECTION(parseInt(id as string), mbPagination)
      if (data.code === 200 || data.code === "200") {
        setCollection(data.data.collection)
        setProducts(data.data.collection.products || [])
        setPagination(data.data.pagination)
      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      getCollectionProducts(createPagination())
    }
  }, [getCollectionProducts, id])

  // Handle search
  useEffect(() => {
    if (id) {
      const delayedSearch = setTimeout(() => {
        getCollectionProducts({ ...createPagination(), per_page_rows: pagination.per_page_rows, search_text: searchFilter, current_page: 1 })
      }, 500)

      return () => clearTimeout(delayedSearch)
    }
  }, [getCollectionProducts, id, pagination.per_page_rows, searchFilter])

  const handleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((product: any) => product.id))
    }
  }

  const handleRemoveProducts = async () => {
    if (selectedProducts.length === 0) {
      return toast.error('Please select at least one product to remove')
    }

    setLoading(true)
    try {
      const payload = {
        collection_id: parseInt(id as string),
        product_ids: selectedProducts
      }
      
      const data = await REMOVE_PRODUCTS_FROM_COLLECTION(payload)
      if (data.code === 200 || data.code === "200") {
        toast.success('Products removed from collection successfully!')
        setSelectedProducts([])

        // Refresh the product list
        getCollectionProducts(pagination)
      } else {
        toast.error(data.message || 'Failed to remove products')
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePerPageRows = (perPageRows: number) => {
    getCollectionProducts({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleOnPageChange = (page: number) => {
    getCollectionProducts({ ...pagination, current_page: page + 1 })
  }

  const handleSortChanges = () => null

  const columns = [
    {
      flex: 0.1,
      value: 'select',
      headerName: (
        <input
          type="checkbox"
          checked={selectedProducts.length === products.length && products.length > 0}
          onChange={handleSelectAll}
          style={{ accentColor: '#c6a55a' }}
        />
      ),
      field: 'select',
      renderCell: (params: any) => (
        <input
          type="checkbox"
          checked={selectedProducts.includes(params.row.id)}
          onChange={() => handleProductSelection(params.row.id)}
          style={{ accentColor: '#c6a55a' }}
        />
      )
    },
    {
      flex: 0.25,
      value: 'name',
      headerName: 'Product Name',
      field: 'name'
    },
    {
      flex: 0.15,
      value: 'sku',
      headerName: 'SKU',
      field: 'sku'
    },
    {
      flex: 0.2,
      value: 'sort_description',
      headerName: 'Description',
      field: 'sort_description',
      renderCell: (params: any) => (
        <Typography variant="body2" sx={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          maxWidth: '200px'
        }}>
          {params.row.sort_description || 'No description'}
        </Typography>
      )
    },
    {
      flex: 0.1,
      value: 'is_active',
      headerName: 'Status',
      field: 'is_active',
      renderCell: (params: any) => (
        <Chip
          label={params.row.is_active === '1' ? 'Active' : 'Inactive'}
          color={params.row.is_active === '1' ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      flex: 0.1,
      value: 'is_featured',
      headerName: 'Featured',
      field: 'is_featured',
      renderCell: (params: any) => (
        <Chip
          label={params.row.is_featured === '1' ? 'Yes' : 'No'}
          color={params.row.is_featured === '1' ? 'primary' : 'default'}
          size="small"
          sx={{
            backgroundColor: params.row.is_featured === '1' ? '#c6a55a' : undefined,
            color: params.row.is_featured === '1' ? 'white' : undefined
          }}
        />
      )
    }
  ]

  if (!collection) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='body2' color='text.secondary'>
                Loading collection products...
              </Typography>
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
          <Box sx={{ px: 6, pt: 6, pb: 4 }}>
            <AdminPageHeader
              title={`Products in "${collection.name}" Collection`}
              subtitle={collection.description || 'Review products currently assigned to this collection.'}
              actions={
                <>
                  <Button variant='outlined' onClick={() => Router.push('/collections/collections-list')} startIcon={<Icon icon='material-symbols:arrow-back-rounded' />}>
                    All Collections
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/collections/assign-products')}
                    startIcon={<Icon icon='tabler:plus' />}
                    sx={{
                      borderColor: '#c6a55a',
                      color: '#c6a55a',
                      '&:hover': {
                        borderColor: '#b8944d',
                        backgroundColor: '#c6a55a',
                        color: 'white'
                      }
                    }}
                  >
                    Add More Products
                  </Button>
                </>
              }
            />
          </Box>
          <Divider />
          
          <Box sx={{ p: 4 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size='small'
                  value={searchFilter}
                  placeholder='Search products...'
                  onChange={(e: any) => setSearchFilter(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#c6a55a'
                      },
                      '&:hover fieldset': {
                        borderColor: '#c6a55a'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#c6a55a'
                      }
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleRemoveProducts}
                    disabled={loading || selectedProducts.length === 0}
                    startIcon={loading ? <Icon icon='eos-icons:loading' /> : <Icon icon='tabler:unlink' />}
                  >
                    {loading ? 'Removing...' : `Remove ${selectedProducts.length} Product${selectedProducts.length !== 1 ? 's' : ''}`}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {selectedProducts.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected for removal
              </Alert>
            )}

            {products.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No products assigned to this collection yet. 
                <Button 
                  variant="text" 
                  onClick={() => router.push('/collections/assign-products')}
                  sx={{ ml: 1, color: '#c6a55a' }}
                >
                  Assign products now
                </Button>
              </Alert>
            )}
          </Box>

          <TccDataTable
            column={columns}
            rows={products}
            handleSortChanges={handleSortChanges}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle="Product"
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default CollectionProducts
