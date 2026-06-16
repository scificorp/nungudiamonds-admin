// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { Alert, Badge, Divider, TextField, Typography } from '@mui/material'
import { forwardRef, useCallback, useEffect, useState } from 'react'
import TccDataTable from 'src/customComponents/data-table/table'
import { Box } from '@mui/system'
import Router from 'next/router'
import CustomChip from 'src/@core/components/mui/chip'
import { ICommonOrderPagination } from 'src/data/interface'
import { GET_ALL_ORDERS } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import { createOrderPagination } from 'src/utils/sharedFunction'
import { OrderStatus } from 'src/data/type'
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { subMonths } from 'date-fns'
import AdminPageHeader from 'src/components/common/AdminPageHeader'

interface PickerProps {
    label?: string
    end: Date | number
    start: Date | number
}

type DateType = Date | undefined

type statusCount = {
    all_order: number
    total_pendding_order: number
    total_confirm_order: number
    total_in_process_order: number
    total_out_of_delivery_order: number
    total_delivery_order: number
    total_returned_order: number
    total_cancel_order: number
    total_fail_order: number
}

const orderStatusFilters = [
    { label: 'All', value: OrderStatus.All, countKey: 'all_order' },
    { label: 'Pending', value: OrderStatus.Pending, countKey: 'total_pendding_order' },
    { label: 'Confirmed', value: OrderStatus.Confirmed, countKey: 'total_confirm_order' },
    { label: 'Processing', value: OrderStatus.Processing, countKey: 'total_in_process_order' },
    { label: 'Out for Delivery', value: OrderStatus.OutOfDelivery, countKey: 'total_out_of_delivery_order' },
    { label: 'Delivered', value: OrderStatus.Delivered, countKey: 'total_delivery_order' },
    { label: 'Returned', value: OrderStatus.Returned, countKey: 'total_returned_order' },
    { label: 'Failed', value: OrderStatus.Failed, countKey: 'total_fail_order' },
    { label: 'Canceled', value: OrderStatus.Canceled, countKey: 'total_cancel_order' }
] as const

const OrdersList = () => {
    const [startDate, setStartDate] = useState<DateType>(subMonths(new Date(), 1))
    const [endDate, setEndDate] = useState<DateType>(new Date())
    const [pagination, setPagination] = useState({ ...createOrderPagination(), order_status: 0, start_date: startDate, end_date: endDate })
    const [result, setResult] = useState([])
    const [count, setCount] = useState<Partial<statusCount>>({})
    const [orderStatus, setOrderStatus] = useState<number>()
    const [loadError, setLoadError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const viewOnClickHandler = (data: any) => {
        Router.push({ pathname: "/orders/orders-details", query: { orderNumber: data.order_number } })
    }

    /////////////////////// GET API ///////////////////////

    const getAllApi = useCallback(async (mbPagination: ICommonOrderPagination) => {
        setLoadError('')
        setIsLoading(true)
        try {
            const data = await GET_ALL_ORDERS(mbPagination);

            if (data.code === 200 || data.code === "200") {
                setPagination(data.data.pagination || mbPagination)
                setResult(Array.isArray(data.data.result) ? data.data.result : [])
                setCount(data.data.count || {})
            } else {
                const message = data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
                setLoadError(message)

                return toast.error(message);
            }
        } catch (e: any) {
            const message = e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
            setLoadError(message)
            toast.error(message);
        } finally {
            setIsLoading(false)
        }

        return false;
    }, [])
    const handleChangePerPageRows = (perPageRows: number) => {
        getAllApi({ ...pagination, per_page_rows: perPageRows, current_page: 1, order_status: orderStatus, start_date: startDate, end_date: endDate })
    }

    const handleOnPageChange = (page: number) => {
        getAllApi({ ...pagination, current_page: page + 1, order_status: orderStatus, start_date: startDate, end_date: endDate })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    useEffect(() => {
        if (startDate && endDate) {
            const timer = setTimeout(() => {
                getAllApi({
                    ...createOrderPagination(),
                    per_page_rows: pagination.per_page_rows,
                    current_page: 1,
                    order_status: orderStatus,
                    start_date: startDate,
                    end_date: endDate
                });
            }, SEARCH_DELAY_TIME);

            return () => clearTimeout(timer)
        }
    }, [endDate, getAllApi, orderStatus, pagination.per_page_rows, startDate]);

    const column = [
        {
            flex: 1,
            value: 'order_number',
            headerName: 'Order Number',
            field: 'order_number',
            text: 'text'
        },
        {
            flex: 1,
            value: 'order_date',
            headerName: 'date',
            field: 'order_date',
            date: 'date'
        },
        {
            flex: 1,
            value: 'user_name',
            headerName: 'Customer Name',
            field: 'customer Name',
            gustName: 'gustName',
            value2: 'full_name'
        },
        {
            flex: 1,
            value: 'order_total',
            headerName: 'Total',
            field: 'order_total',
            price: 'price'
        },
        {
            flex: 1,
            headerName: 'order_status',
            field: 'order_status',
            value: 'order_status',
            order_status_chip: "order_status_chip"
        },
        {
            flex: 1,
            headerName: 'Action',
            view: 'view',
            viewOnClick: viewOnClickHandler

        },
    ]
    const handleOnChange = (dates: any) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
    }

    const CustomInput = forwardRef((props: PickerProps, ref) => {
        const startDate = format(props.start, 'dd/MM/yyyy')
        const endDate = props.end !== null ? ` - ${format(props.end, 'dd/MM/yyyy')}` : null

        const value = `${startDate}${endDate !== null ? endDate : ''}`

        return <TextField
            sx={{ mb: 4 }}
            size='small'
            fullWidth
            inputRef={ref}
            label={props.label || ''} {...props}
            value={value}
        />
    })

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <Box sx={{ p: 6, pb: 4 }}>
                        <AdminPageHeader
                            title='Product Orders'
                            subtitle='Track made-to-order jewellery purchases from new order through fulfilment.'
                            actions={
                                <Typography variant='body2' color='text.secondary'>
                                    Showing orders from the last month by default.
                                </Typography>
                            }
                        />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4, px: 6, pt: 6, fontSize: 'medium' }}>
                        {orderStatusFilters.map(filter => {
                            const badgeCount = count[filter.countKey] ?? 0

                            return (
                                <Badge key={filter.value} badgeContent={badgeCount === 0 ? '0' : badgeCount} max={badgeCount} color='primary'>
                                    <CustomChip
                                        rounded
                                        label={filter.label}
                                        skin='light'
                                        color={orderStatus === filter.value ? 'primary' : 'default'}
                                        sx={{ fontSize: 'medium' }}
                                        onClick={() => setOrderStatus(filter.value)}
                                    />
                                </Badge>
                            )
                        })}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-end' }, px: 6, mt: 5, mb: 2 }} >
                        <DatePickerWrapper>
                            <DatePicker
                                selectsRange
                                endDate={endDate}
                                selected={startDate}
                                startDate={startDate}
                                id='date-range-picker'
                                onChange={handleOnChange}
                                shouldCloseOnSelect={true}
                                customInput={
                                    <CustomInput label='Search Dates' start={startDate as Date | number} end={endDate as Date | number} />
                                }
                            />
                        </DatePickerWrapper>
                    </Box>

                    {loadError && (
                        <Box sx={{ px: 6, pb: 4 }}>
                            <Alert severity='error'>
                                Product orders could not be loaded: {loadError}
                            </Alert>
                        </Box>
                    )}

                    <TccDataTable
                        column={column}
                        rows={result}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(pagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={pagination.total_items}
                        page={pagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        emptyMessage='No product orders match the current filters'
                        loading={isLoading}
                    />
                </Card>
            </Grid>
        </Grid>
    )
}

export default OrdersList
