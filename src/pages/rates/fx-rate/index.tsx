// ** FX Rate Management Page
// ** Manual USD to ZAR exchange rate management with history tracking

import { useState } from 'react'
import Head from 'next/head'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { Icon as Iconify } from '@iconify/react'
import { toast } from 'react-hot-toast'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import { appErrors, PAGINATION_INITIAL_VALUE } from 'src/AppConstants'
import { FX_RATE_GET, FX_RATE_UPDATE, FX_RATE_HISTORY } from 'src/services/AdminServices'
import { ICommonPagination } from 'src/data/interface'

interface FxRateHistory {
  id: number
  old_rate: number
  new_rate: number
  changed_by: string
  changed_at: string
  reason?: string
}

interface FxRateData {
  id: number
  currency_from: string
  currency_to: string
  rate: number
  is_active: number
  updated_at: string
  updated_by?: string
}

const asArray = <T,>(value: any): T[] => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.result)) return value.result
  if (Array.isArray(value?.data)) return value.data

  return []
}

const toSafeNumber = (value: unknown) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : 0
}

const FxRatePage = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fxRate, setFxRate] = useState<number | null>(null)
  const [fxRateData, setFxRateData] = useState<FxRateData | null>(null)
  const [history, setHistory] = useState<FxRateHistory[]>([])
  const [pagination, setPagination] = useState<ICommonPagination>(PAGINATION_INITIAL_VALUE)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [newRate, setNewRate] = useState<string>('')
  const [reason, setReason] = useState('')
  const ratesApiAvailable = false

  const fetchFxRate = async () => {
    setLoading(true)
    try {
      const response = await FX_RATE_GET()
      if (response.code === 200 || response.code === '200') {
        const data = response.data
        setFxRateData(data)
        const rate = toSafeNumber(data?.rate)
        setFxRate(rate)
        setNewRate(rate > 0 ? rate.toString() : '')
      } else {
        toast.error(response.message || 'Failed to fetch FX rate')
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setLoading(false)
    }
  }

  const fetchFxRateHistory = async () => {
    try {
      const response = await FX_RATE_HISTORY(pagination)
      if (response.code === 200 || response.code === '200') {
        const records = asArray<FxRateHistory>(response.data)
        setHistory(records)
        setPagination(prev => ({
          ...prev,
          total_items: response.data?.pagination?.total_items || records.length,
          total_pages: response.data?.pagination?.total_pages || Math.ceil(records.length / (pagination.per_page_rows || 10))
        }))
      }
    } catch (error) {
      console.error('Failed to fetch FX rate history:', error)
    }
  }

  const handleUpdateRate = async () => {
    if (!newRate || parseFloat(newRate) <= 0) {
      toast.error('Please enter a valid rate')
      
return
    }

    setSaving(true)
    try {
      const payload = {
        rate: parseFloat(newRate),
        reason: reason.trim() || null
      }

      const response = await FX_RATE_UPDATE(payload)
      if (response.code === 200 || response.code === '200') {
        toast.success('FX rate updated successfully')
        setFxRate(parseFloat(newRate))
        setShowConfirmDialog(false)
        setReason('')
        fetchFxRate()
        fetchFxRateHistory()
      } else {
        toast.error(response.message || 'Failed to update FX rate')
      }
    } catch (error: any) {
      toast.error(error?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) {
      return 'Unknown date'
    }
    
return date.toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateChange = (oldRate: number, newRate: number) => {
    const oldRateValue = toSafeNumber(oldRate)
    const newRateValue = toSafeNumber(newRate)
    const change = newRateValue - oldRateValue
    const percentage = oldRateValue > 0 ? ((change / oldRateValue) * 100).toFixed(2) : '0.00'
    
return {
      value: change,
      percentage,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
    }
  }

  return (
    <AuthGuard>
      <Head>
        <title>FX Rate Management | Nungu Diamonds Admin</title>
      </Head>

      <Box sx={{ py: 3 }}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Typography variant='h4' sx={{ mb: 4, color: '#c6a55a', fontFamily: 'Canela Text Trial, serif' }}>
              FX Rate Management
            </Typography>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="tabler:currency-exchange" color="#c6a55a" />
                    Current Exchange Rate
                  </Box>
                }
                subheader='USD to ZAR exchange rate'
              />
              <Divider />
              <CardContent>
                {!ratesApiAvailable && (
                  <Alert severity='warning' sx={{ mb: 3 }}>
                    FX rate management is not wired to the current API. Keep this page read-only until the backend pricing route exists.
                  </Alert>
                )}
                {loading ? (
                  <Alert severity='info'>Loading current rate...</Alert>
                ) : (
                  <>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                        1 USD = {fxRate?.toFixed(2) || '0.00'} ZAR
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                        <Typography variant='h3' sx={{ color: '#c6a55a', fontWeight: 700 }}>
                          {fxRate?.toFixed(2) || '0.00'}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          ZAR per USD
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
                      Update Exchange Rate
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={8}>
                        <TextField
                          fullWidth
                          type='number'
                          label='New Rate (ZAR per USD)'
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value)}
                          inputProps={{ step: '0.01', min: '0' }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Button
                          fullWidth
                          variant='contained'
                          onClick={() => setShowConfirmDialog(true)}
                          disabled={!ratesApiAvailable || !newRate || parseFloat(newRate) <= 0 || parseFloat(newRate) === fxRate}
                          sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
                        >
                          Update Rate
                        </Button>
                      </Grid>
                    </Grid>

                    {fxRateData?.updated_at && (
                      <Alert severity='info' sx={{ mb: 2 }}>
                        Last updated: {formatDate(fxRateData.updated_at)}
                        {fxRateData.updated_by && ` by ${fxRateData.updated_by}`}
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="tabler:history" color="#c6a55a" />
                    Rate Change History
                  </Box>
                }
                subheader='Recent rate updates'
              />
              <Divider />
              <CardContent>
                {history.length === 0 ? (
                  <Alert severity='info'>
                    No rate change history available.
                    {!ratesApiAvailable && ' The current API does not expose FX rate history yet.'}
                  </Alert>
                ) : (
                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell align='right'><strong>Old Rate</strong></TableCell>
                          <TableCell align='right'><strong>New Rate</strong></TableCell>
                          <TableCell align='center'><strong>Change</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.slice(0, 10).map((record) => {
                          const change = calculateChange(record.old_rate, record.new_rate)
                          
return (
                            <TableRow key={record.id} hover>
                              <TableCell>
                                <Typography variant='body2'>
                                  {formatDate(record.changed_at)}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  by {record.changed_by || 'System'}
                                </Typography>
                              </TableCell>
                              <TableCell align='right'>
                                <Typography variant='body2'>
                                  {toSafeNumber(record.old_rate).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align='right'>
                                <Typography variant='body2' fontWeight={600}>
                                  {toSafeNumber(record.new_rate).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align='center'>
                                <Chip
                                  size='small'
                                  label={`${change.direction === 'up' ? '+' : change.direction === 'down' ? '-' : ''}${Math.abs(parseFloat(change.percentage))}%`}
                                  color={
                                    change.direction === 'up'
                                      ? 'success'
                                      : change.direction === 'down'
                                        ? 'error'
                                        : 'default'
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="tabler:info-circle" color="#c6a55a" />
                    Important Information
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Alert severity='warning' icon={<Iconify icon="tabler:alert-triangle" />}>
                      <Typography variant='subtitle2'>Large Rate Changes</Typography>
                      <Typography variant='body2'>
                        Review larger changes carefully before saving because no approval workflow is currently enforced here.
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Alert severity='info' icon={<Iconify icon="tabler:clock" />}>
                      <Typography variant='subtitle2'>Update Frequency</Typography>
                      <Typography variant='body2'>
                        Rates should be updated daily or when significant market changes occur.
                      </Typography>
                    </Alert>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Alert severity='success' icon={<Iconify icon="tabler:check-circle" />}>
                      <Typography variant='subtitle2'>Price Calculations</Typography>
                      <Typography variant='body2'>
                        Pricing impact is not wired in the current API. Treat this page as a handover gap until backend support exists.
                      </Typography>
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="tabler:currency-exchange" color="#c6a55a" />
            Confirm Rate Update
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity='warning' sx={{ mb: 3 }}>
            You are about to update the USD to ZAR exchange rate. Confirm the downstream pricing flow before relying on this operationally.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant='body2'>Current Rate:</Typography>
                <Typography variant='h6' fontWeight={600}>{toSafeNumber(fxRate).toFixed(2)} ZAR</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant='body2'>New Rate:</Typography>
                <Typography variant='h6' fontWeight={600} color='success.main'>{parseFloat(newRate).toFixed(2)} ZAR</Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Reason for Change (Optional)'
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='e.g., Market update, Bank rate change'
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleUpdateRate}
            disabled={saving}
            sx={{ backgroundColor: '#c6a55a', '&:hover': { backgroundColor: '#b8944d' } }}
          >
            {saving ? 'Updating...' : 'Confirm Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </AuthGuard>
  )
}

export default FxRatePage
