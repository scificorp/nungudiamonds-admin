// ** MUI Imports
import { Alert, Button, Card, Divider, Drawer, FormControl, Grid, Stack, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import Router from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import TccSelect from 'src/customComponents/Form-Elements/select'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import AdminPageHeader from 'src/components/common/AdminPageHeader'
import TccDataTable from 'src/customComponents/data-table/table'
import { ICommonPagination } from 'src/data/interface'
import { GET_ALL_PRODUCT_ENQUIRIES, UPDATE_PRODUCT_INQUIRIES } from 'src/services/AdminServices'
import { createPagination } from 'src/utils/sharedFunction'

const PRODUCT_LEAD_ACTIONS = [
  {
    id: 0,
    name: 'Needs follow-up'
  },
  {
    id: 1,
    name: 'Handled'
  }
]

const getProductLeadStatus = (value: unknown) => Number(value) === 1 ? 'Handled' : 'Needs follow-up'

const ProductEnquirie = () => {

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMountedSearch = useRef(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [editorDrawerAction, setEditorDrawerAction] = useState(false)
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState([])
  const [message, setMessage] = useState("")
  const [action, setAction] = useState<string>('')
  const [id, setId] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')

  const toggleEditorDrawer = () => setEditorDrawerAction(!editorDrawerAction)

  const viewUserDetails = (data: any) => {
    Router.push({ pathname: "/enquiries/product-enquirie-details", query: { id: data.id } })
  }

  const editOnClickHandler = (data: any) => {
    toggleEditorDrawer()
    setId(data.id)
    setAction(data.admin_action)
    setMessage(data.admin_comments)
  }

  const handleChange = (event: any) => {
    setAction(String(event.target.value))
  }

  /////////////////////// GET API ///////////////////////

  const getAllApi = useCallback(async (mbPagination: ICommonPagination) => {
    setLoadError('')
    try {
      const data = await GET_ALL_PRODUCT_ENQUIRIES(mbPagination);
      if (data.code === 200 || data.code === "200") {
        const rows = Array.isArray(data.data.result) ? data.data.result : []
        setPagination(data.data.pagination || mbPagination)
        setResult(rows.map((row: any) => ({
          ...row,
          lead_status: getProductLeadStatus(row.admin_action)
        })))
        setHasLoaded(true)
      } else {
        setLoadError(data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        setHasLoaded(true)

        return toast.error(data.message);
      }
    } catch (e: any) {
      const message = e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
      setLoadError(message)
      setHasLoaded(true)
      toast.error(message);
    }

    return false;
  }, [])

  useEffect(() => {
    getAllApi({ ...createPagination(), search_text: '' });
  }, [getAllApi]);

  const handleChangePerPageRows = (perPageRows: number) => {
    getAllApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleOnPageChange = (page: number) => {
    getAllApi({ ...pagination, current_page: page + 1 })
  }

  const handleChangeSortBy = (orderSort: any) => {
    getAllApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }
  useEffect(() => {
    if (!hasMountedSearch.current) {
      hasMountedSearch.current = true

      return
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      getAllApi({
        current_page: 1,
        per_page_rows: pagination.per_page_rows,
        sort_by: pagination.sort_by,
        order_by: pagination.order_by,
        search_text: searchFilter
      });
    }, SEARCH_DELAY_TIME);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [getAllApi, pagination.order_by, pagination.per_page_rows, pagination.sort_by, searchFilter]);

  ///////////////////////UPDATE PRODUCT-INQUIRIES-DETAIL API ///////////////////////

  const updateProductInquiries = async () => {
    const payload = {
      "id": id,
      "action": action,
      "comments": message,
    };
    try {
      const data = await UPDATE_PRODUCT_INQUIRIES(payload);
      if (data.code === 200 || data.code === "200") {
        toggleEditorDrawer()
        getAllApi(pagination);

return toast.success(data.message);

      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }
  const column = [
    {
      flex: 1,
      value: 'product_name',
      headerName: 'Product name',
      field: 'product_name',
      text: 'text'
    },
    {
      flex: 1.5,
      value: 'product_sku',
      headerName: 'product sku',
      field: 'product_sku',
      text: 'text'
    },
    {
      flex: 1,
      value: 'full_name',
      headerName: 'customer name',
      field: 'full_name',
      text: 'text'
    },
    {
      flex: 1,
      value: 'lead_status',
      headerName: 'Lead Status',
      field: 'lead_status',
      text: 'text'
    },
    {
      flex: 1,
      value: 'message',
      headerName: 'Message',
      field: 'message',
      text: 'text'
    },
    {
      flex: 1,
      value: 'action',
      headerName: 'action',
      field: 'action',
      edit: "edit",
      view: 'view',
      editOnClick: editOnClickHandler,
      viewOnClick: viewUserDetails
    },
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ px: 6, pt: 6, pb: 4 }}>
            <AdminPageHeader
              title='Product Enquiries'
              subtitle='Track product-specific sales leads and record whether each enquiry still needs follow-up.'
              searchValue={searchFilter}
              onSearchChange={setSearchFilter}
            />
          </Box>
          <Divider />
          {loadError && (
            <Box sx={{ px: 6, pt: 4 }}>
              <Alert severity='error'>
                Product enquiries could not be loaded: {loadError}
              </Alert>
            </Box>
          )}
          {hasLoaded && !loadError && result.length === 0 && (
            <Box sx={{ px: 6, pt: 4 }}>
              <Alert severity='info'>No product enquiries match the current filters.</Alert>
            </Box>
          )}
          <TccDataTable
            column={column}
            rows={result}
            handleSortChanges={handleChangeSortBy}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle={'Enquirie'}
            emptyMessage='No product enquiries match the current filters'
          />
        </Card>
      </Grid>
      <Drawer
        open={editorDrawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleEditorDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 460 } } }}
      >
        <DrawerHeader
          title='Update Lead Follow-Up'
          onClick={toggleEditorDrawer}
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <Stack spacing={4}>
            <Alert severity='info'>
              This status is saved to the existing product enquiry fields: `admin_action` and `admin_comments`.
            </Alert>
            <TccSelect
              fullWidth
              inputLabel='Lead Status'
              label='Lead Status'
              value={action}
              id='controlled-select'
              onChange={handleChange}
              title='name'
              Options={PRODUCT_LEAD_ACTIONS}
            />
            <FormControl fullWidth>
              <TextField
                autoFocus
                multiline
                minRows={4}
                value={message}
                label='Follow-up notes'
                onChange={(e: any) => setMessage(e.target.value)}
              />
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button variant='contained' sx={{ mr: 3 }} onClick={updateProductInquiries}>
                Save Follow-Up
              </Button>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Grid>
  )
}

export default ProductEnquirie
