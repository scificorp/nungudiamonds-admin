import { Icon } from "@iconify/react"
import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material"
import Router from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import CustomAvatar from 'src/@core/components/mui/avatar'
import { appErrors } from "src/AppConstants"
import TccDataTable from "src/customComponents/data-table/table"
import { GET_ALL_DASHBOARD, GET_ALL_GENERAL_ENQUIRIES } from "src/services/AdminServices"
import { getPriceFormat } from "src/utils/sharedFunction"
import ErrorBoundary from "src/components/ErrorBoundary"
import AdminPageHeader from "src/components/common/AdminPageHeader"


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

type LeadPreview = {
  id?: number | string
  first_name?: string
  last_name?: string
  email?: string
  message?: string
  lead_status?: number
  lead_status_label?: string
}

const toSafeNumber = (value: unknown) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

const Home = () => {
  const [pageSize, setPageSize] = useState(10)
  const [result, setResult] = useState<Partial<OrderStatisticsData>>({})
  const [totalRevenue, setTotalRevenue] = useState<Partial<TotalRevenue>>({})
  const [totalItem, setTotalItem] = useState<Partial<TotalItem>>({})
  const [topSellingProduct, setTopSellingProduct] = useState<{ id: number, name: any, sku: any, slug: any, order_count: number, image_path: any }[]>([])
  const [leadPreview, setLeadPreview] = useState<LeadPreview[]>([])
  const [leadQueueError, setLeadQueueError] = useState('')

  const viewOnClickHandler = (data: any) => {
    Router.push({ pathname: '/product/add-products/', query: { id: data.id, action: 'view' } })
  }

  const quickActions = [
    {
      label: 'Quick Add Product',
      icon: 'tabler:plus',
      color: 'primary',
      href: '/product/simplified-add'
    },
    {
      label: 'All Products',
      icon: 'fluent-mdl2:product-variant',
      color: 'secondary',
      href: '/product/all-products'
    },
    {
      label: 'Manage Collections',
      icon: 'tabler:link',
      color: 'warning',
      href: '/collections/assign-products'
    },
    {
      label: 'Legacy Product Workspace',
      icon: 'tabler:layout-dashboard',
      color: 'info',
      href: '/product/add-products'
    }
  ] as const

  /////////////////////// GET API ///////////////////////

  const getAllApi = async () => {
    try {
      const data = await GET_ALL_DASHBOARD();

      if (String(data.code) === '200') {
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

  const getLeadQueueApi = async () => {
    setLeadQueueError('')
    try {
      const data = await GET_ALL_GENERAL_ENQUIRIES({
        current_page: 1,
        per_page_rows: 8,
        sort_by: 'id',
        order_by: 'DESC',
        search_text: ''
      })

      if (String(data.code) === '200') {
        const rows = Array.isArray(data.data?.result) ? data.data.result : []
        setLeadPreview(rows.filter((row: LeadPreview) => Number(row.lead_status ?? 0) !== 3).slice(0, 5))

        return
      }

      setLeadQueueError(data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } catch (e: any) {
      setLeadQueueError(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  useEffect(() => {
    getAllApi();
    getLeadQueueApi();
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
    <ErrorBoundary>
      <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <Box sx={{ px: 6, pt: 6, pb: 2 }}>
              <AdminPageHeader
                title='Operations Dashboard'
                subtitle='Review live order status, revenue totals, and jump into the catalog workspaces used most often.'
                actions={
                  <>
                    <Button variant='outlined' onClick={() => Router.push('/orders/orders-list')}>
                      Product Orders
                    </Button>
                    <Button variant='contained' onClick={() => Router.push('/product/simplified-add')}>
                      Quick Add Product
                    </Button>
                  </>
                }
              />
            </Box>

            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Icon icon='material-symbols:bar-chart' fontSize='23px' />
                <Typography variant='h6'>Order Statistics</Typography>
              </Box>
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
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Icon icon='tabler:bolt' fontSize='23px' />
                <Typography variant='h6'>Catalog Shortcuts</Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
                Jewelry inventory is mostly made-to-order, so the dashboard should push operators straight into product creation, catalog cleanup, and collection editing.
              </Typography>

              <Grid container spacing={3}>
                {quickActions.map(action => (
                  <Grid item xs={12} sm={6} md={3} key={action.href}>
                    <Button
                      fullWidth
                      variant={action.color === 'primary' ? 'contained' : 'outlined'}
                      color={action.color}
                      onClick={() => Router.push(action.href)}
                      startIcon={<Icon icon={action.icon} fontSize='18px' />}
                      sx={{ py: 1.5 }}
                    >
                      {action.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card sx={{ mt: 6 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 3,
                  mb: 4
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Icon icon='tabler:message-circle-2' fontSize='23px' />
                    <Typography variant='h6'>Lead Follow-Up Queue</Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    Recent open general enquiries that need sales follow-up.
                  </Typography>
                </Box>
                <Button variant='outlined' onClick={() => Router.push('/enquiries/general-enquiries')}>
                  Open General Enquiries
                </Button>
              </Box>

              {leadQueueError ? (
                <Typography color='error.main'>Could not load recent enquiries: {leadQueueError}</Typography>
              ) : leadPreview.length === 0 ? (
                <Typography color='text.secondary'>No recent open general enquiries found.</Typography>
              ) : (
                <Stack spacing={2}>
                  {leadPreview.map(lead => {
                    const name = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.email || 'Unknown lead'

                    return (
                      <Box
                        key={lead.id || `${name}-${lead.message}`}
                        sx={{
                          display: 'flex',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          justifyContent: 'space-between',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: 2,
                          p: 3,
                          border: theme => `1px solid ${theme.palette.divider}`,
                          borderRadius: 1
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={600}>{name}</Typography>
                          <Typography variant='body2' color='text.secondary' noWrap>
                            {lead.message || 'No message provided'}
                          </Typography>
                        </Box>
                        <Chip
                          size='small'
                          color={Number(lead.lead_status ?? 0) === 0 ? 'warning' : 'info'}
                          label={lead.lead_status_label || 'Needs follow-up'}
                        />
                      </Box>
                    )
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card sx={{ mt: 6 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Icon icon='gg:dollar' fontSize='23px' />
                <Typography variant='h6'>Revenue Statistics</Typography>
              </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
              <Box sx={{ pt: theme => `${theme.spacing(0.5)} !important` }}>
                <Grid container spacing={6}>
                  <Grid item xs={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomAvatar skin='light' color='success' sx={{ mr: 4, width: 42, height: 42 }}>
                        <Icon icon='fluent-mdl2:product-variant' />
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h6'>{toSafeNumber(result.total_order)}</Typography>
                        <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>Total Orders</Typography>

                      </Box>

                    </Box>

                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ pt: theme => `${theme.spacing(0.5)} !important` }}>
                <Grid container spacing={6}>
                  <Grid item xs={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomAvatar skin='light' color='warning' sx={{ mr: 4, width: 42, height: 42 }}>
                        <Icon icon='ph:currency-circle-dollar-fill' />
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h6'>{getPriceFormat(toSafeNumber(totalRevenue.total))}</Typography>
                        <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>Total Revenue</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ pt: theme => `${theme.spacing(0.5)} !important` }}>
                <Grid container spacing={6}>
                  <Grid item xs={6} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CustomAvatar skin='light' color='info' sx={{ mr: 4, width: 42, height: 42 }}>
                        <Icon icon='mdi:assignment-return' />
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h6'>{toSafeNumber(totalItem.item)}</Typography>
                        <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>Total Items</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            </CardContent>

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
    </ErrorBoundary>

  )
}

export default Home
