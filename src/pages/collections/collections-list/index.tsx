import { useState, useEffect } from 'react'
import { Grid, Card, CardHeader, Divider, Box, IconButton, Tooltip } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

// ** Custom Components
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import DeleteDataModel from 'src/customComponents/delete-model'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'

// ** Icons
import { Icon } from '@iconify/react'

// ** Types
import { ICommonPagination } from 'src/data/interface'

// ** API
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'
import { ADD_COLLECTION, DELETE_COLLECTION, EDIT_COLLECTION, GET_ALL_COLLECTION, STATUS_COLLECTION } from 'src/services/AdminServices'

const CollectionsList = () => {
  const router = useRouter()

  // ** States
  const [collections, setCollections] = useState([])
  const [searchFilter, setSearchFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [pagination, setPagination] = useState(createPagination())
  const [showModel, setShowModel] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  // ** Hooks
  const toggleModel = () => setShowModel(!showModel)

  /////////////////////// GET API ///////////////////////
  const getAllApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_COLLECTION(mbPagination)
      if (data.code === 200 || data.code === '200') {
        setPagination(data.data.pagination)
        setCollections(data.data.result)
        setFilteredData(data.data.result)
      } else {
        return toast.error(data.message)
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  useEffect(() => {
    getAllApi(pagination)
  }, [])

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
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Collection Name',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.image && (
            <img
              src={row.image.image_path || '/images/placeholder.png'}
              alt={row.name}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    {
      field: 'slug',
      headerName: 'Slug',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'is_featured',
      headerName: 'Featured',
      width: 100,
      renderCell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.is_featured === '1'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.is_featured === '1' ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      field: 'sort_order',
      headerName: 'Sort Order',
      width: 120,
      type: 'number'
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: ({ row }) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.is_active === '1'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {row.is_active === '1' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => router.push(`/collections/edit-collection/${row.id}`)}
            >
              <Icon icon="tabler:edit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedId(row.id)
                toggleModel()
              }}
            >
              <Icon icon="tabler:trash" />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.is_active === '1' ? 'Deactivate' : 'Activate'}>
            <IconButton
              size="small"
              onClick={() => statusApi(row.is_active === '0', row)}
            >
              <Icon icon={row.is_active === '1' ? 'tabler:eye-off' : 'tabler:eye'} />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Collections Management" />
          <Divider />
          <Box>
            <TCCTableHeader
              isButton
              value={searchFilter}
              onChange={(e: any) => setSearchFilter(e.target.value)}
              toggle={() => router.push('/collections/add-collection')}
              ButtonName="Add Collection"
            />
          </Box>
          <TccDataTable
            column={columns}
            rows={filteredData}
            handleSortChanges={() => {}}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle="Collection"
          />
        </Card>
      </Grid>

      <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={deleteApi} />
    </Grid>
  )
}

export default CollectionsList
