import { Icon } from '@iconify/react'
import { Avatar, Box, Button, Card, CardContent, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import { ThemeColor } from 'src/@core/layouts/types'
import { getInitials } from 'src/@core/utils/get-initials'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'
import { appErrors } from 'src/AppConstants'
import { CUSTOMER_GET_BY_ID } from 'src/services/AdminServices'

type CustomerDetails = {
  id: number
  full_name?: string
  email?: string
  mobile?: string | number | null
  image_path?: string | null
  created_date?: string | null
  is_active?: string | number | boolean | null
  total_orders?: number
}

const statusColors: Record<string, ThemeColor> = {
  active: 'success',
  inactive: 'secondary',
  pending: 'warning'
}

const formatFallback = (value?: string | number | null) => {
  if (value === 0) return '0'

  return value ? String(value) : 'Not provided'
}

const formatStatus = (value: CustomerDetails['is_active']) => {
  if (value === true || value === 1 || value === '1' || value === 'active') return 'active'
  if (value === false || value === 0 || value === '0' || value === 'inactive') return 'inactive'

  return 'pending'
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Not provided'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not provided'

  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const CustomersDetails = () => {
  const router = useRouter()
  const { id } = router.query
  const [isLoading, setIsLoading] = useState(true)
  const [customerDetail, setCustomerDetail] = useState<CustomerDetails | null>(null)

  const customerId = useMemo(() => {
    const queryId = Array.isArray(id) ? id[0] : id
    const parsedId = Number(queryId)

    return Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null
  }, [id])

  useEffect(() => {
    if (!router.isReady) return

    if (!customerId) {
      setIsLoading(false)
      setCustomerDetail(null)

      return
    }

    const customerDetailsData = async () => {
      setIsLoading(true)
      try {
        const response = await CUSTOMER_GET_BY_ID(customerId)

        if (response.code === 200 || response.code === '200') {
          setCustomerDetail(response.data)
        } else {
          setCustomerDetail(null)
          toast.error(response.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
      } catch (e: any) {
        setCustomerDetail(null)
        toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
      } finally {
        setIsLoading(false)
      }
    }

    customerDetailsData()
  }, [customerId, router.isReady])

  const fullName = customerDetail?.full_name || 'Unknown customer'
  const orderCount = customerDetail?.total_orders ?? 0
  const status = formatStatus(customerDetail?.is_active)

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (!customerDetail) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={4} alignItems='flex-start'>
            <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />} onClick={() => router.back()}>
              Back
            </Button>
            <Typography variant='h5'>Customer not found</Typography>
            <Typography color='text.secondary'>The selected customer could not be loaded.</Typography>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' spacing={3}>
          <Box>
            <Typography variant='h4'>Customer Profile</Typography>
            <Typography color='text.secondary'>Review customer contact details and linked order activity.</Typography>
          </Box>
          <Button variant='outlined' startIcon={<Icon icon='tabler:arrow-left' />} onClick={() => router.back()}>
            Back
          </Button>
        </Stack>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', pt: 10 }}>
            {customerDetail.image_path ? (
              <Avatar
                src={customerDetail.image_path}
                variant='rounded'
                alt={fullName}
                sx={{ width: 112, height: 112, mb: 4 }}
              />
            ) : (
              <CustomAvatar skin='light' variant='rounded' color='primary' sx={{ width: 112, height: 112, mb: 4, fontSize: '3rem' }}>
                {getInitials(fullName)}
              </CustomAvatar>
            )}
            <Typography variant='h5' textAlign='center'>
              {fullName}
            </Typography>
            <Typography color='text.secondary' textAlign='center'>
              {formatFallback(customerDetail.email)}
            </Typography>
          </CardContent>

          <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
            <Stack direction='row' justifyContent='center' spacing={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 42, height: 42 }}>
                  <Icon fontSize='1.75rem' icon='tabler:shopping-bag' />
                </CustomAvatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{orderCount}</Typography>
                  <Typography variant='body2'>Total orders</Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>

          <Divider sx={{ mx: 6 }} />

          <CardContent>
            <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase', mb: 4 }}>
              Details
            </Typography>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography sx={{ minWidth: 110, fontWeight: 500 }}>Customer ID:</Typography>
                <Typography color='text.secondary'>{customerDetail.id}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography sx={{ minWidth: 110, fontWeight: 500 }}>Status:</Typography>
                <CustomChip
                  rounded
                  skin='light'
                  size='small'
                  label={status}
                  color={statusColors[status]}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography sx={{ minWidth: 110, fontWeight: 500 }}>Phone:</Typography>
                <Typography color='text.secondary'>{formatFallback(customerDetail.mobile)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography sx={{ minWidth: 110, fontWeight: 500 }}>Joined:</Typography>
                <Typography color='text.secondary'>{formatDate(customerDetail.created_date)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography sx={{ minWidth: 110, fontWeight: 500 }}>Orders:</Typography>
                <Typography color='text.secondary'>{orderCount}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={8}>
        <Card>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Sales Context
            </Typography>
            <Typography color='text.secondary'>
              Use this profile as the anchor point for customer activity. Wishlist, cart, enquiry, and order history links will be consolidated here during the broader admin audit.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CustomersDetails
