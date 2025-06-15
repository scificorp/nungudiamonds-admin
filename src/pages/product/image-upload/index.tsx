import { Icon } from "@iconify/react"
import { Button, Card, CardContent, CardHeader, Divider, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, Chip, Tooltip } from "@mui/material"
import { Box } from "@mui/system"
import Router, { useRouter } from "next/router"
import { Fragment, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { IMG_ENDPOINT } from "src/AppConfig"
import { appErrors } from "src/AppConstants"
import TccMultipleImageUpload from "src/customComponents/Form-Elements/file-upload/image-upload"
import TccMultipleVideoUpload from "src/customComponents/Form-Elements/file-upload/videoFile-upload"
import TccSelect from "src/customComponents/Form-Elements/select"
import DeleteDataModel from "src/customComponents/delete-model"
import { ADD_PRODUCT_IMAGES, ADD_PRODUCT_VIDEO, GET_BY_ID_PRODUCTS, METAL_TONE_DROPDOWN_LIST, PRODUCT_IMAGE_DELETE } from "src/services/AdminServices"
import { number, string } from "yup"


const ProductImageUpload = (data: any) => {
    const [colorToneImageUpload, setColorToneImageUpload] = useState([{ colorTone: "", imageUpload: [], featuredImageUpload: [], featuredVideoUpload: [], rotedImageUpload: [], id: 0, isDeleted: 0 }])
    const [metalToneList, setMetalToneList] = useState<any[]>([])
    const [metalToneValue, setMetalToneValue] = useState('')
    const [allImageData, setAllImageData] = useState('')
    const [imageData, setImageData] = useState([])
    const [featuredImage, setFeaturedImage] = useState([])
    const [rotedImage, setrotedImage] = useState([])
    const [productVideo, setProductVideo] = useState([])
    const [productId, setProductId] = useState(0)
    const [count, setCount] = useState(1)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedImageId, setSelectedImageId] = useState(0)
    const [selectedImageType, setSelectedImageType] = useState('')
    const [refreshImages, setRefreshImages] = useState(false)

    const router = useRouter()
    const { id } = router.query



    const getByIdProductData = async (id: number) => {
        const data = await GET_BY_ID_PRODUCTS(id);
        if (data.code === 200 || data.code === "200") {
            const metalTone: any[] = []
            data.data.metal_tone.map((t: any) => {
                const rotedImagesData = data.data.findProduct.product_images.filter((value: any) => value.id_metal_tone == parseInt(t.id) && value.image_type == 3)
                const imageData = data.data.findProduct.product_images.filter((value: any) => value.id_metal_tone == parseInt(t.id) && value.image_type == 2)
                const productVideoData = data.data.findProduct.product_images.filter((value: any) => value.id_metal_tone == parseInt(t.id) && value.image_type == 4)
                const featuredImageData = data.data.findProduct.product_images.filter((value: any) => value.id_metal_tone == parseInt(t.id) && value.image_type == 1)

                metalTone.push({
                    ...t,
                    metalToneValue: t.id,
                    rotedImage: rotedImagesData.map((t: any) => t.image_path),
                    imageData: imageData.map((t: any) => t.image_path),
                    productVideo: productVideoData.map((t: any) => t.image_path),
                    featuredImage: featuredImageData.map((t: any) => t.image_path),
                })
            })
            setMetalToneList(metalTone)

        }
    }

    const getMetalToneList = async (id: number) => {

        const payload = {
            product_id: id
        }

        try {
            const data = await METAL_TONE_DROPDOWN_LIST(payload);
            if (data.code === 200 || data.code === "200") {
                if (data.data && data.data.length > 0) {
                    const metalTone: any[] = []
                    data.data.map((t: any) => {
                        metalTone.push({
                            ...t,
                            metalToneValue: "",
                            rotedImage: [],
                            imageData: [],
                            productVideo: [],
                            featuredImage: []
                        })
                    })
                    setMetalToneList(metalTone)
                }


            } else {

                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    // Handle image deletion
    const handleDeleteImage = (imageId: number, imageType: string) => {
        setSelectedImageId(imageId)
        setSelectedImageType(imageType)
        setShowDeleteModal(true)
    }

    // Toggle delete modal
    const toggleDeleteModal = (showData: boolean) => {
        setShowDeleteModal(showData)
    }

    // Delete image API call
    const deleteImageApi = async () => {
        const payload = {
            "id_product": productId,
            "id": selectedImageId,
        }

        try {
            const data = await PRODUCT_IMAGE_DELETE(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowDeleteModal(false)
                setRefreshImages(!refreshImages) // Trigger refresh
                getByIdProductData(productId) // Refresh data
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }
    }

    useEffect(() => {
        let productDetailId: string = id as string

        if (productDetailId != undefined) {
            setProductId(parseInt(productDetailId))
            getByIdProductData(parseInt(productDetailId))
            getMetalToneList(parseInt(productDetailId))
        }
    }, [router.isReady, refreshImages])

    const productImagesAdd = async (index: number) => {

        const objAtIndex = metalToneList[index];

        if (objAtIndex.imageData.length <= 0) {
            return
        }

        const formData = new FormData()
        formData.append("id_product", productId.toString())
        formData.append("id_metal_tone", objAtIndex.metalToneValue)
        formData.append("image_type", "2")

        objAtIndex.imageData.map((t: any) => {
            formData.append("images", t)
        })
        try {
            const data = await ADD_PRODUCT_IMAGES(formData);
            if (data.code === 200 || data.code === "200") {

                setMetalToneValue('')
                const metalData = metalToneList;
                metalData[index].imageData = data
                setMetalToneList([...metalData])
                return (toast.success(data.message))
            }
            else {
                toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    const productFeaturedImages = async (index: number) => {
        const objAtIndex = metalToneList[index];
        if (objAtIndex.metalToneValue == '') {
            toast.error("Metal Tone is required", {
                position: "top-right"
            });
        }
        if (objAtIndex.featuredImage.length <= 0) {
            toast.error("image is required", {
                position: "top-left"
            });

        } else {
            const formData = new FormData()
            formData.append("id_product", productId.toString())
            formData.append("id_metal_tone", objAtIndex.metalToneValue)
            formData.append("image_type", "1")
            objAtIndex.featuredImage.map((t: any) => {
                formData.append("images", t)
            })

            try {
                const data = await ADD_PRODUCT_IMAGES(formData);
                if (data.code === 200 || data.code === "200") {
                    setMetalToneValue('')
                    const metalData = metalToneList;
                    metalData[index].featuredImage = data
                    setMetalToneList([...metalData])
                    return (toast.success(data.message))
                }
                else {
                    toast.error(data.message);
                }
            } catch (e: any) {
                toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
            }
        }

    }

    const product360Images = async (index: number) => {

        const objAtIndex = metalToneList[index];

        if (objAtIndex.rotedImage.length <= 0) {
            return
        }

        const formData = new FormData()
        formData.append("id_product", productId.toString())
        formData.append("id_metal_tone", objAtIndex.metalToneValue)
        formData.append("image_type", "3")

        objAtIndex.rotedImage.map((t: any) => {
            formData.append("images", t)
        })

        try {
            const data = await ADD_PRODUCT_IMAGES(formData);
            if (data.code === 200 || data.code === "200") {
                setMetalToneValue('')
                const metalData = metalToneList;
                metalData[index].rotedImage = data
                setMetalToneList([...metalData])
                return (toast.success(data.message))
            }
            else {
                toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    const productVideoUpload = async (index: number) => {

        const objAtIndex = metalToneList[index];

        if (objAtIndex.productVideo.length <= 0) {
            toast.error("Product Video is required", {
                position: "top-right"
            });

        } else {
            const formData = new FormData()
            formData.append("id_product", productId.toString())
            formData.append("id_metal_tone", objAtIndex.metalToneValue)
            formData.append("image_type", "4")

            objAtIndex.productVideo.map((t: any) => {
                formData.append("images", t)
            })
            try {
                const data = await ADD_PRODUCT_IMAGES(formData);
                if (data.code === 200 || data.code === "200") {
                    setMetalToneValue('')
                    const metalData = metalToneList;
                    metalData[index].productVideo = data
                    setMetalToneList([...metalData])
                    return (toast.success(data.message))
                }
                else {
                    toast.error(data.message);
                }
            } catch (e: any) {
                toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
            }
        }

    }


    // useEffect(() => {
    //     if (imageData != undefined && metalToneValue != "") {
    //         productImagesAdd()
    //     }
    // }, [imageData])

    // useEffect(() => {
    //     if (featuredImage != undefined && metalToneValue != "") {
    //         productFeaturedImages()
    //     }
    // }, [featuredImage])

    // useEffect(() => {
    //     if (rotedImage != undefined && metalToneValue != "") {
    //         product360Images()
    //     }
    // }, [rotedImage])

    // useEffect(() => {
    //     if (productVideo != undefined && metalToneValue != "") {
    //         productVideoUpload()
    //     }
    // }, [productVideo])


    return (
        <Fragment>
            <Button variant='contained' sx={{ ml: 5, mb: 4, '& svg': { mr: 2 } }} onClick={() => Router.back()}>
                <Icon icon='material-symbols:arrow-back-rounded' />
                Back
            </Button>
            <Box sx={{ display: "flex", justifyContent: "end" }}>
                <Button variant='contained' sx={{ mt: -13, mb: 4, '& svg': { mr: 2 } }} onClick={(data: any) => Router.push({ pathname: "/product/show-image-upload", query: { id: id } })}>
                    View / Delete
                </Button>
            </Box>
            <Grid container spacing={6}>
                {metalToneList && metalToneList.map((value, i) => {
                    return (
                        <Grid item xs={12} md={12} lg={12} sx={{ ml: 5 }}>

                            <Card key={i}>
                                <CardContent>
                                    <Box sx={{ display: 'flex' }}>
                                        <Grid xs={6} md={12} lg={6} sx={{ mr: 4 }}>
                                            <Typography variant="body2" sx={{ mb: 2 }}>Tone</Typography>
                                            <TccSelect
                                                fullWidth
                                                size='small'
                                                inputLabel="Selete product Tone"
                                                label='Selete product Tone'
                                                id='controlled-select'
                                                value={value.metalToneValue}
                                                title='name'
                                                onChange={(e: any) => {
                                                    const metalData = metalToneList;
                                                    metalData[i].metalToneValue = e.target.value
                                                    setMetalToneList([...metalData])
                                                }}
                                                Options={metalToneList}
                                            />
                                        </Grid>
                                        <Grid xs={6} md={12} lg={6}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                                <Typography variant="body2" sx={{ mb: 2 }}>Video Upload</Typography>
                                            </Box>
                                            <TccMultipleVideoUpload onDrop={(data: any) => {
                                                const metalData = metalToneList;
                                                metalData[i].productVideo = data
                                                setMetalToneList([...metalData])
                                            }} />

                                            {/* Display existing videos */}
                                            {value.productVideo && value.productVideo.length > 0 && typeof value.productVideo[0] === 'string' && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>Existing Videos:</Typography>
                                                    <Grid container spacing={1}>
                                                        {value.productVideo.map((videoPath: string, vidIndex: number) => {
                                                            // Extract video ID from the product_images array
                                                            const videoObj = data.data?.findProduct?.product_images?.find(
                                                                (img: any) => img.image_path === videoPath &&
                                                                             parseInt(img.image_type) === 4 &&
                                                                             parseInt(img.id_metal_tone) === parseInt(value.metalToneValue)
                                                            );
                                                            const videoId = videoObj?.id;

                                                            return (
                                                                <Grid item xs={12} md={6} key={`video-${vidIndex}`}>
                                                                    <Box sx={{ position: 'relative', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                                        <video
                                                                            src={`${IMG_ENDPOINT}/${videoPath}`}
                                                                            controls
                                                                            style={{ width: '100%', maxHeight: '150px' }}
                                                                        />
                                                                        {videoId && (
                                                                            <IconButton
                                                                                size="small"
                                                                                sx={{
                                                                                    position: 'absolute',
                                                                                    top: 5,
                                                                                    right: 5,
                                                                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                                                                    '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' }
                                                                                }}
                                                                                onClick={() => handleDeleteImage(videoId, 'Video')}
                                                                            >
                                                                                <Icon icon='tabler:trash' fontSize={16} color="error" />
                                                                            </IconButton>
                                                                        )}
                                                                    </Box>
                                                                </Grid>
                                                            );
                                                        })}
                                                    </Grid>
                                                </Box>
                                            )}
                                        </Grid>
                                    </Box>
                                    <Box>
                                        <Grid container spacing={6}>
                                            <Grid item xs={12} md={4} lg={4}>
                                                <Typography variant="body2" sx={{ mb: 2, mt: 4 }}>Image Upload</Typography>
                                                <TccMultipleImageUpload onDrop={(data: any) => {
                                                    const metalData = metalToneList;
                                                    metalData[i].imageData = data
                                                    setMetalToneList([...metalData])
                                                }} />

                                                {/* Display existing images */}
                                                {value.imageData && value.imageData.length > 0 && typeof value.imageData[0] === 'string' && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>Existing Images:</Typography>
                                                        <Grid container spacing={1}>
                                                            {value.imageData.map((imagePath: string, imgIndex: number) => {
                                                                // Extract image ID from the product_images array
                                                                const imageObj = data.data?.findProduct?.product_images?.find(
                                                                    (img: any) => img.image_path === imagePath &&
                                                                                 parseInt(img.image_type) === 2 &&
                                                                                 parseInt(img.id_metal_tone) === parseInt(value.metalToneValue)
                                                                );
                                                                const imageId = imageObj?.id;

                                                                return (
                                                                    <Grid item xs={6} md={4} key={`img-${imgIndex}`}>
                                                                        <Box sx={{ position: 'relative', height: '100px', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                                            <img
                                                                                src={`${IMG_ENDPOINT}/${imagePath}`}
                                                                                alt={`Product image ${imgIndex+1}`}
                                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                            />
                                                                            {imageId && (
                                                                                <IconButton
                                                                                    size="small"
                                                                                    sx={{
                                                                                        position: 'absolute',
                                                                                        top: 0,
                                                                                        right: 0,
                                                                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                                                                        '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' }
                                                                                    }}
                                                                                    onClick={() => handleDeleteImage(imageId, 'Regular Image')}
                                                                                >
                                                                                    <Icon icon='tabler:trash' fontSize={16} color="error" />
                                                                                </IconButton>
                                                                            )}
                                                                        </Box>
                                                                    </Grid>
                                                                );
                                                            })}
                                                        </Grid>
                                                    </Box>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} md={4} lg={4}>
                                                <Typography variant="body2" sx={{ mb: 2, mt: 4 }}>Featured Image Upload</Typography>
                                                <TccMultipleImageUpload onDrop={(data: any) => {
                                                    const metalData = metalToneList;
                                                    metalData[i].featuredImage = data
                                                    setMetalToneList([...metalData])
                                                }} />

                                                {/* Display existing featured images */}
                                                {value.featuredImage && value.featuredImage.length > 0 && typeof value.featuredImage[0] === 'string' && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>Existing Featured Images:</Typography>
                                                        <Grid container spacing={1}>
                                                            {value.featuredImage.map((imagePath: string, imgIndex: number) => {
                                                                // Extract image ID from the product_images array
                                                                const imageObj = data.data?.findProduct?.product_images?.find(
                                                                    (img: any) => img.image_path === imagePath &&
                                                                                 parseInt(img.image_type) === 1 &&
                                                                                 parseInt(img.id_metal_tone) === parseInt(value.metalToneValue)
                                                                );
                                                                const imageId = imageObj?.id;

                                                                return (
                                                                    <Grid item xs={6} md={4} key={`featured-${imgIndex}`}>
                                                                        <Box sx={{ position: 'relative', height: '100px', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                                            <img
                                                                                src={`${IMG_ENDPOINT}/${imagePath}`}
                                                                                alt={`Featured image ${imgIndex+1}`}
                                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                            />
                                                                            <Chip
                                                                                label="Featured"
                                                                                size="small"
                                                                                color="primary"
                                                                                sx={{ position: 'absolute', bottom: 2, left: 2 }}
                                                                            />
                                                                            {imageId && (
                                                                                <IconButton
                                                                                    size="small"
                                                                                    sx={{
                                                                                        position: 'absolute',
                                                                                        top: 0,
                                                                                        right: 0,
                                                                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                                                                        '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' }
                                                                                    }}
                                                                                    onClick={() => handleDeleteImage(imageId, 'Featured Image')}
                                                                                >
                                                                                    <Icon icon='tabler:trash' fontSize={16} color="error" />
                                                                                </IconButton>
                                                                            )}
                                                                        </Box>
                                                                    </Grid>
                                                                );
                                                            })}
                                                        </Grid>
                                                    </Box>
                                                )}
                                            </Grid>
                                            <Grid item xs={12} md={4} lg={4}>
                                                <Typography variant="body2" sx={{ mb: 2, mt: 4 }}>360 Image Upload</Typography>
                                                <TccMultipleImageUpload onDrop={(data: any) => {
                                                    const metalData = metalToneList;
                                                    metalData[i].rotedImage = data
                                                    setMetalToneList([...metalData])
                                                }} />

                                                {/* Display existing 360 images */}
                                                {value.rotedImage && value.rotedImage.length > 0 && typeof value.rotedImage[0] === 'string' && (
                                                    <Box sx={{ mt: 2 }}>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>Existing 360° Images:</Typography>
                                                        <Grid container spacing={1}>
                                                            {value.rotedImage.map((imagePath: string, imgIndex: number) => {
                                                                // Extract image ID from the product_images array
                                                                const imageObj = data.data?.findProduct?.product_images?.find(
                                                                    (img: any) => img.image_path === imagePath &&
                                                                                 parseInt(img.image_type) === 3 &&
                                                                                 parseInt(img.id_metal_tone) === parseInt(value.metalToneValue)
                                                                );
                                                                const imageId = imageObj?.id;

                                                                return (
                                                                    <Grid item xs={6} md={4} key={`360-${imgIndex}`}>
                                                                        <Box sx={{ position: 'relative', height: '100px', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                                            <img
                                                                                src={`${IMG_ENDPOINT}/${imagePath}`}
                                                                                alt={`360 image ${imgIndex+1}`}
                                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                            />
                                                                            <Chip
                                                                                label="360°"
                                                                                size="small"
                                                                                color="secondary"
                                                                                sx={{ position: 'absolute', bottom: 2, left: 2 }}
                                                                            />
                                                                            {imageId && (
                                                                                <IconButton
                                                                                    size="small"
                                                                                    sx={{
                                                                                        position: 'absolute',
                                                                                        top: 0,
                                                                                        right: 0,
                                                                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                                                                        '&:hover': { backgroundColor: 'rgba(255,0,0,0.1)' }
                                                                                    }}
                                                                                    onClick={() => handleDeleteImage(imageId, '360 Image')}
                                                                                >
                                                                                    <Icon icon='tabler:trash' fontSize={16} color="error" />
                                                                                </IconButton>
                                                                            )}
                                                                        </Box>
                                                                    </Grid>
                                                                );
                                                            })}
                                                        </Grid>
                                                    </Box>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Box>
                                    <Box sx={{ display: "flex", justifyContent: "end" }}>
                                        <Button variant='contained' sx={{ mt: 8 }} onClick={() => {
                                            productImagesAdd(i)
                                            productFeaturedImages(i)
                                            product360Images(i)
                                            productVideoUpload(i)
                                        }}>
                                            SAVE
                                        </Button>
                                    </Box>

                                </CardContent>
                            </Card>
                        </Grid>
                    )
                })}

            </Grid>

            {/* Delete confirmation modal */}
            <DeleteDataModel
                showModel={showDeleteModal}
                toggle={toggleDeleteModal}
                onClick={deleteImageApi}
                title={`Delete ${selectedImageType}`}
                description={`Are you sure you want to delete this ${selectedImageType.toLowerCase()}? This action cannot be undone.`}
            />
        </Fragment >
    )
}

export default ProductImageUpload
