import { Box, BoxProps, Button, Card, CardContent, Divider, Grid, Table, TableBody, TableCell, TableCellBaseProps, TableHead, TableRow, Typography } from "@mui/material"
import themeConfig from 'src/configs/themeConfig'
import { styled, useTheme } from '@mui/material/styles'
import { useEffect, useState } from "react"
import moment from "moment"
import TccDataTable from "src/customComponents/data-table/table"
import { useRouter } from "next/router"
import { INVOICE_DETAIL } from "src/services/AdminServices"
import { toast } from "react-hot-toast"
import { appErrors } from "src/AppConstants"
import { CURRENCY_VALUE, DATEPICKER_DATE_FORMAT, IMG_ENDPOINT, SYSTEM_LOGO_MAIN } from "src/AppConfig"
import { getPriceFormat } from "src/utils/sharedFunction"


const MUITableCell = styled(TableCell)<TableCellBaseProps>(({ theme }) => ({
    borderBottom: 0,
    paddingLeft: '0 !important',
    paddingRight: '0 !important',
    paddingTop: `${theme.spacing(1)} !important`,
    paddingBottom: `${theme.spacing(1)} !important`
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
    city_id: number
    state_id: number
    country_id: number
    phone_number: number
}

type BillingAdressData = {
    house_builing: string
    area_name: string
    pincode: number
    city_id: number
    state_id: number
    country_id: number
    phone_number: number
}

const InvoicePrint = ({ orderId }: any) => {

    const [pageSize, setPageSize] = useState(10)
    const [invoiceData, setInvoiceData] = useState<Partial<InvoiceData>>({})
    const [shippingAdressData, setShippingAdressData] = useState<Partial<ShippingAdressData>>({})
    const [billingAdressData, setBillingAdressData] = useState<Partial<BillingAdressData>>({})
    const [orderInvoiceData, setOrderInvoiceData] = useState<{ id: number, product_name: string, product_price: number, quantity: number, product_tax: any, sub_total: any, product_image: any, discount: any }[]>([])
    const [orderTaxData, setOrderTaxData] = useState([])
    const theme = useTheme()

    useEffect(() => {
        setTimeout(() => {
            window.print()
        }, 1200)
    }, [])

    /////////////////////// INVOICE-DETAILS //////////////////////////

    const invoiceDetailsData = async () => {
        const payload = {
            "order_id": orderId
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
                    invoiceOrderProductList.push({ id: orderProduct.product_id, product_name: orderProduct.product_name, product_price: orderProduct.product_price?.toFixed(2), quantity: orderProduct.quantity, product_tax: orderProduct.product_tax == null ? <Typography>00.00</Typography> : <Typography>{orderProduct.product_tax}</Typography>, sub_total: orderProduct.sub_total?.toFixed(2), product_image: orderProduct.product_image, discount: orderProduct.discount == null ? <Typography>00.00</Typography> : <Typography>{orderProduct.discount}</Typography> })
                }
                setOrderInvoiceData(invoiceOrderProductList);
            } else {
            }
        } catch (e: any) {
        }
        return false;
    }
    useEffect(() => {
        invoiceDetailsData();
    }, [orderId])

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
            <Grid container spacing={6}>
                <Grid item xl={7} xs={12}>
                    <Card>
                        <CardContent sx={{ p: [`${theme.spacing(6)} !important`, `${theme.spacing(10)} !important`] }}>
                            <Grid container>
                                <Grid item sm={6} xs={6} sx={{ mb: { sm: 0, xs: 4 } }}>
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
                                <Grid item sm={6} xs={6}>
                                    <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start' } }}>
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
                                <Grid item xs={6} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
                                    <Typography sx={{ mb: 6, fontWeight: 500 }}>Shipping To :</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{shippingAdressData.house_builing}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{shippingAdressData.area_name}, {invoiceData.shipping_city}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{invoiceData.shipping_state}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{invoiceData.shipping_country}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{shippingAdressData.pincode}</Typography>
                                    <Typography sx={{ mb: 1.5, color: 'text.secondary' }}>{shippingAdressData.phone_number}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={6} sx={{ display: 'flex', justifyContent: ['flex-start'] }}>
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
                                <Grid item xs={6} sm={6} sx={{ mb: { lg: 0, xs: 4 } }}>
                                    <Typography sx={{ color: 'text.secondary' }}>Thanks for your business</Typography>
                                </Grid>
                                <Grid item xs={6} sm={6} sx={{ display: 'flex', justifyContent: ['flex-start'], flexDirection: 'column' }} >
                                    <CalcWrapper>
                                        <Typography sx={{ color: 'text.secondary' }}>Subtotal:</Typography>
                                        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{`${CURRENCY_VALUE}`}{getPriceFormat(invoiceData.invoice_amount)}</Typography>
                                    </CalcWrapper>
                                    <CalcWrapper>
                                        <Typography sx={{ color: 'text.secondary' }}>Discount:</Typography>
                                        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{`${CURRENCY_VALUE}`}00.00</Typography>
                                    </CalcWrapper>
                                    {orderTaxData && orderTaxData.map((t: any) => (
                                        <CalcWrapper>
                                            <Typography sx={{ color: 'text.secondary' }}>{t.name}({t.rate})%</Typography>
                                            <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{`${CURRENCY_VALUE}`}{t.tax_amount}</Typography>
                                        </CalcWrapper>
                                    ))}
                                    <Divider sx={{ my: `${theme.spacing(2)} !important` }} />
                                    <CalcWrapper>
                                        <Typography sx={{ color: 'text.secondary' }}>Total:</Typography>
                                        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{`${CURRENCY_VALUE}`}{getPriceFormat(invoiceData.invoice_amount)}</Typography>
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
            </Grid>
        </>
    )
}

export default InvoicePrint
