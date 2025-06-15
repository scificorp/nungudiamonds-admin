import { Icon } from '@iconify/react'
import { CardContent, CardHeader, Grid, Card, Typography, Button, FormControl, TextField, FormHelperText, Autocomplete } from '@mui/material'
import { useEffect, useState } from 'react'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import { Controller, useForm } from 'react-hook-form'
import { appErrors, FIELD_REQUIRED } from 'src/AppConstants'
import { ADD_PRODUCT_DROPDOWN_LIST, GIFTSET_ADD, GIFTSET_EDIT, GIFTSET_GET_BY_ID, GIFTSET_IMAGE_DELETE } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import Router, { useRouter } from 'next/router'
import TccSelect from 'src/customComponents/Form-Elements/select'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import TccMultipleImageUpload from 'src/customComponents/Form-Elements/file-upload/image-upload'
import DeleteDataModel from 'src/customComponents/delete-model'

const genderData: any = [
    {
        id: 1,
        name: "Male",
    },
    {
        id: 2,
        name: "Female",
    },
    {
        id: 3,
        name: "Unisex"
    }
]
const AddGiftSet = () => {

    const [productSku, setProductSku] = useState('')
    const [productName, setProductName] = useState('')
    const [shortDescription, setShortDescription] = useState('')
    const [keyword, setKeyword] = useState<{ id: null, name: "" }[]>([])
    const [keywordsList, setKeywordsList] = useState([])
    const [gender, setGender] = useState<{ id: null, name: "" }[]>([])
    const [price, setPrice] = useState('')
    const [editerData, setEditerData] = useState("")
    const [edit, setEdit] = useState<String>('<p></p>')
    const [called, setCalled] = useState(true)
    const [testid, setTestId] = useState('');
    const [imageFile, setImageFile] = useState<string>()
    const [bannerimageFile, setBannerImageFile] = useState([])
    const [imageShow, setImageShow] = useState("")
    const [bannerimageshow, setBannerImageShow] = useState('')
    const [removeimage, setRemoveImage] = useState("0")
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [isDisabled, setIsDisabled] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [deleteImageId, setDeleteImageId] = useState()
    const router = useRouter();
    const { slug, action } = router.query;

    const defaultValues = {
        productSku: productSku,
        productName: productName,
        shortDescription: shortDescription,
        price: price,
    }

    const {
        control,
        setValue,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues
    })

    useEffect(() => {
        if (action == 'view') {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [action])

    const deleteOnClickHandler = async (data: any) => {
        setDeleteImageId(data)
        setShowModel(!showModel)
    }

    const clearFormDataHandler = () => {
        reset()
        setImageShow("")
        setBannerImageShow("")
    }

    /////////////////////// GETBYID API ///////////////////////

    const getByIdData = async (dropDownData: any, slugData: any) => {

        const payload = {
            "slug": slugData,

        };
        try {
            const data = await GIFTSET_GET_BY_ID(payload);

            if (data.code === 200 || data.code === "200") {
                setImageShow(data.data.gift_product_images.filter((t: any) => t.image_type == 1)[0].image_path)
                setBannerImageShow(data.data.gift_product_images.filter((t: any) => t.image_type == 2))
                setTestId(data.data.id);
                setValue('productName', data.data.product_title)
                setValue('productSku', data.data.sku)
                setValue('shortDescription', data.data.short_des)
                setEdit(data.data.long_des)
                const tags = dropDownData.keyWords?.filter((t: any) => {
                    if (data.data.tags.indexOf(parseInt(t.id)) >= 0) return t;
                });
                setKeyword(tags)

                const gender: any = genderData?.filter((t: any) => {
                    if (data.data.genders.indexOf(parseInt(t.id)) >= 0) return t;
                });
                setGender(gender)
                setValue('price', data.data.price)

            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;

    }

    /////////////////////// DROPDOWN DATA /////////////////

    const getAllDropDownData = async (productSlug: any) => {
        try {
            const data = await ADD_PRODUCT_DROPDOWN_LIST();
            if (data.code === 200 || data.code === "200") {

                setKeywordsList(data.data.keyWords)
                if (productSlug && productSlug != undefined) {
                    getByIdData(data.data, productSlug)
                }
            } else {

                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    useEffect(() => {

        let slugData: string = slug as string
        if (slugData != undefined) {
            setDialogTitle('Edit')
            setCalled(true)
            getAllDropDownData(slugData)
        } else {
            getAllDropDownData(undefined)
            setDialogTitle('Add')
            setCalled(true)
        }
    }, [router.isReady])

    /////////////////////// ADD API ///////////////////////

    const addApi = async (data: any) => {
        if (!imageFile) {
            toast.error("image is required", {
                position: "top-right"
            });
        } else {
            const formData = new FormData()
            formData.append("thumb_images", imageFile || "")
            bannerimageFile && bannerimageFile.map((t: any) => { formData.append("featured_images", t) })
            formData.append("product_title", data.productName)
            formData.append("sku", data.productSku)
            gender.map((id: any, index) => formData.append(`gender[${index}]`, id.id))
            formData.append("long_description", editerData)
            formData.append("short_description", data.shortDescription)
            keyword.map((id: any, index) => formData.append(`tags[${index}]`, id.id))
            formData.append("price", data.price)
            try {
                const data = await GIFTSET_ADD(formData);
                if (data.code === 200 || data.code === "200") {
                    Router.push({ pathname: "/product/gift-set/gift-list" })
                    toast.success(data.message);
                    clearFormDataHandler();
                }
                else {
                    return toast.error(data.message);
                }
            } catch (e: any) {
                toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
            }
        }
        return false;
    }

    /////////////////////// EDIT API ///////////////////////

    const editApi = async (data: any) => {
        const formData = new FormData()
        formData.append("id", testid)
        formData.append("thumb_images", imageFile || "")
        bannerimageFile && bannerimageFile.map((t: any) => { formData.append("featured_images", t) })
        formData.append("product_title", data.productName)
        formData.append("sku", data.productSku)
        gender.map((id: any, index) => formData.append(`gender[${index}]`, id.id))
        formData.append("long_description", editerData)
        formData.append("short_description", data.shortDescription)
        keyword.map((id: any, index) => formData.append(`tags[${index}]`, id.id))
        formData.append("price", data.price)

        try {
            const data = await GIFTSET_EDIT(formData);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                Router.push({ pathname: "/product/gift-set/gift-list" })
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }


    /////////////////////// DELETE API ///////////////////////

    const toggleModel = (showdata: any) => {
        setShowModel(showdata)
    }

    const imageDeleteApi = async () => {

        const payload = {
            "id_product": testid,
            "id": deleteImageId,
        }

        try {
            const data = await GIFTSET_IMAGE_DELETE(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel)

            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }
        return false;
    }

    const onSubmit = (data: any) => {
        if (dialogTitle === 'Add') {
            addApi(data)

        } else {
            editApi(data)
        }
    }



    return (
        <>
            <Button variant='contained' sx={{ ml: 3, mb: 4, mt: -2, '& svg': { mr: 2 } }} onClick={() => Router.back()}>
                <Icon icon='material-symbols:arrow-back-rounded' />
                Back
            </Button>
            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        {action === "view" ? <></> : <CardHeader sx={{ mt: -5, ml: -5 }} title={`${dialogTitle} Gift Set`}></CardHeader>}
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='productSku'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (
                                            <TextField
                                                InputProps={{
                                                    readOnly: isDisabled,
                                                }}
                                                autoFocus
                                                size='small'
                                                value={productSku}
                                                label='Product SKU'
                                                onChange={(e) => setProductSku(e.target.value)}
                                                error={Boolean(errors.productSku)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.productSku && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='productName'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (
                                            <TextField
                                                InputProps={{
                                                    readOnly: isDisabled,
                                                }}
                                                autoFocus
                                                size='small'
                                                value={productName}
                                                label='Product Title'
                                                onChange={(e) => setProductName(e.target.value)}
                                                error={Boolean(errors.productName)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.productName && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='shortDescription'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (
                                            <TextField
                                                InputProps={{
                                                    readOnly: isDisabled,
                                                }}
                                                autoFocus
                                                size='small'
                                                value={shortDescription}
                                                label='Product Short Description'
                                                onChange={(e) => setShortDescription(e.target.value)}
                                                error={Boolean(errors.shortDescription)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.shortDescription && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Autocomplete
                                    readOnly={isDisabled}
                                    fullWidth
                                    multiple
                                    options={keywordsList}
                                    value={keyword}
                                    onChange={(event, newItem) => {
                                        setKeyword(newItem)
                                    }}
                                    filterSelectedOptions
                                    size='small'
                                    id='autocomplete-multiple-outlined'
                                    getOptionLabel={(option: any) => option.name}
                                    renderInput={(params: any) => <TextField {...params} label='Keywords' />}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Autocomplete
                                    readOnly={isDisabled}
                                    fullWidth
                                    multiple
                                    options={genderData}
                                    value={gender}
                                    onChange={(event, newItem) => {

                                        setGender(newItem)
                                    }}
                                    filterSelectedOptions
                                    size='small'
                                    id='autocomplete-multiple-outlined'
                                    getOptionLabel={(option: any) => option.name}
                                    renderInput={(params: any) => <TextField {...params} label='Gender' />}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='price'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (

                                            <TextField
                                                InputProps={{
                                                    readOnly: isDisabled,
                                                }}
                                                autoFocus
                                                type='number'
                                                size='small'
                                                value={price}
                                                label='Price'
                                                onChange={(e) => setPrice(e.target.value)}
                                                error={Boolean(errors.price)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.price && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography sx={{ mb: 1, mt: 5 }}>Product Long Description</Typography>
                                <TccEditor getHtmlData={setEditerData} data={edit} called={called} />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography sx={{ mt: 4 }}>Thumb image</Typography>
                                <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />
                            </Grid>

                            <Grid item xs={6}>
                                <Typography sx={{ mt: 4 }}>Feature Images</Typography>
                                <TccMultipleImageUpload onDrop={setBannerImageFile} onClick={removeimage} onDeleteClick={(data: any) => deleteOnClickHandler(data)} imageFile={bannerimageshow} />
                            </Grid>

                            <Grid item xs={12} sm={12} sx={{ display: "flex", justifyContent: "end", mt: 4 }}>
                                {action === "view" ? <></> : <Button variant='contained' sx={{ mr: 3 }} type="submit">
                                    {dialogTitle === "Add" ? "SUBMIT" : "EDIT"}
                                </Button>}
                            </Grid>
                        </Grid>
                    </CardContent>
                </form>
            </Card>
            <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={imageDeleteApi} />
        </>
    )
}
export default AddGiftSet