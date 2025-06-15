// ** MUI Imports
import { Icon } from '@iconify/react'
import { CardContent, CardHeader, Grid, Card, Typography, Button, FormControl, TextField, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import { Controller, useForm } from 'react-hook-form'
import { appErrors, FIELD_REQUIRED } from 'src/AppConstants'
import { ADD_OURSTORIES, EDIT_OURSTORIES, GET_BY_ID_OURSTORIES } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import Router, { useRouter } from 'next/router'

const OurStoriesComponent = () => {

    const [title, setTitle] = useState('')
    const [testid, setTestId] = useState(0);
    const [imageFile, setImageFile] = useState<any>()
    const [imageShow, setImageShow] = useState("")
    const [removeimage, setRemoveImage] = useState("0")
    const [editerData, setEditerData] = useState("")
    const [edit, setEdit] = useState<String>('<p></p>')
    const [called, setCalled] = useState(true)
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')

    const router = useRouter();
    const { id } = router.query;

    const defaultValues = {
        title: title,
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

    const clearFormDataHandler = () => {
        reset()
        setEditerData('<p><p>')
    }

    /////////////////////// GETBYID API ///////////////////////

    const getByIdData = async (detailId: any) => {

        try {
            const data = await GET_BY_ID_OURSTORIES(detailId);
            if (data.code === 200 || data.code === "200") {
                setTestId(data.data.id);
                setValue('title', data.data.title)
                setEdit(data.data.content)
                setImageShow(data.data.image_path);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }
        return false;
    }

    useEffect(() => {

        let detailId: string = id as string
        if (detailId != undefined) {
            setDialogTitle('Edit')
            setCalled(true)
            getByIdData(detailId)

        } else {
            setDialogTitle('Add')
            setCalled(true)
        }
        setTestId(parseInt(detailId))

    }, [router.isReady])

    /////////////////////// ADD API ///////////////////////

    const addApi = async (data: any) => {
        const formData = new FormData()
        formData.append("image", imageFile || "")
        formData.append("title", data.title)
        formData.append("content", editerData)

        try {
            const data = await ADD_OURSTORIES(formData);

            if (data.code === 200 || data.code === "200") {
                Router.push({ pathname: "/frontend/our-stories-sections/our-stories-list" })
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
        formData.append("image", imageFile || "")
        formData.append("id", testid)
        formData.append("title", data.title)
        formData.append("content", editerData)

        try {
            const data = await EDIT_OURSTORIES(formData);
            if (data.code === 200 || data.code === "200") {
                Router.push({ pathname: "/frontend/our-stories-sections/our-stories-list" })
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
            <Button variant='contained' sx={{ ml: 1, mb: 4, mt: -2, '& svg': { mr: 2 } }} onClick={() => Router.push("/frontend/our-stories-sections/our-stories-list")}>
                <Icon icon='material-symbols:arrow-back-rounded' />
                Back
            </Button>
            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        <CardHeader sx={{ mt: -5, ml: -5 }} title={`${dialogTitle} Our Stories`}></CardHeader>
                        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid item xs={12}>
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
                                                label='Title'
                                                onChange={(e) => setTitle(e.target.value)}
                                                error={Boolean(errors.title)}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.title && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography sx={{ mb: 1 }}>Description</Typography>
                                <TccEditor getHtmlData={setEditerData} data={edit} called={called} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography sx={{ mt: 4 }}>Image</Typography>
                                <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} onDropRejected={setImageFile} />
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
export default OurStoriesComponent