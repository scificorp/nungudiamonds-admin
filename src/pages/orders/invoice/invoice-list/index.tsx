import { Icon } from "@iconify/react"
import { Box, BoxProps, Button, Card, CardContent, Divider, Grid, Table, TableBody, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { styled, useTheme } from '@mui/material/styles'
import TableCell, { TableCellBaseProps } from '@mui/material/TableCell'
import moment from "moment"
import Link from "next/link"
import Router, { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { CURRENCY_VALUE, DATEPICKER_DATE_FORMAT, IMG_ENDPOINT, SYSTEM_LOGO_MAIN } from "src/AppConfig"
import { appErrors } from "src/AppConstants"


// ** Configs
import themeConfig from 'src/configs/themeConfig'
import TccDataTable from "src/customComponents/data-table/table"
import { INVOICE_DETAIL } from "src/services/AdminServices"


const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
    borderBottom: 0,
    paddingLeft: '0 !important',
    paddingRight: '0 !important',
    '&:not(:last-child)': {
        paddingRight: `${theme.spacing(2)} !important`
    }
}))

const CalcWrapper = styled(Box)<BoxProps>(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&:not(:last-of-type)': {
        marginBottom: theme.spacing(2)
    }
}))

type InvoiceData = {
    invoice_number: any
    invoice_date: any
    invoice_amount: number
    order_id: any
    shipping_country: string
    shipping_state: string
    shipping_city: string
    billing_country: string
    billing_state: string
    billing_city: string
}

type ShippingAdressData = {
    full_name: string
    house_builing: string
    area_name: string
    pincode: number
    phone_number: number
}

type BillingAdressData = {
    house_builing: string
    area_name: string
    pincode: number
    phone_number: number
}
const InvoiceDetails = () => {
    const [pageSize, setPageSize] = useState(10)
    const [addPaymentOpen, setAddPaymentOpen] = useState<boolean>(false)
    const [sendInvoiceOpen, setSendInvoiceOpen] = useState<boolean>(false)
    const [invoiceData, setInvoiceData] = useState<Partial<InvoiceData>>({})
    const [shippingAdressData, setShippingAdressData] = useState<Partial<ShippingAdressData>>({})
    const [billingAdressData, setBillingAdressData] = useState<Partial<BillingAdressData>>({})
    const [orderInvoiceData, setOrderInvoiceData] = useState<{ id: number, product_name: string, product_price: number, quantity: number, product_tax: any, sub_total: any, product_image: any, discount: any }[]>([])
    const [orderDetailId, setOrderDetailId] = useState(0)
    const [orederTaxData, setOrderTaxData] = useState([])

    const theme = useTheme()
    const toggleSendInvoiceDrawer = () => setSendInvoiceOpen(!sendInvoiceOpen)
    const toggleAddPaymentDrawer = () => setAddPaymentOpen(!addPaymentOpen)

    const orderID = invoiceData.order_id

    const router = useRouter();
    const { id } = router.query;

    /////////////////////// INVOICE-DETAILS //////////////////////////

    const invoiceDetailsData = async (id: number) => {
        const payload = {
            "order_id": id
        };
        try {
            const data = await INVOICE_DETAIL(payload);
            if (data.code === 200 || data.code === "200") {
                setInvoiceData(data.data)
                setShippingAdressData(data.data.shipping_address)
                setBillingAdressData(data.data.billing_address)
                setOrderTaxData(JSON.parse(data.data.order_invoice.order_taxs));
                const invoiceOrderProductList: any = []
                for (let orderProduct of data.data.order_invoice.order) {
                    invoiceOrderProductList.push({ id: orderProduct.product_id, product_name: orderProduct.product_name, product_price: orderProduct.product_price?.toFixed(2), quantity: orderProduct.quantity == null ? <Typography>00.00</Typography> : <Typography>{orderProduct.quantity}</Typography>, product_tax: orderProduct.product_tax == null ? <Typography>00.00</Typography> : <Typography>{orderProduct.product_tax}</Typography>, sub_total: orderProduct.sub_total?.toFixed(2), product_image: orderProduct.product_image, discount: orderProduct.discount == null ? <Typography>00.00</Typography> : <Typography>{orderProduct.discount}</Typography> })
                }
                setOrderInvoiceData(invoiceOrderProductList);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }
        return false;
    }
    useEffect(() => {
        let orderId: string = id as string
        if (orderId != undefined) {
            setOrderDetailId(parseInt(orderId))
            invoiceDetailsData(parseInt(orderId));
        }
    }, [router.isReady])

    const column = [

        {
            flex: 1,
            headerName: 'image',
            field: 'product_image',
            avatars: 'avatars',
            value: 'product_image'
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
            text: 'text'
        },
        {
            flex: 1,
            value: 'quantity',
            headerName: 'Q',
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
            text: 'text'
        },
    ]

    return (
        <>
            <Button variant='contained' sx={{ mr: 3, mb: 4, '& svg': { mr: 2 } }} onClick={() => Router.back()}>
                <Icon icon='material-symbols:arrow-back-rounded' />
                Back
            </Button>
            <Grid container spacing={6}>
                <Grid item xl={9} md={8} xs={12}>
                    <Card>
                        <CardContent sx={{ p: [`${theme.spacing(6)} !important`, `${theme.spacing(10)} !important`] }}>
                            <Grid container>
                                <Grid item sm={6} xs={12} sx={{ mb: { sm: 0, xs: 4 } }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ mb: 6, display: 'flex', alignItems: 'center' }}>
                                            <img width={110} height={50} src={`${IMG_ENDPOINT}${SYSTEM_LOGO_MAIN}`} />

                                            {/* <Typography
                                                variant='h6'
                                                sx={{
                                                    ml: 2.5,
                                                    fontWeight: 600,
                                                    lineHeight: '24px',
                                                    fontSize: '1.375rem !important'
                                                }}
                                            >
                                                {themeConfig.templateName}
                                            </Typography> */}
                                        </Box>
                                        <div>
                                            <Typography sx={{ mb: 2, color: 'text.secondary' }}>Office F1W7, The Paragon, 1 Kramer Road,</Typography>
                                            <Typography sx={{ mb: 2, color: 'text.secondary' }}>Bedfordview, Gauteng, South Africa</Typography>
                                            <Typography sx={{ color: 'text.secondary' }}>+27 11 681 0209</Typography>
                                        </div>
                                    </Box>
                                </Grid>
                                <Grid item sm={6} xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                                        <Table sx={{ maxWidth: '210px' }}>
                                            <TableBody sx={{ '& .MuiTableCell-root': { py: `${theme.spacing(1.5)} !important` } }}>
                                                <TableRow>
                                                    <MUITableCell>
                                                        <Typography variant='h6'>Invoice</Typography>
                                                    </MUITableCell>
                                                    <MUITableCell>
                                                        <Typography>{invoiceData.invoice_number}</Typography>
                                                    </MUITableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <MUITableCell>
                                                        <Typography sx={{ color: 'text.secondary' }}>Date Issued:</Typography>
                                                    </MUITableCell>
                                                    <MUITableCell>
                                                        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                                            {moment(invoiceData.invoice_date).format(DATEPICKER_DATE_FORMAT)}
                                                        </Typography>
                                                    </MUITableCell>
                                                </TableRow>
                                                {/* <TableRow>
                                                    <MUITableCell>
                                                        <Typography sx={{ color: 'text.secondary' }}>Amount:</Typography>
                                                    </MUITableCell>
                                                    <MUITableCell>
                                                        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                                            {invoiceData.invoice_amount}
                                                        </Typography>
                                                    </MUITableCell>
                                                </TableRow> */}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>

                        <Divider />

                        <CardContent sx={{ p: [`${theme.spacing(6)} !important`, `${theme.spacing(10)} !important`] }}>
                            <Grid container>
                                <Grid item xs={12} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
                                    <Typography sx={{ mb: 6, fontWeight: 500 }}>Shipping To :</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{shippingAdressData.house_builing}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{shippingAdressData.area_name}, {invoiceData.shipping_city}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{invoiceData.shipping_state}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{invoiceData.shipping_country}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{shippingAdressData.pincode}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{shippingAdressData.phone_number}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: ['flex-start', 'flex-end'] }}>
                                    <div>
                                        <Typography sx={{ mb: 6, fontWeight: 500 }}>Bill To :</Typography>
                                        <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{billingAdressData.house_builing}</Typography>
                                        <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{billingAdressData.area_name}, {invoiceData.billing_city}</Typography>
                                        <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{invoiceData.billing_state}</Typography>
                                        <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{invoiceData.billing_country}</Typography>
                                        <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{billingAdressData.pincode}</Typography>
                                        <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{billingAdressData.phone_number}</Typography>

                                    </div>
                                </Grid>
                            </Grid>
                        </CardContent>

                        <Divider />

                        <TccDataTable
                            column={column}
                            rows={orderInvoiceData}
                            pageSize={pageSize}
                            onChangepage={(e: any) => setPageSize(e)}
                        />

                        <CardContent sx={{ p: [`${theme.spacing(6)} !important`, `${theme.spacing(10)} !important`] }}>
                            <Grid container>
                                <Grid item xs={12} sm={7} lg={9} sx={{ order: { sm: 1, xs: 2 } }}>
                                    <Typography sx={{ color: 'text.secondary' }}>Thanks for your business</Typography>
                                </Grid>
                                <Grid item xs={12} sm={5} lg={3} sx={{ mb: { sm: 0, xs: 4 }, order: { sm: 2, xs: 1 } }}>

                                    <CalcWrapper>
                                        <Typography sx={{ color: 'text.secondary' }}>Subtotal:</Typography>
                                        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{`${CURRENCY_VALUE}`}{invoiceData.invoice_amount}</Typography>
                                    </CalcWrapper>
                                    <CalcWrapper>
                                        <Typography sx={{ color: 'text.secondary' }}>Discount:</Typography>
                                        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{`${CURRENCY_VALUE}`}00.00</Typography>
                                    </CalcWrapper>
                                    {orederTaxData && orederTaxData.map((t: any) => (
                                        <CalcWrapper>
                                            <Typography sx={{ color: 'text.secondary' }}>{t.name}({t.rate})%</Typography>
                                            <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{`${CURRENCY_VALUE}`}{t.tax_amount}</Typography>
                                        </CalcWrapper>
                                    ))}
                                    <Divider sx={{ my: `${theme.spacing(2)} !important` }} />
                                    <CalcWrapper>
                                        <Typography sx={{ color: 'text.secondary' }}>Total:</Typography>
                                        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{`${CURRENCY_VALUE}`}{invoiceData.invoice_amount}</Typography>
                                    </CalcWrapper>
                                </Grid>
                            </Grid>
                        </CardContent>

                        <Divider />

                        <CardContent sx={{ px: [6, 10] }}>
                            <Typography sx={{ color: 'text.secondary' }}>
                                <Typography component='span' sx={{ mr: 1.5, fontWeight: 500, color: 'inherit' }}>
                                    Note:
                                </Typography>
                                We declare to the best of our knowledge and belief that the particulars stated herein are true and correct
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xl={3} md={4} xs={12}>
                    <Card>
                        <CardContent>
                            <Button
                                fullWidth
                                sx={{ mb: 2 }}
                                target='_blank'
                                component={Link}
                                color='secondary'
                                variant='outlined'
                                href={`/orders/invoice/invoice-layout/?id=${orderID}`}
                            >
                                Print
                            </Button>

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


        </>
    )
}

export default InvoiceDetails
