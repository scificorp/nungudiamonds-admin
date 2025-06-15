// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Divider } from '@mui/material'
import TCCTableHeader from 'src/customComponents/data-table/header'
import { useEffect, useState } from 'react'
import TccDataTable from 'src/customComponents/data-table/table'
import TccSelect from 'src/customComponents/Form-Elements/select'
import { Box } from '@mui/system'
import { ICommonOrderPagination, ICommonPagination } from 'src/data/interface'
import { GET_ORDER_TRANSACTION } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'

const initialOptions = [

  { title: 'All', id: 1 },
  { title: 'Pending', id: 2 },
  { title: "Success", id: 3 },
  { title: "Failed", id: 4 },


]

const TransactionOrder = () => {

  let timer: any
  const [searchFilter, setSearchFilter] = useState()
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState([])

  console.log("searchFilter", searchFilter);

  /////////////////////// GET API ////////////////////////////

  const getAllApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ORDER_TRANSACTION(mbPagination);
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

  const handleChangeSortBy = (orderSort: any) => {
    getAllApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }

  const handleOnPageChange = (page: number) => {
    getAllApi({ ...pagination, current_page: page + 1 })
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
      value: 'user_name',
      headerName: 'name',
      field: 'user_name',
      gustName: 'gustName',
      value2: 'gust_name'
    },
    {
      flex: 2,
      value: 'user_email',
      headerName: 'email',
      field: 'user_email',
      gustName: 'gustName',
      value2: 'gust_email'
    },
    {
      flex: 1,
      value: 'order_number',
      headerName: 'Order Number',
      field: 'order_number',
      text: 'text'
    },
    {
      flex: 1,
      value: 'payment_transaction_id',
      headerName: 'Transaction ID',
      field: 'payment_transaction_id',
      text: 'text'
    },
    {
      flex: 1,
      value: 'order_amount',
      headerName: 'Order_amount',
      field: 'order_amount',
      text: 'text'
    },
    {
      flex: 1,
      headerName: 'payment_status',
      field: 'Payment_status',
      chips: 'chips',
      value: 'payment_status'

    },

  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Order Transactions' />
          <Divider />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            <TCCTableHeader
              value={searchFilter}
              onChange={(e: any) => setSearchFilter(e.target.value)}
            />
            {/* <TccSelect
              sx={{ mr: 4 }}
              inputLabel="Select"
              defaultValue=""
              label='Select'
              Options={initialOptions}
            /> */}
          </Box>

          <TccDataTable
            column={column}
            rows={result}
            ppageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            handleSortChanges={handleChangeSortBy}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
          />

        </Card>
      </Grid>
    </Grid>
  )
}

export default TransactionOrder
