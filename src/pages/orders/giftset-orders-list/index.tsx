// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Badge, Button, Divider, TextField } from '@mui/material'
import { forwardRef, useEffect, useState } from 'react'
import TccDataTable from 'src/customComponents/data-table/table'
import { Box } from '@mui/system'
import Router from 'next/router'
import CustomChip from 'src/@core/components/mui/chip'
import { ICommonOrderPagination, ICommonPagination } from 'src/data/interface'
import { GET_ALL_GIFTSET } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import { createOrderPagination, createPagination } from 'src/utils/sharedFunction'
import { OrderStatus } from 'src/data/type'
import format from 'date-fns/format'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { subMonths } from 'date-fns'

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
const giftSetProductOrdersList = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [pagination, setPagination] = useState({ ...createOrderPagination(), order_status: 0, start_date: null, end_date: null })
    const [result, setResult] = useState([])
    const [count, setCount] = useState<Partial<statusCount>>({})
    const [orderDate, setOrderDate] = useState({})
    const [pageSize, setPageSize] = useState(10)
    const [orderNumber, setOrderNumber] = useState('')
    const [orderStatus, setOrderStatus] = useState<number>()
    const [startDate, setStartDate] = useState<DateType>(subMonths(new Date(), 1))
    const [endDate, setEndDate] = useState<DateType>(new Date())


    const viewOnClickHandler = (data: any) => {
        Router.push({ pathname: "/orders/giftset-order-details", query: { orderNumber: data.order_number } })
    }

    /////////////////////// GET API ///////////////////////

    const getAllApi = async (mbPagination: ICommonOrderPagination) => {
        try {
            const data = await GET_ALL_GIFTSET(mbPagination);

            if (data.code === 200 || data.code === "200") {
                setPagination(data.data.pagination)
                setResult(data.data.result || {})
                // console.log(data.data.result);

                setCount(data.data.count || {})
                // console.log(data.data.count);

            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    // useEffect(() => {
    //     getAllApi(pagination);
    // }, [pagination]);

    const handleChangePerPageRows = (perPageRows: number) => {
        getAllApi({ ...pagination, per_page_rows: perPageRows, current_page: 1, order_status: orderStatus, start_date: startDate, end_date: endDate })
    }

    const handleOnPageChange = (page: number) => {
        getAllApi({ ...pagination, current_page: page + 1, order_status: orderStatus, start_date: startDate, end_date: endDate })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            getAllApi({ ...pagination, current_page: 1, order_status: orderStatus, start_date: startDate, end_date: endDate });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchBusinessUser();
    }, [orderStatus, startDate, endDate]);

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
            field: 'user_name',
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
                    <CardHeader title='Giftset Order Transactions' />
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4, ml: 5, mr: 5, fontSize: 'medium' }}>
                        <Badge badgeContent={count.all_order == 0 ? "0" : count.all_order}
                            max={count.all_order} color='primary' sx={{ mt: 5 }}>
                            <CustomChip rounded label='All' skin='light' sx={{ fontSize: 'medium' }}
                                onClick={() => setOrderStatus(OrderStatus.All)}
                            />
                        </Badge>

                        <Badge badgeContent={count.total_pendding_order == 0 ? "0" : count.total_pendding_order} max={count.total_pendding_order} color='primary' sx={{ mt: 5 }}>
                            <CustomChip rounded label='Pending' skin='light' sx={{ ml: 5, fontSize: 'medium' }}
                                onClick={() => setOrderStatus(OrderStatus.Pending)}
                            />
                        </Badge>

                        <Badge badgeContent={count.total_confirm_order == 0 ? "0" : count.total_confirm_order} max={count.total_confirm_order} color='primary' sx={{ mt: 5 }}>
                            <CustomChip rounded label='Confirmed' skin='light' sx={{ ml: 5, fontSize: 'medium' }}
                                onClick={() => setOrderStatus(OrderStatus.Confirmed)}
                            />
                        </Badge>

                        <Badge badgeContent={count.total_in_process_order == 0 ? "0" : count.total_in_process_order} max={count.total_in_process_order} color='primary' sx={{ mt: 5 }}>
                            <CustomChip rounded label='Processing' skin='light' sx={{ ml: 5, fontSize: 'medium' }}
                                onClick={() => setOrderStatus(OrderStatus.Processing)}
                            />

                        </Badge>

                        <Badge badgeContent={count.total_out_of_delivery_order == 0 ? "0" : count.total_out_of_delivery_order} max={count.total_out_of_delivery_order} color='primary' sx={{ mt: 5 }}>
                            <CustomChip rounded label='Out for Delivery' skin='light' sx={{ ml: 5, fontSize: 'medium' }}
                                onClick={() => setOrderStatus(OrderStatus.OutOfDelivery)}
                            />
                        </Badge>

                        <Badge badgeContent={count.total_delivery_order == 0 ? "0" : count.total_delivery_order} max={count.total_delivery_order} color='primary' sx={{ mt: 5 }}>
                            <CustomChip rounded label='Delivered' skin='light' sx={{ ml: 5, fontSize: 'medium' }}
                                onClick={() => setOrderStatus(OrderStatus.Delivered)}
                            />

                        </Badge>

                        <Badge badgeContent={count.total_returned_order == 0 ? "0" : count.total_returned_order} max={count.total_returned_order} color='primary' sx={{ mt: 5 }}>
                            <CustomChip rounded label='Returned' skin='light' sx={{ ml: 5, fontSize: 'medium' }}
                                onClick={() => setOrderStatus(OrderStatus.Returned)}
                            />

                        </Badge>

                        <Badge badgeContent={count.total_fail_order == 0 ? "0" : count.total_fail_order} max={count.total_fail_order} color='primary' sx={{ mt: 5 }}>
                            <CustomChip rounded label='Failed' skin='light' sx={{ ml: 5, fontSize: 'medium' }}
                                onClick={() => setOrderStatus(OrderStatus.Failed)}
                            />
                        </Badge>

                        <Badge badgeContent={count.total_cancel_order == 0 ? "0" : count.total_cancel_order} max={count.total_cancel_order} color='primary' sx={{ mt: 5 }}>
                            <CustomChip rounded label='Canceled' skin='light' sx={{ ml: 5, fontSize: 'medium' }}
                                onClick={() => setOrderStatus(OrderStatus.Canceled)}
                            />

                        </Badge>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                        <Box sx={{ mb: 4, ml: 240, mt: 2 }}>
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
                    </Box>

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
        </Grid>
    )
}

export default giftSetProductOrdersList;