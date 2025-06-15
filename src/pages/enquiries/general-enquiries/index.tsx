// ** MUI Imports
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Button, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import Box from '@mui/material/Box'

import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { NextResponse } from 'next/dist/server/web/spec-extension/response'
import Router from 'next/router'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import { GET_ALL_GENERAL_ENQUIRIES } from 'src/services/AdminServices'
import { string } from 'yup'

const GeneralEnquirie = () => {


  let timer: any;
  const [searchFilter, setSearchFilter] = useState()
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [pageSize, setPageSize] = useState(10)
  const [result, setResult] = useState([])
  const [enquiriedata, setEnquirieData] = useState({ first_name: '', last_name: '', email: '', phone_number: 0, message: '' })
  const [viewDrawerAction, setViewDrawerAction] = useState(false)

  const toggleViewDrawer = () => setViewDrawerAction(!viewDrawerAction)

  const viewOnClickHandler = (data: any) => {
    toggleViewDrawer()
    setEnquirieData(data)
  }


  /////////////////////// GET API ///////////////////////

  const getAllApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_GENERAL_ENQUIRIES(mbPagination);
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

  const column = [

    {
      flex: 1,
      value: 'first_name',
      headerName: 'First Name',
      field: 'first_name',
      text: 'text'
    },
    {
      flex: 1,
      value: 'last_name',
      headerName: 'Last Name',
      field: 'last_name',
      text: 'text'
    },
    {
      flex: 2,
      value: 'email',
      headerName: 'email',
      field: 'email',
      text: 'text'
    },
    {
      flex: 1,
      value: 'phone_number',
      headerName: 'Phone Number',
      field: 'phone_number',
      text: 'text'
    },
    {
      flex: 1,
      value: 'message',
      headerName: 'Inquiries',
      field: 'message',
      text: 'text'
    },
    {
      flex: 1,
      value: 'action',
      headerName: 'action',
      field: 'action',
      view: 'view',
      viewOnClick: viewOnClickHandler

    },
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='General Enquiries'></CardHeader>
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
          />
        </Card>
      </Grid>
      <Drawer
        open={viewDrawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleViewDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <DrawerHeader
          title='View Review'
          onClick={toggleViewDrawer}
        />

        <Card>

          <Divider sx={{ my: '0 !important', mx: 6 }} />

          <CardContent sx={{ pb: 4 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
              Details
            </Typography>
            <Box sx={{ pt: 4 }}>

              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500 }}>First Name:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{enquiriedata.first_name}</Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500 }}>Last Name:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{enquiriedata.last_name}</Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500 }}>Email:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{enquiriedata.email}</Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500 }}>Phone Number:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{enquiriedata.phone_number}</Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500 }}>Enquiry:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{enquiriedata.message}</Typography>
              </Box>

            </Box>
          </CardContent>
        </Card>
      </Drawer>
    </Grid>
  )
}

export default GeneralEnquirie
