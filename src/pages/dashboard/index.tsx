import { Icon } from "@iconify/react"
import { Box, Card, CardContent, CardHeader, Grid, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material"
import Router from "next/router"
import { MouseEvent, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import CustomAvatar from 'src/@core/components/mui/avatar'
import { appErrors } from "src/AppConstants"
import TCCTableHeader from "src/customComponents/data-table/header"
import TccDataTable from "src/customComponents/data-table/table"
import { GET_ALL_DASHBOARD } from "src/services/AdminServices"
import { getPriceFormat } from "src/utils/sharedFunction"


type OrderStatisticsData = {
  new_order: number
  Confirm_order: number
  In_process_order: number
  out_of_delivery_order: number
  delivery_order: number
  cancel_order: number
  return_order: number
  failed_order: number
  total_order: number
  total_revenue: any
}

type TotalRevenue = {
  total: number
}

type TotalItem = {
  item: any
}
const Home = () => {
  const [pageSize, setPageSize] = useState(10)
  const [active, setActive] = useState<string | null>('daily')
  const [result, setResult] = useState<Partial<OrderStatisticsData>>({})
  const [totalRevenue, setTotalRevenue] = useState<Partial<TotalRevenue>>({})
  const [totalItem, setTotalItem] = useState<Partial<TotalItem>>({})
  const [topSellingProduct, setTopSellingProduct] = useState<{ id: number, name: any, sku: any, slug: any, order_count: number, image_path: any }[]>([])

  const handleActive = (event: MouseEvent<HTMLElement>, newActive: string | null) => {
    setActive(newActive)
  }

  const viewOnClickHandler = (data: any) => {
    Router.push({ pathname: `https://nungudiamonds.vercel.app/products/${data.id}` })
  }
  /////////////////////// GET API ///////////////////////

  const getAllApi = async () => {
    try {
      const data = await GET_ALL_DASHBOARD();

      if (data.code === 200 || data.code === "200") {
        setResult(data.data)
        setTotalRevenue(data.data.total_revenue)
        setTotalItem(data.data.total_items)

        const topSellingTableData = [];
        for (const item of data.data.top_selling_product) {
          topSellingTableData.push({ id: item.product_id, name: item.name, sku: item.sku, slug: item.slug, order_count: item.order_count, image_path: item.image_path });
        }
        setTopSellingProduct(topSellingTableData)
      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }
  useEffect(() => {
    getAllApi();
  }, []);


  const column = [
    {
      value: 'image_path',
      headerName: 'image',
      field: 'image_path',
      avatars: 'avatars'
    },
    {
      flex: 1.5,
      value: 'name',
      headerName: 'Product name',
      field: 'name',
      text: 'text'
    },
    {
      flex: 1.5,
      value: 'slug',
      headerName: 'Product title',
      field: 'slug',
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
      value: 'order_count',
      headerName: 'order count',
      field: 'order_count',
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
    <>
      <h2 style={{ margin: 0, marginBottom: 8 }}>Dashboard</h2>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={<Box sx={{ display: 'flex' }}><Icon icon='material-symbols:bar-chart' fontSize='23px' /><Typography><b>Order Statistics</b></Typography></Box>}
              sx={{
                flexDirection: ['column', 'row'],
                alignItems: ['flex-start', 'center'],
                '& .MuiCardHeader-action': { mb: 0 },
                '& .MuiCardHeader-content': { mb: [2, 0] }
              }}
            // action={
            //   <ToggleButtonGroup exclusive value={active} onChange={handleActive}>
            //     <ToggleButton value='all'>All</ToggleButton>
            //     <ToggleButton value='daily'>Daily</ToggleButton>
            //     <ToggleButton value='Weekly'>Weekly</ToggleButton>
            //     <ToggleButton value='monthly'>Monthly</ToggleButton>
            //     <ToggleButton value='yearly'>Yearly</ToggleButton>
            //   </ToggleButtonGroup>
            // }
            />
            {/* <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Icon icon='material-symbols:bar-chart' fontSize='23px' />
              <Typography><b>Order statistics</b></Typography>
            </CardContent> */}

            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} md={3} lg={3}>
                  <Card>
                    <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant='h6'>{result.new_order}</Typography>
                        <Typography variant='body2'>New Order</Typography>
                      </Box>
                      <CustomAvatar skin='light' color='primary'>
                        <Icon icon='material-symbols:garden-cart' fontSize='20px' />
                      </CustomAvatar>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                  <Card>
                    <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant='h6'>{result.Confirm_order}</Typography>
                        <Typography variant='body2'>Confirmed</Typography>
                      </Box>
                      <CustomAvatar skin='light' color='success'>
                        <Icon icon='material-symbols:check-circle' fontSize='20px' />
                      </CustomAvatar>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                  <Card>
                    <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant='h6'>{result.In_process_order}</Typography>
                        <Typography variant='body2'>In Process</Typography>
                      </Box>
                      <CustomAvatar skin='light' color='warning'>
                        <Icon icon='ic:baseline-watch-later' fontSize='20px' />
                      </CustomAvatar>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                  <Card>
                    <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant='h6'>{result.out_of_delivery_order}</Typography>
                        <Typography variant='body2'>Out for Delivery</Typography>
                      </Box>
                      <CustomAvatar skin='light' color='info'>
                        <Icon icon='material-symbols:pedal-bike-sharp' fontSize='20px' />
                      </CustomAvatar>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} md={3} lg={3}>
                  <Card>

                    <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant='h6'>{result.delivery_order}</Typography>
                        <Typography variant='body2'>Delivered</Typography>
                      </Box>
                      <CustomAvatar skin='light' color='success'>
                        <Icon icon='mdi:package-variant-closed-delivered' fontSize='20px' />
                      </CustomAvatar>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                  <Card>
                    <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant='h6'>{result.cancel_order}</Typography>
                        <Typography variant='body2'>Cancelled</Typography>
                      </Box>
                      <CustomAvatar skin='light' color='error'>
                        <Icon icon='material-symbols:delete-forever-rounded' fontSize='20px' />
                      </CustomAvatar>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                  <Card>
                    <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant='h6'>{result.return_order}</Typography>
                        <Typography variant='body2'>Return</Typography>
                      </Box>
                      <CustomAvatar skin='light' color='warning'>
                        <Icon icon='material-symbols:assignment-returned' fontSize='20px' />
                      </CustomAvatar>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3} lg={3}>
                  <Card>
                    <CardContent sx={{ gap: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Typography variant='h6'>{result.failed_order}</Typography>
                        <Typography variant='body2'> Failed</Typography>
                      </Box>
                      <CustomAvatar skin='light' color='error'>
                        <Icon icon='material-symbols:sms-failed-rounded' fontSize='20px' />
                      </CustomAvatar>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card sx={{ mt: 6 }}>
            <CardHeader
              title={<Box sx={{ display: 'flex' }}><Icon icon='gg:dollar' fontSize='23px' /><Typography><b>Revenue Statistics</b></Typography></Box>}
              sx={{
                flexDirection: ['column', 'row'],
                alignItems: ['flex-start', 'center'],
                '& .MuiCardHeader-action': { mb: 0 },
                '& .MuiCardHeader-content': { mb: [2, 0] }
              }}
            // action={
            //   <ToggleButtonGroup exclusive value={active} onChange={handleActive}>
            //     <ToggleButton value='all'>All</ToggleButton>
            //     <ToggleButton value='daily'>Daily</ToggleButton>
            //     <ToggleButton value='Weekly'>Weekly</ToggleButton>
            //     <ToggleButton value='monthly'>Monthly</ToggleButton>
            //     <ToggleButton value='yearly'>Yearly</ToggleButton>
            //   </ToggleButtonGroup>
            // }
            />

            {/* <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Icon icon='gg:dollar' fontSize='23px' />
              <Typography><b>Revenue Statistics</b></Typography>
            </CardContent> */}

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <CardContent sx={{ pt: theme => `${theme.spacing(0.5)} !important` }}>
                <Grid container spacing={6}>
                  <Grid item xs={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomAvatar skin='light' color='success' sx={{ mr: 4, width: 42, height: 42 }}>
                        <Icon icon='fluent-mdl2:product-variant' />
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h6'>{result.total_order}</Typography>
                        <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>Total Orders</Typography>

                      </Box>

                    </Box>

                  </Grid>
                </Grid>
              </CardContent>
              <CardContent sx={{ pt: theme => `${theme.spacing(0.5)} !important` }}>
                <Grid container spacing={6}>
                  <Grid item xs={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomAvatar skin='light' color='warning' sx={{ mr: 4, width: 42, height: 42 }}>
                        <Icon icon='ph:currency-circle-dollar-fill' />
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h6'>{`${getPriceFormat(totalRevenue.total?.toFixed(2))}`}</Typography>
                        <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>Total Revenue</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              <CardContent sx={{ pt: theme => `${theme.spacing(0.5)} !important` }}>
                <Grid container spacing={6}>
                  <Grid item xs={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomAvatar skin='light' color='info' sx={{ mr: 4, width: 42, height: 42 }}>
                        <Icon icon='mdi:assignment-return' />
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h6'>{totalItem.item}</Typography>
                        <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>Total Item </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Box>

          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card sx={{ mt: 6 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Icon icon='icon-park:ad-product' fontSize='23px' />
              <Typography sx={{ ml: 2 }}><b>Top Selling Products</b></Typography>
            </CardContent>

            <TccDataTable
              column={column}
              rows={topSellingProduct}
              pageSize={pageSize}
              onChangepage={(e: any) => setPageSize(e)}
              iconTitle={'Product'}
            />

          </Card>
        </Grid>
      </Grid>
    </>

  )
}

export default Home

