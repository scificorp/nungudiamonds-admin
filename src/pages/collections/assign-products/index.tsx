// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  Alert
} from '@mui/material'
import { toast } from 'react-hot-toast'
import { appErrors } from 'src/AppConstants'
import Router from 'next/router'
import Icon from 'src/@core/components/icon'
import { DataGrid } from '@mui/x-data-grid'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import {
  GET_ALL_COLLECTION,
  GET_ALL_PRODUCT_LIST,
  ASSIGN_PRODUCTS_TO_COLLECTION,
} from 'src/services/AdminServices'
import AdminPageHeader from 'src/components/common/AdminPageHeader'

const AssignProductsToCollection = () => {
  const [collections, setCollections] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCollection, setSelectedCollection] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [searchFilter, setSearchFilter] = useState('')
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [loading, setLoading] = useState(false)

  // Get all collections
  const getAllCollections = useCallback(async () => {
    try {
      const data = await GET_ALL_COLLECTION({ ...createPagination(), per_page_rows: 100 })
      if (data.code === 200 || data.code === "200") {
        setCollections(data.data.result)
      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }, [])

  // Get all products
  const getAllProducts = useCallback(async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_PRODUCT_LIST(mbPagination)
      if (data.code === 200 || data.code === "200") {
        const productsWithCollections = data.data.result.map((product: any) => {
          const collections = product.product_collections?.map((pc: any) => pc.collection).filter(Boolean) || []

          return {
            ...product,
            collections_display: collections.length > 0
              ? collections.map((collection: any) => collection.name).join(', ')
              : 'No collections'
          }
        })

        setProducts(productsWithCollections)
        setPagination(data.data.pagination)
      } else {
        toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }, [])

  useEffect(() => {
    getAllCollections()
    getAllProducts({ ...createPagination(), search_text: '' })
  }, [getAllCollections, getAllProducts])

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      getAllProducts({ ...createPagination(), per_page_rows: pagination.per_page_rows, search_text: searchFilter, current_page: 1 })
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [getAllProducts, pagination.per_page_rows, searchFilter])

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

  const handleAssignProducts = async () => {
    if (!selectedCollection) {
      return toast.error('Please select a collection')
    }
    if (selectedProducts.length === 0) {
      return toast.error('Please select at least one product')
    }

    setLoading(true)
    try {
      const payload = {
        collection_id: parseInt(selectedCollection),
        product_ids: selectedProducts
      }

      const data = await ASSIGN_PRODUCTS_TO_COLLECTION(payload)
      if (data.code === 200 || data.code === "200") {
        toast.success('Products assigned to collection successfully!')
        setSelectedProducts([])

        // Refresh the product list to show updated assignments
        getAllProducts(pagination)
      } else {
        toast.error(data.message || 'Failed to assign products')
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePerPageRows = (perPageRows: number) => {
    getAllProducts({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleOnPageChange = (page: number) => {
    getAllProducts({ ...pagination, current_page: page + 1 })
  }

  const columns = [
    {
      field: 'select',
      headerName: '',
      width: 80,
      sortable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <Checkbox
          checked={selectedProducts.length === products.length && products.length > 0}
          indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length}
          onChange={handleSelectAll}
          sx={{ color: '#c6a55a', '&.Mui-checked': { color: '#c6a55a' } }}
        />
      ),
      renderCell: (params: any) => (
        <Checkbox
          checked={selectedProducts.includes(params.row.id)}
          onChange={() => handleProductSelection(params.row.id)}
          sx={{ color: '#c6a55a', '&.Mui-checked': { color: '#c6a55a' } }}
        />
      )
    },
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 0.25,
      minWidth: 200
    },
    {
      field: 'sku',
      headerName: 'SKU',
      flex: 0.15,
      minWidth: 150
    },
    {
      field: 'collections_display',
      headerName: 'Current Collections',
      flex: 0.35,
      minWidth: 250
    },
    {
      field: 'is_active',
      headerName: 'Status',
      flex: 0.1,
      minWidth: 100,
      renderCell: (params: any) => (
        <Chip
          label={params.row.is_active === '1' ? 'Active' : 'Inactive'}
          color={params.row.is_active === '1' ? 'success' : 'error'}
          size="small"
        />
      )
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Button variant='contained' sx={{ mr: 3, mb: 4, '& svg': { mr: 2 } }} onClick={() => Router.push('/collections/collections-list')}>
          <Icon icon='material-symbols:arrow-back-rounded' />
          All Collections
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <Box sx={{ px: 6, pt: 6, pb: 4 }}>
            <AdminPageHeader
              title='Assign Products to Collections'
              subtitle='Collections are optional merchandising groups. Select a collection, then choose the products that should appear in it.'
              actions={
                <Button
                  variant='outlined'
                  onClick={() => Router.push('/collections/collections-list')}
                  startIcon={<Icon icon='tabler:collection' />}
                >
                  All Collections
                </Button>
              }
            />
          </Box>
          <Divider />

          <Box sx={{ p: 6 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Select Collection</InputLabel>
                  <Select
                    value={selectedCollection}
                    label="Select Collection"
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#c6a55a'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#c6a55a'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#c6a55a'
                      }
                    }}
                  >
                    {collections.map((collection: any) => (
                      <MenuItem key={collection.id} value={collection.id}>
                        {collection.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
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

              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  onClick={handleAssignProducts}
                  disabled={loading || !selectedCollection || selectedProducts.length === 0}
                  sx={{
                    backgroundColor: '#c6a55a',
                    '&:hover': {
                      backgroundColor: '#b8944d'
                    }
                  }}
                  startIcon={loading ? <Icon icon='eos-icons:loading' /> : <Icon icon='tabler:link' />}
                >
                  {loading ? 'Assigning...' : `Assign ${selectedProducts.length} Product${selectedProducts.length !== 1 ? 's' : ''}`}
                </Button>
              </Grid>
            </Grid>

            {selectedProducts.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected for assignment
              </Alert>
            )}
          </Box>

          <DataGrid
            autoHeight
            rows={products}
            columns={columns}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onPageSizeChange={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            paginationMode="server"
            rowsPerPageOptions={[5, 10, 25, 50]}
            disableSelectionOnClick
            disableColumnFilter
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid #c6a55a'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#faf9f7'
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default AssignProductsToCollection
