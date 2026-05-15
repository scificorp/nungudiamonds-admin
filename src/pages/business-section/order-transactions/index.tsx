// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { Alert, Divider } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import TccDataTable from 'src/customComponents/data-table/table'
import { Box } from '@mui/system'
import { ICommonPagination } from 'src/data/interface'
import { GET_ORDER_TRANSACTION } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'
import AdminPageHeader from 'src/components/common/AdminPageHeader'

const TransactionOrder = () => {

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMountedSearch = useRef(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState([])
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')

  /////////////////////// GET API ////////////////////////////

  const getAllApi = useCallback(async (mbPagination: ICommonPagination) => {
    setLoadError('')
    try {
      const data = await GET_ORDER_TRANSACTION(mbPagination);
      if (data.code === 200 || data.code === "200") {
        setPagination(data.data.pagination || mbPagination)
        setResult(Array.isArray(data.data.result) ? data.data.result : [])
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

  const handleChangeSortBy = (orderSort: any) => {
    getAllApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }

  const handleOnPageChange = (page: number) => {
    getAllApi({ ...pagination, current_page: page + 1 })
  }
  const handleSortChanges = () => null
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
          <Divider />
          <Box sx={{ px: 6, pt: 6, pb: 4 }}>
            <AdminPageHeader
              title='Order Transactions'
              subtitle='Search and review payment outcomes across customer orders.'
              searchValue={searchFilter}
              onSearchChange={setSearchFilter}
            />
          </Box>
          <Divider />
          {loadError && (
            <Box sx={{ px: 6, pt: 4 }}>
              <Alert severity='error'>
                Order transactions could not be loaded: {loadError}
              </Alert>
            </Box>
          )}
          {hasLoaded && !loadError && result.length === 0 && (
            <Box sx={{ px: 6, pt: 4 }}>
              <Alert severity='info'>
                No payment transactions were returned by the API for the current filters. This is a true empty state, not a hidden loading state.
              </Alert>
            </Box>
          )}

          <TccDataTable
            column={column}
            rows={result}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            handleSortChanges={handleSortChanges}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            emptyMessage='No payment transactions match the current filters'
          />

        </Card>
      </Grid>
    </Grid>
  )
}

export default TransactionOrder
