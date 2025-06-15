import { Icon } from "@iconify/react"
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent, CardHeader, Divider, Grid, IconButton, Typography } from "@mui/material"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import CustomAvatar from 'src/@core/components/mui/avatar'
import { useSettings } from "src/@core/hooks/useSettings"
import { ThemeColor } from 'src/@core/layouts/types'
import { appErrors } from "src/AppConstants"
import TccSwiperControls from "src/customComponents/swiper/swiper-main"
import { PRODUCT_INQUIRIES_DETAIL } from "src/services/AdminServices"

const data = {
    id: 1,
    role: 'admin',
    status: 'active',
    username: 'gslixby0',
    avatarColor: 'primary',
    country: 'El Salvador',
    company: 'Yotz PVT LTD',
    billing: 'Manual - Cash',
    contact: '(479) 232-9151',
    currentPlan: 'enterprise',
    fullName: 'Daisy Patterson',
    email: 'gslixby0@abc.net.au',
    avatar: 'https://bit.ly/dan-abramov'
}

type User = {
    full_name: string,
    email: string,
    product_id: number,
    contact_number: string,
    message: string,
    admin_action: number,
    admin_comments: string,
    product_name: string,
    product_sku: string,
    metal: string,
    Karat: number,
    Metal_tone: string,
    product_size: number,
    product_length: number
}

const ProductEnquirieDetails = () => {

    const [productEnquirieDetail, setProductEnquirieDetail] = useState<Partial<User>>({})
    const [productImage, setProductImage] = useState([])
    const [productInquirieid, setProductInquirieId] = useState(0);

    const router = useRouter();
    const { id } = router.query;

    const route = useRouter()
    const {
        settings: direction
    } = useSettings()

    /////////////////////// PRODUCT-INQUIRIES-DETAIL API ///////////////////////

    const productInquiriesData = async (id: number) => {
        const payload = {
            "id": id,
        };
        try {
            const data = await PRODUCT_INQUIRIES_DETAIL(payload);
            if (data.code === 200 || data.code === "200") {
                setProductEnquirieDetail(data.data.inquiriesDetails)
                setProductImage(data.data.product_image)

            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    useEffect(() => {

        let productInquirieId: string = id as string
        if (productInquirieId != undefined) {
            setProductInquirieId(parseInt(productInquirieId))
            productInquiriesData(parseInt(productInquirieId));
        }
    }, [router.isReady])

    return (
        <>
            <Button variant='contained' sx={{ mr: 3, mb: 4, '& svg': { mr: 2 } }} onClick={() => route.back()}>
                <Icon icon='material-symbols:arrow-back-rounded' />
                Back
            </Button>

            <Grid container spacing={6}>

                <Grid item xs={12} md={4} lg={4}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent sx={{ pt: 13.5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                {data.avatar ? (
                                    <CustomAvatar
                                        src="https://tse1.mm.bing.net/th?id=OIP.swaYMWAS8cfbyMKLEiQJ2QD6D6&pid=Api&P=0"
                                        variant='rounded'
                                        alt={data.fullName}
                                        sx={{ width: 100, height: 100, mb: 4 }}
                                    />
                                ) : (
                                    <CustomAvatar
                                        skin='light'
                                        variant='rounded'
                                        color={data.avatarColor as ThemeColor}
                                        sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
                                    >
                                    </CustomAvatar>
                                )}
                                <Typography variant='h5' sx={{ mb: 3 }}>
                                    {productEnquirieDetail.full_name}
                                </Typography>

                            </CardContent>

                            <CardContent sx={{ pt: theme => `${theme.spacing(2)} !important` }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CustomAvatar skin='light' variant='rounded' sx={{ mr: 2.5, width: 38, height: 38 }}>
                                            <Icon fontSize='1.75rem' icon='tabler:briefcase' />
                                        </CustomAvatar>
                                        <div>
                                            {/* <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>10</Typography> */}
                                            <Typography variant='body2'>Total orders </Typography>
                                        </div>
                                    </Box>
                                </Box>
                            </CardContent>

                            <Divider sx={{ my: '0 !important', mx: 6 }} />

                            <CardContent sx={{ pb: 4 }}>
                                <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
                                    User Details
                                </Typography>
                                <Box sx={{ pt: 4 }}>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Username:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{productEnquirieDetail.full_name}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Email:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{productEnquirieDetail.email}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Contact:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>+1 {productEnquirieDetail.contact_number}</Typography>
                                    </Box>

                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <Grid item xs={12}>
                        <Card>

                            <CardContent>
                                <TccSwiperControls direction={direction} imageArray={productImage} />


                            </CardContent>

                            <CardContent sx={{ alignItems: 'center', flexDirection: 'column' }}>
                                {/* {product.imgs ? (
                                    <CustomAvatar
                                        src={product.imgs}
                                        variant='rounded'
                                        alt={product.Product_name}
                                        sx={{ width: 100, height: 100, mb: 4 }}
                                    />
                                ) : (
                                    <CustomAvatar
                                        skin='light'
                                        variant='rounded'
                                        color={product.avatarColor as ThemeColor}
                                        sx={{ width: 100, height: 100, mb: 4, fontSize: '3rem' }}
                                    >
                                    </CustomAvatar>
                                )} */}
                                <Box>
                                    <Typography variant='h6'>
                                        {productEnquirieDetail.product_name}
                                    </Typography>
                                    {/* <Typography sx={{ mt: 2 }}>
                                        {product.price}
                                    </Typography> */}
                                </Box>
                            </CardContent>

                            <Divider sx={{ my: '0 !important', mx: 6 }} />

                            <CardContent sx={{ pb: 4 }}>
                                <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
                                    Product  Details
                                </Typography>
                                <Box sx={{ pt: 4 }}>

                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>SKU:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{productEnquirieDetail.product_sku}</Typography>
                                    </Box>

                                    {/* <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Diamond Price:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{product.diamond_price}</Typography>
                                    </Box> */}

                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={4} lg={4}>
                    <Grid item xs={12}>
                        <Card>
                            <Divider sx={{ my: '0 !important', mx: 6 }} />
                            <CardContent sx={{ pb: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ color: 'text.disabled', textTransform: 'uppercase' }}>
                                        Attribute Details
                                    </Typography>

                                </Box>
                                <Box sx={{ pt: 4 }}>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Metal:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{productEnquirieDetail.metal}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Karat:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{productEnquirieDetail.Karat}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>Metal_tone:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{productEnquirieDetail.Metal_tone}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>product_size:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{productEnquirieDetail.product_size}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', mb: 3 }}>
                                        <Typography sx={{ mr: 2, fontWeight: 500 }}>product_length:</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{productEnquirieDetail.product_length}</Typography>
                                    </Box>

                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}

export default ProductEnquirieDetails