// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { useEffect, useRef, useState } from 'react'
import { Box, Button, Divider, TablePagination } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import EnhancedProductTable from 'src/components/product/EnhancedProductTable'
import { SEARCH_DELAY_TIME } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'
import DeleteDataModel from 'src/customComponents/delete-model'
import Router from 'next/router'
import { Icon } from '@iconify/react'
import { useProducts, useUpdateProductStatus, useUpdateProductFeature, useUpdateProductTrending, useDeleteProduct } from 'src/hooks/useProducts'
import AdminPageHeader from 'src/components/common/AdminPageHeader'
import { productHasVariants } from 'src/utils/permissionResilience'

const ProductList = () => {
  const [searchFilter, setSearchFilter] = useState('')
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [showModel, setShowModel] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [useEnhancedView, setUseEnhancedView] = useState(true)
  const [localProducts, setLocalProducts] = useState<any[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editOnClickHandler = (data: any) => {
    Router.push({ pathname: "/product/add-products/", query: { id: data.id } })
  }

  const viewOnClickHandler = (data: any) => {
    Router.push({ pathname: "/product/add-products/", query: { id: data.id, action: "view" } })
  }

  const { data: productsData, isLoading, isFetching, refetch } = useProducts(pagination, useEnhancedView)
  const updateStatusMutation = useUpdateProductStatus()
  const updateFeatureMutation = useUpdateProductFeature()
  const updateTrendingMutation = useUpdateProductTrending()
  const deleteMutation = useDeleteProduct()

  useEffect(() => {
    if (productsData?.result) {
      setLocalProducts(productsData.result)
    }
    if (productsData?.pagination) {
      setPagination(prev => ({
        ...prev,
        total_items: productsData.pagination.total_items,
        total_pages: productsData.pagination.total_pages
      }))
    }
  }, [productsData])

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, current_page: 1, search_text: searchFilter }))
    }, SEARCH_DELAY_TIME)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [searchFilter])

  useEffect(() => {
    refetch()
  }, [pagination, useEnhancedView, refetch])

  const handleChangePerPageRows = (perPageRows: number) => {
    setPagination(prev => ({ ...prev, per_page_rows: perPageRows, current_page: 1 }))
  }

  const handleOnPageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page + 1 }))
  }

  const handleChangeSortBy = (orderSort: any) => {
    setPagination(prev => ({
      ...prev,
      sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field),
      order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort)
    }))
  }

  const activeStatusDataApi = async (isChecked: boolean, row: any) => {
    updateStatusMutation.mutate({
      id_product: row.id,
      is_active: isChecked ? '1' : '0'
    })
  }

  const featureproductStatusDataApi = async (isChecked: boolean, row: any) => {
    updateFeatureMutation.mutate({
      id_product: row.id,
      is_featured: isChecked ? '1' : '0'
    })
  }

  const trendingproductStatusDataApi = async (isChecked: boolean, row: any) => {
    updateTrendingMutation.mutate({
      id_product: row.id,
      is_trending: isChecked ? '1' : '0'
    })
  }

  const deleteOnclickHandler = (data: any) => {
    setSelectedProduct(data)
    setShowModel(true)
  }

  const deleteProductApi = async () => {
    if (selectedProduct?.id) {
      deleteMutation.mutate({ id: selectedProduct.id })
      setSelectedProduct(null)
      setShowModel(false)
    }
  }

  const closeDeleteConfirmation = (show: boolean) => {
    setShowModel(show)
    if (!show) setSelectedProduct(null)
  }

  const imagesUploadOnClick = (data: any) => {
    Router.push({ pathname: "/product/image-upload", query: { id: data.id } })
  }

  const handleEditProduct = (productId: number) => {
    editOnClickHandler({ id: productId })
  }

  const handleViewProduct = (productId: number) => {
    viewOnClickHandler({ id: productId })
  }

  const handleDeleteProduct = (product: any) => {
    const productToDelete = typeof product === 'number'
      ? localProducts.find(item => item.id === product) || { id: product }
      : product

    deleteOnclickHandler(productToDelete)
  }

  const handleImageUpload = (productId: number) => {
    imagesUploadOnClick({ id: productId })
  }

  const column = [
    {
      flex: 1,
      value: 'name',
      headerName: 'name',
      field: 'name',
      text: 'text'
    },
    {
      flex: 1,
      value: 'sku',
      headerName: 'sku',
      field: 'sku',
      text: 'text'
    },
    {
      flex: 1,
      value: 'category_name',
      field: 'category',
      text: 'text'
    },
    {
      flex: 1,
      value: 'collections',
      headerName: 'Collections',
      field: 'collections',
      text: 'collections'
    },
    {
      flex: 1,
      headerName: 'Status',
      field: 'Status',
      chips: 'chips',
      value: 'is_active'
    },
    {
      flex: 1,
      value: "is_active",
      headerName: 'Status',
      field: 'is_active',
      switch: 'switch',
      SwitchonChange: activeStatusDataApi
    },
    {
      flex: 1,
      value: "is_featured",
      headerName: 'featured',
      field: 'is_featured',
      switch: 'switch',
      SwitchonChange: featureproductStatusDataApi
    },
    {
      flex: 1,
      value: "is_trending",
      headerName: 'trending',
      field: 'is_trending',
      switch: 'switch',
      SwitchonChange: trendingproductStatusDataApi
    },
    {
      flex: 1,
      value: 'action',
      headerName: 'action',
      field: 'action',
      view: 'view',
      edit: 'edit',
      deleted: 'deleted',
      deletedOnClick: deleteOnclickHandler,
      imageUpload: 'imageUpload',
      imageUploadOnClick: imagesUploadOnClick,
      editOnClick: editOnClickHandler,
      viewOnClick: viewOnClickHandler,
    },
  ]

  const isLoadingOrFetching = isLoading || isFetching

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ px: 6, pt: 6, pb: 4 }}>
            <AdminPageHeader
            title='All Products'
            subtitle='Browse and update products, variants, and publish status.'
            searchValue={searchFilter}
            onSearchChange={setSearchFilter}
            actions={
              <>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setUseEnhancedView(!useEnhancedView)
                  }}
                  startIcon={<Icon fontSize='1.125rem' icon={useEnhancedView ? 'tabler:list' : 'tabler:hierarchy'} />}
                  sx={{
                    borderColor: '#666',
                    color: '#666',
                    '&:hover': {
                      borderColor: '#333',
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  {useEnhancedView ? 'List View' : 'Grouped View'}
                </Button>
                <Button
                  variant='outlined'
                  onClick={() => Router.push('/collections/assign-products')}
                  startIcon={<Icon fontSize='1.125rem' icon='tabler:link' />}
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
                  Manage Collections
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => Router.push('/product/simplified-add')}
                  startIcon={<Icon fontSize='1.125rem' icon='tabler:plus' />}
                >
                  Quick Add Product
                </Button>
              </>
            }
            />
          </Box>
          <Divider />
          {useEnhancedView ? (
            <>
              <EnhancedProductTable
                products={localProducts}
                onEdit={handleEditProduct}
                onView={handleViewProduct}
                onDelete={handleDeleteProduct}
                onImageUpload={handleImageUpload}
                onStatusChange={activeStatusDataApi}
                onFeaturedChange={featureproductStatusDataApi}
                onTrendingChange={trendingproductStatusDataApi}
                isLoading={isLoadingOrFetching}
              />
              <TablePagination
                component="div"
                count={pagination.total_items}
                page={pagination.current_page - 1}
                onPageChange={(event, newPage) => handleOnPageChange(newPage)}
                rowsPerPage={pagination.per_page_rows}
                onRowsPerPageChange={(event) => handleChangePerPageRows(parseInt(event.target.value, 10))}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          ) : (
            <DataGrid
              autoHeight
              disableColumnFilter
              rows={localProducts}
              columns={column}
              pageSize={parseInt(pagination.per_page_rows.toString())}
              onPageSizeChange={handleChangePerPageRows}
              rowsPerPageOptions={[5, 10, 25, 50]}
              rowCount={pagination.total_items}
              onSortModelChange={handleChangeSortBy}
              page={pagination.current_page - 1}
              onPageChange={handleOnPageChange}
              paginationMode="server"
              disableSelectionOnClick
              loading={isLoadingOrFetching}
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
          )}
        </Card>
      </Grid>
      <DeleteDataModel
        showModel={showModel}
        toggle={closeDeleteConfirmation}
        onClick={deleteProductApi}
        title={productHasVariants(selectedProduct) ? 'Delete parent product and variants?' : 'Are you Sure?'}
        description={
          productHasVariants(selectedProduct)
            ? `Deleting this parent product will also delete ${selectedProduct?.variant_count || selectedProduct?.child_variants?.length || 'its'} variant${(selectedProduct?.variant_count || selectedProduct?.child_variants?.length) === 1 ? '' : 's'}. Are you sure you want to continue?`
            : 'Are you sure you would like to delete this item?'
        }
      />
    </Grid>
  )
}

export default ProductList
