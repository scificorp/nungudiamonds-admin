import { Icon } from "@iconify/react"
import { Avatar, Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from "@mui/material"
import { Box } from "@mui/system"
import moment from "moment"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import CustomChip from 'src/@core/components/mui/chip'
import { CURRENCY_VALUE, DATEPICKER_DATE_FORMAT } from "src/AppConfig"
import { appErrors } from "src/AppConstants"
import TccDataTable from "src/customComponents/data-table/table"
import TccSelect from "src/customComponents/Form-Elements/select"
import { DELIVERY_STATUS, ORDER_STATUS_UPDATE, ORDERS_DETAIL } from "src/services/AdminServices"
import { getPriceFormat } from "src/utils/sharedFunction"


const OrderStatus = [

    { title: 'Pending', id: 1 },
    { title: "Confirmed", id: 2 },
    { title: 'Processing', id: 3 },
    { title: 'OutOfDelivery', id: 4 },
    { title: 'Delivered', id: 5 },
    { title: 'Returned', id: 6 },
    { title: 'Failed', id: 7 },
    { title: 'Canceled', id: 8 },

]

const DeliverStatus = [

    { title: 'Pending', id: 1 },
    { title: 'Deliver', id: 2 },

]

const paymentMethod = [

    { title: 'cashOnDelivery', id: 1 },
    { title: 'yoco', id: 2 },
]

type OrderData = {
    id: number
    order_number: string
    order_status: any
    order_date: string
    email: string
    user_name: string
    user_email: string
    user_phone_number: string
    shipping_add_country: string
    shipping_add_state: string
    shipping_add_city: string
    billing_add_country: string
    billing_add_state: string
    billing_add_city: string
    sub_total: any
    total_tax: number
    shipping_cost: any
    payment_method: any
    discount: any
    order_shipping_address: any
    order_billing_address: any
}

type ShippingData = {
    house_builing: string
    area_name: string
    pincode: number
    city_id: number
    state_id: number
    country_id: number
    phone_number: number
}

type BillingData = {
    house_builing: string
    area_name: string
    pincode: number
    city_id: number
    state_id: number
    country_id: number
    phone_number: number
}

const OrderDetails = () => {

    const [pageSize, setPageSize] = useState(10)
    const [orderDetailData, setOrderDetailData] = useState<{ id: number, quantity: number, sub_total: number, product_tax: any, product_name: string, product_sku: string, metal: string, diamond_rate: any, Karat: number, Metal_tone: string, product_size: number, product_length: number, product_images: any[], product_price: any, delivery_status: any, discount: any }[]>([])
    const [orderData, setOrderData] = useState<Partial<OrderData>>({})
    const [shippingData, setShippingData] = useState<Partial<ShippingData>>({})
    const [billingData, setBillingData] = useState<Partial<BillingData>>({})
    const [orderStatusUpdate, setOrderStatusUpdate] = useState('')
    const [deliveryStatus, setDeliveryStatus] = useState('')
    const [orderNumberData, setOrderNumber] = useState('')
    const [orderTaxData, setOrderTaxData] = useState([])

    const router = useRouter();
    const { orderNumber } = router.query;

    const invoiceOnClick = () => {
        Router.push({ pathname: "/orders/invoice/invoice-list", query: { id: orderData.id } })
    }

    const invoicePrintOnClick = () => {
        Router.push({ pathname: "/orders/invoice/invoice-layout", query: { id: orderData.id } })
    }

    const orderStatus: any = {
        1: { title: 'Pending', color: 'primary' },
        2: { title: 'Confirmed', color: 'success' },
        3: { title: 'Processing', color: 'warning' },
        4: { title: 'OutOfDelivery', color: 'info' },
        5: { title: 'Delivered', color: 'success' },
        6: { title: 'Returned', color: 'warning' },
        7: { title: "Failed", color: "error" },
        8: { title: "Canceled", color: "error" }
    }

    const deliveryStatusList: any = {
        1: { title: 'Pending', color: 'primary' },
        2: { title: 'Deliver', color: 'success' },
    }

    /////////////////////// ORDER-DETAILS //////////////////////////

    const ordersDetailsData = async (orderNumber: any) => {
        const payload = {
            "order_number": orderNumber,
        };
        try {
            const data = await ORDERS_DETAIL(payload);

            if (data.code === 200 || data.code === "200") {
                setOrderData(data.data)
                setOrderTaxData(JSON.parse(data.data.order_taxs))
                setOrderStatusUpdate(data.data.order_status)
                const orderTableData = [];
                for (const item of data.data.order) {
                    orderTableData.push({ id: item.product.id, quantity: item.quantity, sub_total: item.sub_total?.toFixed(2), product_tax: item.product_tax == null ? <Typography>00.00</Typography> : <Typography>{item.product_tax}</Typography>, product_name: item.product_name, product_sku: item.product_sku, metal: item.metal, diamond_rate: item.diamond_rate, Karat: item.Karat, Metal_tone: item.Metal_tone, product_size: item.product_size, product_length: item.product_length, product_images: item.product.product_images[0].image_path, product_price: item.product_price.toFixed(2), delivery_status: item.delivery_status, discount: item.discount == null ? <Typography>00.00</Typography> : <Typography>{item.discount}</Typography> });
                }
                setOrderDetailData(orderTableData);
                setShippingData(data.data.order_shipping_address)
                setBillingData(data.data.order_billing_address)

            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }
        return false;
    }
    useEffect(() => {
        let orderNumberValue: string = orderNumber as string
        if (orderNumberValue != undefined) {
            setOrderNumber(orderNumberValue)
            ordersDetailsData(orderNumber)
        }
    }, [router.isReady])

    //////////////////// ORDER STATUS API ///////////////////////

    const orderStatusApi = async (order: number) => {
        const payload = {
            "id": orderData.id,
            "order_status": order,
        };
        try {
            const data = await ORDER_STATUS_UPDATE(payload);
            if (data.code === 200 || data.code === "200") {
                ordersDetailsData(orderNumber)

                toast.success(data.message);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }
        return false;
    }

    const handleChangeOrderStatus = (e: any) => {
        orderStatusApi(e.target.value)
        setOrderStatusUpdate(e.target.value);
    }

    const handleChangeDeliveryStatus = (event: any) => {
        deliveryStatusApi(event.target.value)
        setDeliveryStatus(event.target.value)
    }
    //////////////////// DELIVERY STATUS API ///////////////////////

    const deliveryStatusApi = async (delivery: number) => {
        const payload = {
            "order_id": orderData.id,
            "delivery_status": delivery,
        };

        try {
            const data = await DELIVERY_STATUS(payload);
            if (data.code === 200 || data.code === "200") {
                ordersDetailsData(orderNumber)
                setDeliveryStatus(data.data)
                toast.success(data.message);
                ordersDetailsData
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
            flex: 1,
            headerName: 'image',
            field: 'product_images',
            avatars: 'avatars',
            value: 'product_images'
        },
        {
            flex: 1.5,
            value: 'product_name',
            headerName: 'name',
            field: 'product_name',
            text: 'text'
        },

        {
            flex: 1,
            value: 'product_price',
            headerName: 'price',
            field: 'product_price',
            price: 'price'
        },
        {
            flex: 1,
            value: 'quantity',
            headerName: 'Quantity',
            field: 'quantity',
            text: 'text'
        },
        {
            flex: 1,
            value: 'product_tax',
            headerName: 'Tax',
            field: 'product_tax',
            text: 'text'
        },
        {
            flex: 1,
            value: 'discount',
            headerName: 'discount',
            field: 'discount',
            text: 'text'
        },
        {
            flex: 1,
            value: 'sub_total',
            headerName: 'subTotal',
            field: 'sub_total',
            price: 'price'
        },
    ]

    return (
        <>
            <Button variant='contained' sx={{ mr: 3, mb: 4, '& svg': { mr: 2 } }} onClick={() => Router.back()}>
                <Icon icon='material-symbols:arrow-back-rounded' />
                Back
            </Button>
            <Grid container spacing={6}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ mr: 4 }}>{orderData.order_number}</Typography>
                            <CustomChip
                                rounded
                                skin='light'
                                size='small'
                                label={orderStatus[orderData.order_status]?.title}
                                color={orderStatus[orderData.order_status]?.color}
                                sx={{ textTransform: 'capitalize', mr: 4 }}
                            />
                            <Icon icon='material-symbols:calendar-month' style={{ fontSize: '20px' }} />
                            <Typography sx={{ ml: 2, fontSize: "13px" }}>{moment(orderData.order_date).format(DATEPICKER_DATE_FORMAT)}</Typography>
                        </CardContent>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ml: 5 }}>
                            <Box>
                                <Button
                                    sx={{ mb: 2, fontSize: '12px' }}
                                    color='primary'
                                    onClick={invoicePrintOnClick}>
                                    <Icon icon='tabler:printer' style={{ fontSize: '20px', marginRight: 8 }} />
                                    print Invoice
                                </Button>
                                <Button sx={{ mb: 2, fontSize: '12px' }}
                                    color='primary'
                                    onClick={invoiceOnClick}>
                                    <Icon icon='tabler:eye' style={{ fontSize: '20px', marginRight: 8 }} />
                                    View Invoice</Button>
                            </Box>
                            <Box>
                                <TccSelect
                                    inputLabel="Order Status"
                                    label='Order Status'
                                    Options={OrderStatus}
                                    value={orderStatusUpdate}
                                    title='title'
                                    onChange={handleChangeOrderStatus}
                                    sx={{ width: '200px' }}
                                />
                            </Box>
                        </CardContent>
                        <Divider />
                    </Card>
                </Grid>
                <Grid item xs={12} md={8} lg={8}>
                    <Grid item xs={12}>
                        <Card sx={{ mb: 6 }}>
                            <CardHeader title='Order Details' />
                            <Divider />
                            <CardContent sx={{ display: 'grid', justifyContent: 'end' }}>
                                <Typography sx={{ fontSize: "13px" }}>Payment Method: {paymentMethod[orderData.payment_method]?.title}</Typography>
                                <Typography sx={{ fontSize: "13px" }}>Payment Method Reference : </Typography>
                            </CardContent>
                            <Divider />
                            <TccDataTable
                                column={column}
                                rows={orderDetailData}
                                pageSize={pageSize}
                                onChangepage={(e: any) => setPageSize(e)}
                            />
                            <Divider />
                            <CardContent sx={{ display: 'flex', justifyContent: 'end' }}>
                                <Grid xs={12} md={6} lg={6}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ fontSize: "13px" }}><b>Shipping:</b></Typography>
                                        {orderData.shipping_cost === null ? <Typography>{`${CURRENCY_VALUE}`} 00.00</Typography> : <Typography>R{orderData.shipping_cost}</Typography>}
                                    </Box>
                                    <Divider sx={{ mb: 2, mt: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ fontSize: "13px" }}><b>Coupon discount : </b></Typography>
                                        <Typography sx={{ fontSize: "13px" }}>{orderData.discount == null ? <Typography>{`${CURRENCY_VALUE}`}00.00</Typography> : <Typography>R{orderData.discount}</Typography>}</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2, mt: 1 }} />
                                    {orderTaxData && orderTaxData.map((t: any) => (
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography sx={{ fontSize: "13px" }}><b>{t.name}</b> ({t.rate}%)</Typography>
                                                <Typography sx={{ fontSize: "13px" }}>{`${CURRENCY_VALUE}`}{t.tax_amount}</Typography>
                                            </Box>
                                            <Divider sx={{ mb: 2, mt: 1 }} />
                                        </>
                                    ))}

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography sx={{ fontSize: "13px" }}><b>Total :</b></Typography>
                                        <Typography sx={{ fontSize: "13px" }}>{`${CURRENCY_VALUE}`}{getPriceFormat(orderData.sub_total)}</Typography>
                                    </Box>
                                </Grid>
                            </CardContent>
                        </Card>
                        <Grid container spacing={6}>
                            {orderDetailData.map((details, k) => (
                                <Grid item lg={6} md={6} xs={12} key={details.id}>
                                    <Grid item xs={12}>
                                        <Card>
                                            <CardContent>
                                                <Typography sx={{ fontSize: "13px" }}><b>{details.product_name}</b></Typography>
                                                {/* <Typography>{details.price}</Typography> */}
                                            </CardContent>
                                            <Divider />
                                            <CardContent>
                                                <Typography sx={{ fontSize: "13px" }}><b>Diamond Price: </b>{details.diamond_rate}</Typography>
                                                <Typography sx={{ fontSize: "13px" }}><b>Gold KT: </b>{details.Karat}</Typography>
                                                <Typography sx={{ fontSize: "13px" }}><b> Metal tone: </b>{details.metal}</Typography>
                                                <Typography sx={{ fontSize: "13px" }}><b>Metal Tone: </b>{details.Metal_tone}</Typography>
                                                <Typography sx={{ fontSize: "13px" }}><b>Size: </b>{details.product_size}</Typography>
                                                <Typography sx={{ fontSize: "13px" }}><b>length: </b>{details.product_length}</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                </Grid>
                            ))}

                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title='Shipping info' />
                            <Divider />
                            <CardContent>
                                <Typography sx={{ mb: 4, fontSize: "13px" }}><b>Shipping Type:</b> </Typography>
                                <Typography sx={{ mb: 6, fontSize: "13px" }}><b>Shipping Method:</b> </Typography>

                                <Typography sx={{ mb: 4, fontSize: "13px" }}><b>Delivery Status:</b>

                                    <CustomChip
                                        rounded
                                        size='small'
                                        label={orderDetailData.map((t: any) => (deliveryStatusList[t.delivery_status]?.title))[0]}
                                        color="default"
                                        sx={{ textTransform: 'capitalize', ml: 3 }}
                                    />

                                </Typography>
                                <TccSelect
                                    inputLabel="Delivery Status"
                                    defaultValue=""
                                    label='Delivery Status'
                                    title='title'
                                    Options={DeliverStatus}
                                    onChange={handleChangeDeliveryStatus}
                                    fullWidth
                                />
                            </CardContent>
                        </Card>
                        <Card sx={{ mt: 6 }} >
                            <CardHeader sx={{ fontSize: "13px" }} title='Customer' />
                            <Divider />
                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar src="http://cdn.onlinewebfonts.com/svg/img_24787.png" sx={{ mr: 8 }} />
                                <Typography sx={{ fontSize: "13px" }}>{orderData.user_name ? orderData.user_name : orderData.order_shipping_address?.full_name}</Typography>
                            </CardContent>

                            <Divider />

                            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                <Icon icon='tabler:garden-cart' style={{ fontSize: '30px' }} />
                                <Typography sx={{ ml: 8, fontSize: "13px" }}>{orderDetailData.length} Orders</Typography>
                            </CardContent>
                            <Divider />
                            <CardContent>
                                <Typography sx={{ fontSize: "13px" }} variant='body1'><b>Contact Info</b></Typography>
                                <Typography sx={{ display: 'flex', alignItems: 'center', mt: 4, fontSize: "13px" }}>
                                    <Icon icon='mdi-light:email' style={{ fontSize: '25px', marginRight: 20 }} />
                                    {orderData.user_email ? orderData.user_email : orderData.email}
                                </Typography>
                                <Typography sx={{ display: 'flex', alignItems: 'center', mt: 4, fontSize: "13px" }}>
                                    <Icon icon='clarity:mobile-phone-line' style={{ fontSize: '25px', marginRight: 20 }} />
                                    {orderData.user_phone_number ? orderData.user_phone_number : shippingData.phone_number}
                                </Typography>
                            </CardContent>
                            <Divider />

                            <CardContent>
                                <Typography sx={{ fontSize: "13px" }} variant='body1'><b>Shipping address</b></Typography>
                                <Typography sx={{ mt: 4, fontSize: "13px" }}><b>Name:</b> {orderData.order_shipping_address?.full_name}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Country:</b> {orderData.shipping_add_country}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>State:</b> {orderData.shipping_add_state}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>City:</b> {orderData.shipping_add_city}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Zip code: </b> {shippingData.pincode}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Address : </b>{shippingData.house_builing} </Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Area Name : </b>{shippingData.area_name} </Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Phone: </b>{shippingData.phone_number}</Typography>
                            </CardContent>

                            <Divider />

                            <CardContent>
                                <Typography sx={{ fontSize: "13px" }} variant='body1'><b>Billing address</b></Typography>
                                <Typography sx={{ mt: 4, fontSize: "13px" }}><b>Name:</b> {orderData.order_billing_address?.full_name}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Country:</b> {orderData.billing_add_country}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>State:</b> {orderData.billing_add_state}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>City:</b> {orderData.billing_add_city}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Zip code: </b> {billingData.pincode}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Address : </b> {billingData.house_builing}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Area Name : </b> {billingData.area_name}</Typography>
                                <Typography sx={{ fontSize: "13px" }}><b>Phone: </b> {billingData.phone_number}</Typography>
                            </CardContent>
                        </Card>

                    </Grid>
                </Grid>
            </Grid >
        </>
    )
}
export default OrderDetails