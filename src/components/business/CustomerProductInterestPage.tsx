import { Alert, Button, Card, CardContent, Divider, Drawer, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Router from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import AdminPageHeader from 'src/components/common/AdminPageHeader'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import TccDataTable from 'src/customComponents/data-table/table'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'

type ProductInterest = {
  id: number
  name?: string
  sku?: string
  slug?: string
  sort_description?: string
  long_description?: string
}

type ProductInterestRecord = {
  user_id?: number | string
  customer_id?: number | string
  user_name?: string
  product?: ProductInterest | null
}

type CustomerProductGroup = {
  id: string
  customer_id?: number | string
  user_id?: number | string
  user_name: string
  item_count: number
  products_summary: string
  products: ProductInterest[]
}

type Props = {
  title: string
  subtitle: string
  drawerTitle: string
  emptyMessage: string
  emptyApiMessage: string
  fetchRecords: (payload: ICommonPagination) => Promise<any>
}

const CACHE_MAX_AGE_MS = 5 * 60 * 1000

const getProductLabel = (product: ProductInterest) => product.name || product.sku || `Product ${product.id}`

const buildCustomerGroups = (records: ProductInterestRecord[]): CustomerProductGroup[] => {
  const groups = new Map<string, CustomerProductGroup>()

  records.forEach((record, index) => {
    if (!record.product?.id) {
      return
    }

    const groupKey = String(record.customer_id || record.user_id || record.user_name || `unknown-${index}`)
    const existingGroup = groups.get(groupKey)
    const customerName = record.user_name || 'Unknown customer'

    if (existingGroup) {
      existingGroup.products.push(record.product)
      existingGroup.item_count = existingGroup.products.length
      existingGroup.products_summary = existingGroup.products.map(getProductLabel).join(', ')
      
      return
    }

    groups.set(groupKey, {
      id: groupKey,
      customer_id: record.customer_id,
      user_id: record.user_id,
      user_name: customerName,
      item_count: 1,
      products_summary: getProductLabel(record.product),
      products: [record.product]
    })
  })

  return Array.from(groups.values())
}

const CustomerProductInterestPage = ({ title, subtitle, drawerTitle, emptyMessage, emptyApiMessage, fetchRecords }: Props) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMountedSearch = useRef(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState<CustomerProductGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<CustomerProductGroup | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [usingCache, setUsingCache] = useState(false)
  const cacheKey = `nungu-admin:${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  const hydrateFromCache = useCallback(() => {
    if (typeof window === 'undefined') return false

    try {
      const cachedPayload = window.sessionStorage.getItem(cacheKey)
      if (!cachedPayload) return false

      const cached = JSON.parse(cachedPayload)
      const isFresh = Date.now() - cached.createdAt < CACHE_MAX_AGE_MS
      if (!isFresh || !Array.isArray(cached.result)) return false

      setResult(cached.result)
      setPagination(cached.pagination || { ...createPagination(), search_text: '' })
      setHasLoaded(true)
      setUsingCache(true)

      return true
    } catch {
      window.sessionStorage.removeItem(cacheKey)

      return false
    }
  }, [cacheKey])

  const writeCache = useCallback((groupedRows: CustomerProductGroup[], nextPagination: ICommonPagination) => {
    if (typeof window === 'undefined') return

    try {
      window.sessionStorage.setItem(cacheKey, JSON.stringify({
        createdAt: Date.now(),
        pagination: nextPagination,
        result: groupedRows
      }))
    } catch {
      // Cache is an optimisation only; ignore storage quota/privacy errors.
    }
  }, [cacheKey])

  const getAllApi = useCallback(async (mbPagination: ICommonPagination) => {
    setLoadError('')
    try {
      const data = await fetchRecords({ ...mbPagination, no_pagination: 1 })
      if (data.code === 200 || data.code === "200") {
        const rawRows = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data?.result)
            ? data.data.result
            : []
        const groupedRows = buildCustomerGroups(rawRows)
        const nextPagination = createPagination(mbPagination)
        setResult(groupedRows)
        setPagination({
          ...nextPagination,
          search_text: mbPagination.search_text || '',
          total_items: groupedRows.length,
          total_pages: Math.max(1, Math.ceil(groupedRows.length / nextPagination.per_page_rows))
        })
        writeCache(groupedRows, {
          ...nextPagination,
          search_text: mbPagination.search_text || '',
          total_items: groupedRows.length,
          total_pages: Math.max(1, Math.ceil(groupedRows.length / nextPagination.per_page_rows))
        })
        setHasLoaded(true)
        setUsingCache(false)
      } else {
        const message = data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
        setLoadError(message)
        setHasLoaded(true)

        return toast.error(message)
      }
    } catch (e: any) {
      const message = e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
      setLoadError(message)
      setHasLoaded(true)
      toast.error(message)
    }

    return false
  }, [fetchRecords, writeCache])

  useEffect(() => {
    hydrateFromCache()
    getAllApi({ ...createPagination(), search_text: '' })
  }, [getAllApi, hydrateFromCache])

  useEffect(() => {
    if (!hasMountedSearch.current) {
      hasMountedSearch.current = true

      return
    }

    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = setTimeout(() => {
      getAllApi({
        current_page: 1,
        per_page_rows: pagination.per_page_rows,
        sort_by: pagination.sort_by,
        order_by: pagination.order_by,
        search_text: searchFilter
      })
    }, SEARCH_DELAY_TIME)

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [getAllApi, pagination.order_by, pagination.per_page_rows, pagination.sort_by, searchFilter])

  const handleChangePerPageRows = (perPageRows: number) => {
    setPagination({
      ...pagination,
      per_page_rows: perPageRows,
      current_page: 1,
      total_pages: Math.max(1, Math.ceil(result.length / perPageRows))
    })
  }

  const handleOnPageChange = (page: number) => {
    setPagination({ ...pagination, current_page: page + 1 })
  }

  const viewProduct = (productId: number) => {
    Router.push({ pathname: '/product/add-products/', query: { id: productId, action: 'view' } })
  }

  const viewCustomer = (customerId: number | string) => {
    Router.push({ pathname: '/customer/customers-details/', query: { id: customerId } })
  }

  const column = [
    {
      flex: 1,
      value: 'user_name',
      headerName: 'Customer',
      field: 'user_name',
      text: 'text'
    },
    {
      flex: 1,
      value: 'item_count',
      headerName: 'Items',
      field: 'item_count',
      text: 'text'
    },
    {
      flex: 2,
      value: 'products_summary',
      headerName: 'Products',
      field: 'products_summary',
      text: 'text'
    },
    {
      flex: 1,
      value: 'action',
      headerName: 'Action',
      field: 'action',
      view: 'view',
      viewOnClick: setSelectedGroup
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ px: 6, pt: 6, pb: 4 }}>
            <AdminPageHeader
              title={title}
              subtitle={subtitle}
              searchValue={searchFilter}
              onSearchChange={setSearchFilter}
            />
          </Box>
          <Divider />
          {loadError && (
            <Box sx={{ px: 6, pt: 4 }}>
              <Alert severity='error'>{title} could not be loaded: {loadError}</Alert>
            </Box>
          )}
          {usingCache && !loadError && (
            <Box sx={{ px: 6, pt: 4 }}>
              <Alert severity='info'>Showing recently loaded {title.toLowerCase()} while the latest records refresh.</Alert>
            </Box>
          )}
          {hasLoaded && !loadError && result.length === 0 && (
            <Box sx={{ px: 6, pt: 4 }}>
              <Alert severity='info'>{emptyApiMessage}</Alert>
            </Box>
          )}
          <TccDataTable
            column={column}
            rows={result}
            handleSortChanges={() => null}
            pageSize={parseInt(pagination.per_page_rows?.toString() || '10')}
            onChangepage={handleChangePerPageRows}
            rowCount={result.length}
            page={(pagination.current_page || 1) - 1}
            onPageChange={handleOnPageChange}
            iconTitle='Customer interest'
            emptyMessage={emptyMessage}
          />
        </Card>
      </Grid>

      <Drawer
        open={Boolean(selectedGroup)}
        anchor='right'
        variant='temporary'
        onClose={() => setSelectedGroup(null)}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 560 } } }}
      >
        <Box sx={{ p: 6 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant='h5'>{drawerTitle}</Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>
                {selectedGroup?.user_name || 'Unknown customer'}
              </Typography>
            </Box>

            {selectedGroup?.customer_id ? (
              <Button variant='contained' onClick={() => viewCustomer(selectedGroup.customer_id as number | string)}>
                Open Customer Profile
              </Button>
            ) : (
              <Alert severity='warning'>
                This API record does not include a customer profile id, so it cannot link directly to the customer profile.
              </Alert>
            )}

            <Card>
              <CardContent>
                <Typography variant='overline' sx={{ color: 'text.disabled' }}>
                  Products
                </Typography>
                <List disablePadding>
                  {(selectedGroup?.products || []).map(product => (
                    <ListItem
                      key={product.id}
                      disableGutters
                      secondaryAction={
                        <Button size='small' variant='outlined' onClick={() => viewProduct(product.id)}>
                          View Product
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={getProductLabel(product)}
                        secondary={[product.sku, product.sort_description].filter(Boolean).join(' | ')}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Drawer>
    </Grid>
  )
}

export default CustomerProductInterestPage
