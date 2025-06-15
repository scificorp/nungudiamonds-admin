import { Icon } from "@iconify/react"
import { Button, Card, CardContent, CardHeader, Divider, Grid, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material"
import { Box } from "@mui/system"
import Router, { useRouter } from "next/router"
import React, { Fragment, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { IMG_ENDPOINT } from "src/AppConfig"
import { appErrors } from "src/AppConstants"
import TccSelect from "src/customComponents/Form-Elements/select"
import DeleteDataModel from "src/customComponents/delete-model"
import { GET_BY_ID_PRODUCTS, PRODUCT_IMAGE_DELETE } from "src/services/AdminServices"


const productTypeList = [

    {
        id: 1,
        name: "FeaturedImage",
    },
    {
        id: 2,
        name: "OtherImage"
    },
    {
        id: 3,
        name: "360 Images",
    },
    {
        id: 4,
        name: "Video",
    }
]

const showProductImageUpload = (data: any) => {
    const [metalToneList, setMetalToneList] = useState<any[]>([])
    const [productImagesList, setProductImagesList] = useState<any[]>([])
    const [displayImagesList, setDisplayImagesList] = useState<any[]>([])
    const [metalTone, setMetalTone] = useState('')
    const [productType, setProductType] = useState('')
    const [mainProductId, setmainProductId] = useState()
    const [productId, setProductId] = useState(0)
    const [showModel, setShowModel] = useState(false);
    const [imageId, setImageId] = useState()
    const router = useRouter()
    const { id } = router.query

    const deleteOnClickHandler = async (data: any) => {
        setImageId(data)
        setShowModel(!showModel)
    }

    /////////////////////// DELETE API ///////////////////////

    const toggleModel = (showdata: any) => {
        setShowModel(showdata)
    }

    const imageDeleteApi = async (data: any) => {

        const newFile = [...productImagesList]
        newFile.splice(newFile.indexOf(data), 1)
        setDisplayImagesList(newFile)

        const payload = {
            "id_product": mainProductId,
            "id": imageId,
        }

        try {
            const data = await PRODUCT_IMAGE_DELETE(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel)
                getByIdProductData(productId)
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }
        return false;
    }

    ////////////////// GETBYID API //////////////////

    const getByIdProductData = async (id: number) => {
        const data = await GET_BY_ID_PRODUCTS(id);
        if (data.code === 200 || data.code === "200") {
            setmainProductId(data.data.findProduct.id);
            setMetalToneList(data.data.metal_tone)
            setProductImagesList(data.data.findProduct.product_images)
            setDisplayImagesList(data.data.findProduct.product_images)
        }
    }

    useEffect(() => {
        const productImages = productImagesList.filter((t: any) => parseInt(t.image_type) == parseInt(productType) && parseInt(t.id_metal_tone) == parseInt(metalTone))
        setDisplayImagesList(productImages)
    }, [productType, metalTone])

    useEffect(() => {
        if (metalTone === "" && productType === "") {
            setDisplayImagesList(productImagesList)
        } else {
            if (metalTone === "" && productType !== "") {
                const productImages = productImagesList.filter((t: any) => parseInt(t.image_type) == parseInt(productType))
                setDisplayImagesList(productImages)
            }

            if (metalTone !== "" && productType === "") {
                const productImages = productImagesList.filter((t: any) => parseInt(t.id_metal_tone) == parseInt(metalTone))
                setDisplayImagesList(productImages)
            }
        }
    }, [metalTone, productType])

    useEffect(() => {
        let productDetailId: string = id as string

        if (productDetailId != undefined) {
            setProductId(parseInt(productDetailId))
            getByIdProductData(parseInt(productDetailId))
        }
    }, [router.isReady])
    return (
        <Fragment>
            <Button variant='contained' sx={{ ml: 5, mb: 4, '& svg': { mr: 2 } }} onClick={() => Router.push('/product/all-products')}>
                Back
            </Button>
            <Grid container spacing={6}>
                <Grid item xs={12} md={12} lg={12} sx={{ ml: 5 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex' }}>
                                <Grid xs={12} md={12} lg={6} sx={{ mr: 4 }}>
                                    <TccSelect
                                        fullWidth
                                        size='small'
                                        inputLabel="Select product Tone"
                                        label='Selete product Tone'
                                        id='controlled-select'
                                        value={metalTone}
                                        onChange={(e: any) => setMetalTone(e.target.value)}
                                        title='name'
                                        Options={metalToneList}
                                    />
                                </Grid>
                                <Grid xs={12} md={12} lg={6} sx={{ mr: 4 }}>
                                    <TccSelect
                                        fullWidth
                                        size='small'
                                        inputLabel="Select product Type"
                                        label='Selete product type'
                                        id='controlled-select'
                                        value={productType}
                                        onChange={(e: any) => setProductType(e.target.value)}
                                        title='name'
                                        Options={productTypeList}
                                    />
                                </Grid>
                            </Box>
                            <Box sx={{ mt: 5 }}>
                                <List component='nav' aria-label='main mailbox'>
                                    {displayImagesList.map((value: any) => {
                                        return (
                                            <>
                                                <Card sx={{ marginBottom: "10px" }}>
                                                    <ListItem disablePadding sx={{ display: "flex" }}>
                                                        <ListItemButton>
                                                            {value.image_type !== 4 ? <img src={`${IMG_ENDPOINT}/${value.image_path}`} height={50} width={50} /> : <video src={`${IMG_ENDPOINT}/${value.image_path}`} height={50} width={50} />}
                                                            <ListItemText sx={{ mt: 2, ml: 5 }} primary={value.image_path} />
                                                        </ListItemButton>
                                                        <IconButton>
                                                            <Icon icon='tabler:x' fontSize={20} onClick={() => deleteOnClickHandler(value.id)} />
                                                        </IconButton>
                                                    </ListItem>
                                                </Card>
                                            </>
                                        )
                                    })}
                                </List>
                            </Box>
                            <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={imageDeleteApi} />

                            <Box sx={{ display: "flex", justifyContent: "end" }}>
                                <Button variant='contained' sx={{ mt: 8 }} >
                                    SAVE
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </Fragment >
    )
}

export default showProductImageUpload