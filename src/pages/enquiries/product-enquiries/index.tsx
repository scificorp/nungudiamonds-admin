// ** MUI Imports
import { Divider, CardHeader, Grid, Card, Drawer, Box, FormControl, TextField, Button, MenuItem, Select, SelectChangeEvent, } from '@mui/material'
import { use } from 'i18next'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import TccSelect from 'src/customComponents/Form-Elements/select'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import { ICommonPagination } from 'src/data/interface'
import { GET_ALL_PRODUCT_ENQUIRIES, UPDATE_PRODUCT_INQUIRIES } from 'src/services/AdminServices'
import { createPagination } from 'src/utils/sharedFunction'

const ProductEnquirie = () => {

  let timer: any;
  const [searchFilter, setSearchFilter] = useState()
  const [editorDrawerAction, setEditorDrawerAction] = useState(false)
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState([])
  const [message, setMessage] = useState("")
  const [action, setAction] = useState<string>('')
  const [id, setId] = useState('')

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

  const example = [
    {
      id: 0,
      name: "Appove"
    },
    {
      id: 1,
      name: "UnAppove"
    },
  ];

  const handleChange = (event: SelectChangeEvent) => {
    setAction(event.target.value as string)
  }

  /////////////////////// GET API ///////////////////////

  const getAllApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_PRODUCT_ENQUIRIES(mbPagination);
      if (data.code === 200 || data.code === "200") {
        setPagination(data.data.pagination)
        setResult(data.data.result)
      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }
  useEffect(() => {
    getAllApi(pagination);
  }, []);

  const handleChangePerPageRows = (perPageRows: number) => {
    getAllApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleOnPageChange = (page: number) => {
    getAllApi({ ...pagination, current_page: page + 1 })
  }

  const handleChangeSortBy = (orderSort: any) => {
    getAllApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }
  const searchBusinessUser = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      getAllApi({ ...pagination, current_page: 1, search_text: searchFilter });
    }, SEARCH_DELAY_TIME);
  }

  useEffect(() => {
    searchBusinessUser();
  }, [searchFilter]);

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
          <CardHeader title='Product Enquiries'></CardHeader>
          <Divider />

          <TCCTableHeader value={searchFilter}
            onChange={(e: any) => setSearchFilter(e.target.value)}

          />
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
          />
        </Card>
      </Grid>
      <Drawer
        open={editorDrawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleEditorDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <DrawerHeader
          title='Edit'
          onClick={toggleEditorDrawer}
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form>
            <TccSelect
              sx={{ mb: 4 }}
              fullWidth
              inputLabel="Action"
              label='Action'
              value={action}
              id='controlled-select'
              onChange={handleChange}
              title='name'
              Options={example}
            />
            <FormControl fullWidth sx={{ mb: 4 }}>
              <TextField
                autoFocus
                size='small'
                value={message}
                label='Meassage'
                onChange={(e: any) => setMessage(e.target.value)}
              />
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }} onClick={updateProductInquiries}>
                Submit
              </Button>
            </Box>


          </form>
        </Box>
      </Drawer>
    </Grid>
  )
}

export default ProductEnquirie
