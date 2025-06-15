// ** MUI Imports
import { Icon } from '@iconify/react'
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, FormControl, TextField, FormHelperText } from '@mui/material'
import { Fragment, forwardRef, useEffect, useState } from 'react'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import { Controller, useForm } from 'react-hook-form'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { ADD_BLOG, EDIT_BLOG, GET_BY_ID_BLOG } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import Router, { useRouter } from 'next/router'
import TccSelect from 'src/customComponents/Form-Elements/select'
import { addDays, format } from 'date-fns'
import DatePickerWrapper from 'src/customComponents/Form-Elements/styles/data-picker'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import moment from 'moment'


interface PickerProps {
    label?: string
    start: Date | number
}

const statusType = [
    {
        id: "2",
        name: "published",
    },
    {
        id: "1",
        name: "unpublished"
    }
]
const AddBlog = () => {

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [author, setAuthor] = useState('')
    const [metatitle, setMetaTitle] = useState('')
    const [metakeyword, setMetaKeyword] = useState('')
    const [metadescription, setMetaDescription] = useState('')
    const [testid, setTestId] = useState(0);
    const [imageFile, setImageFile] = useState<string>()
    const [bannerimageFile, setBannerImageFile] = useState<string>()
    const [imageShow, setImageShow] = useState("")
    const [bannerimageshow, setBannerImageShow] = useState<string>()
    const [removeimage, setRemoveImage] = useState("0")
    const [editerData, setEditerData] = useState("")
    const [edit, setEdit] = useState<String>('<p></p>')
    const [called, setCalled] = useState(true)
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [statusTypeData, setStatusTypeData] = useState('')
    const [publishDate, setPublishDate] = useState<any>(new Date())

    const router = useRouter();
    const { id } = router.query;

    const defaultValues = {
        title: title,
        slug: slug,
        author: author,
        metatitle: metatitle,
        metadescription: metadescription,
        metakeyword: metakeyword,
    }

    const deafultDateData = () => {
        setPublishDate(new Date())
    }

    const CustomInput = forwardRef((props: PickerProps, ref) => {
        const publishDate = props.start !== null ? `${format(props.start, 'dd/MM/yyyy')}` : null

        const value = `${publishDate !== null ? publishDate : ''}`

        return <TextField
            sx={{ mb: 4 }}
            size='small'
            fullWidth
            inputRef={ref}
            label={props.label || ''} {...props}
            value={value}
        />
    })
    const {
        control,
        setValue,
        reset,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues
    })

    const clearFormDataHandler = () => {
        reset()
        setEditerData('<p><p>')
    }
    /////////////////////// GETBYID API ///////////////////////
    const getByIdData = async (data: any) => {
        const payload = {
            "id": data,
        };
        try {
            const data = await GET_BY_ID_BLOG(payload);
            if (data.code === 200 || data.code === "200") {
                setTestId(data.data.id);
                setMetaTitle(data.data.meta_title)
                setValue('title', data.data.name)
                setValue('slug', data.data.slug)
                setEdit(data.data.description)
                setValue('author', data.data.author)
                setValue('metatitle', data.data.meta_title)
                setValue('metakeyword', data.data.meta_keywords)
                setValue('metadescription', data.data.meta_description)
                setStatusTypeData(data.data.is_status)
                setImageShow(data.data.image_path);
                setPublishDate(new Date(data.data.publish_date))
                setBannerImageShow(data.data.banner_image_path);
                setTestId(data.data.id);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;

    }

    useEffect(() => {

        let blogId: string = id as string
        if (blogId != undefined) {
            setDialogTitle('Edit')
            setCalled(true)
            getByIdData(blogId)

        } else {
            setDialogTitle('Add')
            deafultDateData()
            setCalled(true)
        }
        setTestId(parseInt(blogId))

    }, [router.isReady])

    /////////////////////// ADD API ///////////////////////

    const addApi = async (data: any) => {

        const formData = new FormData()
        formData.append("images", imageFile || "")
        formData.append("banner_image", bannerimageFile || "")
        formData.append("name", data.title)
        formData.append("slug", data.slug)
        formData.append("description", editerData)
        formData.append("author", data.author)
        formData.append("meta_title", data.metatitle)
        formData.append("meta_description", data.metadescription)
        formData.append("meta_keywords", data.metakeyword)
        formData.append("is_status", statusTypeData || "")
        formData.append("publish_date", moment(publishDate).format("YYYY-MM-DD"))

        try {
            const data = await ADD_BLOG(formData);
            if (data.code === 200 || data.code === "200") {
                Router.push({ pathname: "/frontend/blog/blog-list" })
                toast.success(data.message);
                clearFormDataHandler();
            }
            else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    /////////////////////// EDIT API ///////////////////////

    const editApi = async (data: any) => {
        const formData: any = new FormData()
        formData.append("images", imageFile || "")
        formData.append("id", testid)
        formData.append("banner_image", bannerimageFile || "")
        formData.append("meta_title", data.metatitle)
        formData.append("meta_description", data.metadescription)
        formData.append("meta_keywords", data.metakeyword)
        formData.append("name", data.title)
        formData.append("slug", data.slug)
        formData.append("description", editerData)
        formData.append("author", data.author)
        formData.append("is_status", statusTypeData || "")
        formData.append("publish_date", moment(publishDate).format("YYYY-MM-DD"))


        try {
            const data = await EDIT_BLOG(formData);
            if (data.code === 200 || data.code === "200") {
                Router.push({ pathname: "/frontend/blog/blog-list" })
                toast.success(data.message);
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
            <Button variant='contained' sx={{ ml: 1, mb: 4, mt: -2, '& svg': { mr: 2 } }} onClick={() => Router.back()}>
                <Icon icon='material-symbols:arrow-back-rounded' />
                Back
            </Button>
            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        <CardHeader sx={{ mt: -5, ml: -5 }} title={`${dialogTitle} Blog`}></CardHeader>
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='metatitle'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (
                                            <TextField
                                                autoFocus
                                                size='small'
                                                value={metatitle}
                                                label='Meta Title'
                                                onChange={(e) => setMetaTitle(e.target.value)}
                                                error={Boolean(errors.metatitle)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.metatitle && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='metakeyword'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (
                                            <TextField
                                                autoFocus
                                                size='small'
                                                value={metakeyword}
                                                label='Meta Keyword'
                                                onChange={(e) => setMetaKeyword(e.target.value)}
                                                error={Boolean(errors.metakeyword)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.metakeyword && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='metadescription'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (
                                            <TextField
                                                autoFocus
                                                size='small'
                                                value={metadescription}
                                                label='Meta Description'
                                                onChange={(e) => setMetaDescription(e.target.value)}
                                                error={Boolean(errors.metadescription)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.metadescription && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <DatePickerWrapper>
                                    <DatePicker
                                        selected={publishDate}
                                        id='specific-date'
                                        shouldCloseOnSelect={true}
                                        onChange={(date: Date) => setPublishDate(date)}
                                        customInput={<CustomInput label='Select Date' start={publishDate as Date | number} />}
                                    />
                                </DatePickerWrapper>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='title'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (
                                            <TextField
                                                autoFocus
                                                size='small'
                                                value={title}
                                                label='Blog Title'
                                                onChange={(e) => setTitle(e.target.value)}
                                                error={Boolean(errors.title)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.title && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='slug'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (
                                            <TextField
                                                autoFocus
                                                size='small'
                                                value={slug}
                                                label='slug'
                                                onChange={(e) => setSlug(e.target.value)}
                                                error={Boolean(errors.slug)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.slug && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <Controller
                                        name='author'
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }: any) => (
                                            <TextField
                                                autoFocus
                                                size='small'
                                                value={author}
                                                label='Author Name'
                                                onChange={(e) => setAuthor(e.target.value)}
                                                error={Boolean(errors.author)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.author && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <TccSelect
                                    fullWidth
                                    size='small'
                                    inputLabel="Select Status"
                                    label='Selete Status'
                                    id='controlled-select'
                                    value={statusTypeData}
                                    onChange={(e: any) => setStatusTypeData(e.target.value)}
                                    title='name'
                                    Options={statusType}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography sx={{ mb: 1 }}>Description</Typography>
                                <TccEditor getHtmlData={setEditerData} data={edit} called={called} />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography sx={{ mt: 4 }}>Image</Typography>
                                <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography sx={{ mt: 4 }}>Banner Image</Typography>
                                <TccSingleFileUpload onDrop={setBannerImageFile} onClick={removeimage} imageFile={bannerimageshow} />
                            </Grid>

                            <Grid item xs={12} sm={12} sx={{ display: "flex", justifyContent: "end", mt: 4 }}>
                                <Button variant='contained' sx={{ mr: 3 }} type="submit">
                                    {dialogTitle === "Add" ? "SUBMIT" : "EDIT"}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </form>
            </Card>
        </>
    )
}
export default AddBlog