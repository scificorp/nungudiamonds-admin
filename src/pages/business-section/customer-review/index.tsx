// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Button, CardContent, Divider, Drawer, Rating, Typography } from '@mui/material'
import TCCTableHeader from 'src/customComponents/data-table/header'
import { useEffect, useState } from 'react'
import TccDataTable from 'src/customComponents/data-table/table'
import TccSelect from 'src/customComponents/Form-Elements/select'
import { Box } from '@mui/system'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { ThemeColor } from 'src/@core/layouts/types'
import { Icon } from '@iconify/react'
import { ICommonPagination } from 'src/data/interface'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import { GET_ALL_CUSTOMER_REVIEW, STATUS_CUSTOMER_REVIEW } from 'src/services/AdminServices'
import { createPagination } from 'src/utils/sharedFunction'

const initialOptions = [

  { title: 'none', id: 1 },
  { title: 'active', id: 2 },
  { title: "unactive", id: 3 },

]

const CustomerReview = () => {

  let timer: any;
  const [searchFilter, setSearchFilter] = useState()
  const [pageSize, setPageSize] = useState(10)
  const [drawerAction, setDrawerAction] = useState(false)
  const [viewDrawerAction, setViewDrawerAction] = useState(false)
  const [customersName, setCustomersName] = useState()
  const [customersEmail, setCustomersEmail] = useState()
  const [userRating, setUserRating] = useState<number | null>(0)
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState('')
  const [reviewData, setReviewData] = useState({ reviewer_name: '', product_name: '', product_sku: '', comment: '', rating: null, product_images: [{ image_path: "" }] })

  const toggleAddCustomersDrawer = () => setDrawerAction(!drawerAction)

  const toggleViewDrawer = () => setViewDrawerAction(!viewDrawerAction)

  const viewOnClickHandler = (data: any) => {
    toggleViewDrawer()
    setReviewData(data)
  }

  /////////////////////// GET API ///////////////////////

  const getAllApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_CUSTOMER_REVIEW(mbPagination);
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

  //////////////////// STATUS API ///////////////////////

  const statusApi = async (checked: boolean, row: any) => {
    const payload = {
      "id": row.id,
      "is_approved": checked ? '1' : '0',
    };
    try {
      const data = await STATUS_CUSTOMER_REVIEW(payload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        getAllApi(pagination)

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
      flex: 1.5,
      value: 'reviewer_name',
      headerName: 'reviewer name',
      field: 'reviewer_name',
      text: 'text'
    },

    {
      flex: 1,
      value: 'product_name',
      headerName: 'product Name',
      field: 'product_name',
      text: 'text'
    },
    {
      flex: 1,
      value: 'product_sku',
      headerName: 'product SKU',
      field: 'product_sku',
      text: 'text'
    },
    {
      flex: 1.5,
      value: 'comment',
      headerName: 'Review title',
      field: 'comment',
      text: 'text'
    },
    {
      flex: 2,
      value: 'rating',
      headerName: 'Rating',
      field: 'Rating',
      rating: 'rating'
    },
    {
      flex: 1,
      headerName: 'Status',
      field: '',
      chips: 'chips',
      value: 'is_approved'

    },
    {
      flex: 1,
      headerName: 'status',
      field: 'is_approved',
      switch: 'switch',
      value: 'is_approved',
      SwitchonChange: statusApi
    },
    {
      flex: 1,
      headerName: 'action',
      view: 'view',
      viewOnClick: viewOnClickHandler
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Customer Review' />
          <Divider />

          <TCCTableHeader
            onChange={(e: any) => setSearchFilter(e.target.value)}
            value={searchFilter}
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
            iconTitle='review'
          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddCustomersDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <DrawerHeader
          title='Edit Review'
          onClick={toggleAddCustomersDrawer}
        />
        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form>

            <TccInput label='Rating Title' fullWidth
              sx={{ mb: 4, mt: 4 }}
              value={customersName}
              onChange={(e: any) => setCustomersName(e.target.value)} />

            <TccInput label='Comments' fullWidth
              sx={{ mb: 4, mt: 4 }}
              value={customersEmail}
              rows={4}
              multiline
              onChange={(e: any) => setCustomersEmail(e.target.value)} />

            <Rating value={userRating} onChange={(event, newValue) => setUserRating(newValue)} precision={0.5} size="large" name='half-rating' sx={{ mb: 4 }} />

            <TccSingleFileUpload />

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }}>
                Submit
              </Button>
              <Button variant='outlined' color='secondary' onClick={toggleAddCustomersDrawer}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
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
          <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <CustomAvatar
              src={reviewData.product_images.length != 0 ? `https://dr2mfr65joexd.cloudfront.net/${reviewData.product_images[0].image_path}` : "https://tse1.mm.bing.net/th?id=OIP.swaYMWAS8cfbyMKLEiQJ2QD6D6&pid=Api&P=0"}
              variant='rounded'
              alt='review image'
              sx={{ width: 100, height: 100, mb: 4 }}
            />
            <Typography variant='h5' sx={{ mb: 3 }}>
              {reviewData.reviewer_name}
            </Typography>

            <Rating value={reviewData.rating} precision={0.5} name='size-large' size='large' readOnly />

          </CardContent>
          <Divider sx={{ my: '0 !important', mx: 6 }} />

          <CardContent sx={{ pb: 4 }}>
            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
              Details
            </Typography>
            <Box sx={{ pt: 4 }}>

              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500 }}>Product Name:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{reviewData.product_name}</Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500 }}>Product Sku:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{reviewData.product_sku}</Typography>
              </Box>

              <Box sx={{ display: 'flex', mb: 3 }}>
                <Typography sx={{ mr: 2, fontWeight: 500 }}>Comments:</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{reviewData.comment}</Typography>
              </Box>

            </Box>
          </CardContent>
        </Card>
      </Drawer>
    </Grid >
  )
}


export default CustomerReview
