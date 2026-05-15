import { useCallback, useState, useEffect } from 'react'
import { Alert, Grid, Card, Divider, Box, Button } from '@mui/material'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

// ** Custom Components
import TccDataTable from 'src/customComponents/data-table/table'
import DeleteDataModel from 'src/customComponents/delete-model'
import AdminPageHeader from 'src/components/common/AdminPageHeader'

// ** Icons
import { Icon } from '@iconify/react'

// ** Types
import { ICommonPagination } from 'src/data/interface'

// ** API
import { appErrors, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'
import { DELETE_COLLECTION, GET_ALL_COLLECTION, STATUS_COLLECTION } from 'src/services/AdminServices'

const CollectionsList = () => {
  const router = useRouter()
  const CACHE_KEY = 'nungu-admin:collections-list-cache'

  // ** States
  const [collections, setCollections] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [pagination, setPagination] = useState(createPagination())
  const [isLoading, setIsLoading] = useState(false)
  const [usingCache, setUsingCache] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const handleSortChanges = () => null

  // ** Hooks
  const toggleModel = () => setShowModel(!showModel)

  /////////////////////// GET API ///////////////////////
  const getAllApi = useCallback(async (mbPagination: ICommonPagination) => {
    try {
      setIsLoading(true)
      const data = await GET_ALL_COLLECTION(mbPagination)
      if (data.code === 200 || data.code === '200') {
        const nextCollections = Array.isArray(data.data.result) ? data.data.result : []
        const nextPagination = data.data.pagination || mbPagination
        setPagination(nextPagination)
        setCollections(nextCollections)
        setFilteredData(nextCollections)
        setUsingCache(false)

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            collections: nextCollections,
            pagination: nextPagination
          }))
        }
      } else {
        return toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setIsLoading(false)
    }
  }, [CACHE_KEY])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = window.sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (Array.isArray(parsed.collections)) {
            setCollections(parsed.collections)
            setFilteredData(parsed.collections)
            setPagination(parsed.pagination || createPagination())
            setUsingCache(true)
          }
        } catch (error) {
          window.sessionStorage.removeItem(CACHE_KEY)
        }
      }
    }

    getAllApi(createPagination())
  }, [CACHE_KEY, getAllApi])

  const handleChangePerPageRows = (perPageRows: number) => {
    getAllApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleOnPageChange = (page: number) => {
    getAllApi({ ...pagination, current_page: page + 1 })
  }

  /////////////////////// DELETE API ///////////////////////
  const deleteApi = async () => {
    try {
      const data = await DELETE_COLLECTION({ id: selectedId })
      if (data.code === 200 || data.code === '200') {
        toast.success(data.message)
        getAllApi(pagination)
        toggleModel()
      } else {
        return toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  /////////////////////// STATUS API ///////////////////////
  const statusApi = async (checked: boolean, row: any) => {
    try {
      const data = await STATUS_COLLECTION({ id: row.id, is_active: checked ? '1' : '0' })
      if (data.code === 200 || data.code === '200') {
        toast.success(data.message)
        getAllApi(pagination)
      } else {
        return toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  /////////////////////// SEARCH ///////////////////////
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchFilter) {
        const filtered = collections.filter((collection: any) =>
          collection.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          collection.slug.toLowerCase().includes(searchFilter.toLowerCase())
        )
        setFilteredData(filtered)
      } else {
        setFilteredData(collections)
      }
    }, SEARCH_DELAY_TIME)

    return () => clearTimeout(timer)
  }, [searchFilter, collections])

  /////////////////////// COLUMNS ///////////////////////
  const columns = [
    {
      flex: 1,
      headerName: 'Collection Image',
      field: 'image',
      avatars: 'Collection Image',
      value: 'image.image_path'
    },
    {
      flex: 2,
      headerName: 'Collection Name',
      field: 'name',
      text: 'text',
      value: 'name'
    },
    {
      flex: 1,
      headerName: 'Slug',
      field: 'slug',
      text: 'text',
      value: 'slug'
    },
    {
      flex: 1,
      headerName: 'Featured',
      field: 'is_featured',
      chips: 'chips',
      value: 'is_featured'
    },
    {
      flex: 1,
      headerName: 'Sort Order',
      field: 'sort_order',
      text: 'text',
      value: 'sort_order'
    },
    {
      flex: 1,
      headerName: 'Status',
      field: 'is_active',
      chips: 'chips',
      value: 'is_active'
    },
    {
      flex: 2,
      headerName: 'Actions',
      field: 'action',
      view: 'view',
      viewTitle: 'Assign / Review Products',
      viewOnClick: (row: any) => router.push(`/collections/collection-products/${row.id}`),
      edit: 'edit',
      editTitle: 'Edit Collection Details',
      editOnClick: (row: any) => router.push(`/collections/edit-collection/${row.id}`),
      deleted: 'deleted',
      deleteTitle: 'Delete Collection',
      deletedOnClick: (row: any) => {
        setSelectedId(row.id)
        toggleModel()
      },
      switch: 'switch',
      SwitchonChange: (checked: boolean, row: any) => statusApi(checked, row)
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Divider />
          <Box sx={{ px: 6, pt: 6, pb: 4 }}>
            <AdminPageHeader
              title='Collections Management'
              subtitle='Create collections, assign products, and keep the storefront structure clean.'
              searchValue={searchFilter}
              onSearchChange={setSearchFilter}
              actions={
                <>
                  <Button
                    variant='outlined'
                    onClick={() => router.push('/collections/assign-products')}
                    startIcon={<Icon icon='tabler:link' />}
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
                    Assign Products
                  </Button>
                  <Button
                    variant='contained'
                    onClick={() => router.push('/collections/add-collection')}
                    startIcon={<Icon icon='tabler:plus' />}
                  >
                    Add Collection
                  </Button>
                </>
              }
            />
            <Alert severity='info' sx={{ mt: 3 }}>
              Use <strong>Assign Products</strong> for membership changes. In the table, the eye icon opens assigned products and the pencil edits collection details.
            </Alert>
            {(isLoading || usingCache) && (
              <Alert severity={usingCache ? 'warning' : 'info'} sx={{ mt: 2 }}>
                {usingCache ? 'Showing the last loaded collections while refreshing the latest data.' : 'Refreshing collections...'}
              </Alert>
            )}
          </Box>
          <Divider />
          <TccDataTable
            column={columns}
            rows={filteredData}
            handleSortChanges={handleSortChanges}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle="Collection"
            emptyMessage='No collections found.'
          />
        </Card>
      </Grid>

      <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={deleteApi} />
    </Grid>
  )
}

export default CollectionsList
