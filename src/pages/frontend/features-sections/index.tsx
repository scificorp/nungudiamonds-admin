// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Box, Button, Divider, Drawer, FormControl, FormHelperText, TextField, Typography } from '@mui/material'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import { forwardRef, useEffect, useState } from 'react'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import { createPagination } from 'src/utils/sharedFunction'
import { ICommonPagination } from 'src/data/interface'
import { ADD_FEATURES_SECTION, DELETE_FEATURES_SECTION, EDIT_FEATURES_SECTION, GET_ALL_FEATURES_SECTION, STATUS_UPDATE_FEATURES_SECTION } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import DeleteDataModel from 'src/customComponents/delete-model'
import { Controller, useForm } from 'react-hook-form'
import { addDays, format } from 'date-fns'
import DatePickerWrapper from 'src/customComponents/Form-Elements/styles/data-picker'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker'

interface PickerProps {
    label?: string
    end: Date | number
    start: Date | number
}

type DateType = Date | null | undefined

const FeaturesSection = () => {
    let timer: any;
    const [searchFilter, setSearchFilter] = useState('')
    const [showModel, setShowModel] = useState(false)
    const [drawerAction, setDrawerAction] = useState(false)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [featureId, setfeatureId] = useState("")
    const [featureData, setFeatureData] = useState([]);
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" });
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [imageFile, setImageFile] = useState<string>()
    const [imageShow, setImageShow] = useState("")
    const [removeimage, setRemoveImage] = useState("0")
    const [startDate, setStartDate] = useState<DateType>(new Date())
    const [endDate, setEndDate] = useState<DateType>(new Date())

    const handleOnChange = (dates: any) => {
        const [start, end] = dates
        setStartDate(start)
        setEndDate(end)
    }

    const CustomInput = forwardRef((props: PickerProps, ref) => {
        const startDate = props.start !== null ? `${format(props.start, 'dd/MM/yyyy')}` : null
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

    const toggleAddFeatureSection = () => {
        if (drawerAction == false) {
            setRemoveImage("1")
        } else {
            setRemoveImage("0")
        }
        setDrawerAction(!drawerAction)
    }
    const defaultValues = {
        title: title,
        content: content,
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

    const clearFormData = () => {
        setImageShow("");
        reset()
        // setfeatureId("")
    }

    const deafultDateData = () => {
        setStartDate(new Date())
        setEndDate(addDays(new Date(), 1))
    }
    const editOnClickHandler = async (data: any) => {
        setImageShow(data.image_path)
        setValue("title", data.name)
        setfeatureId(data.id)
        setValue("content", data.content)
        setStartDate(new Date(data.active_date))
        setEndDate(new Date(data.expiry_date))
        // console.log(data);
        setDialogTitle('Edit')
        toggleAddFeatureSection()
    }
    const deleteOnclickHandler = (data: any) => {
        setfeatureId(data.id)
        setShowModel(!showModel)
    }

    const getAllFeatureDataApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await GET_ALL_FEATURES_SECTION(mbPagination);
            if (data.code === 200 || data.code === "200") {

                setFeatureData(data.data.result);
                setPagination(data.data.pagination)

            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    ///////////////////////// ADD API ////////////////////////

    const addFeatureApi = async (data: any) => {
        if (!imageFile) {
            toast.error("image is required", {
                position: "top-left"
            });
        } else {
            const formData: any = new FormData()
            formData.append("image", imageFile || "")
            formData.append("name", data.title)
            formData.append("content", data.content)
            formData.append("active_date", startDate)
            formData.append("expiry_date", endDate)
            try {
                const data = await ADD_FEATURES_SECTION(formData)
                if (data.code === 200 || data.code === "200") {

                    toggleAddFeatureSection();
                    clearFormData();
                    deafultDateData();
                    toast.success(data.message)
                    getAllFeatureDataApi(pagination)

                } else {
                    toast.error(data.message)
                }
            } catch (e: any) {
                toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
            }
        }
        return false
    }

    ///////////////////////// EDIT API ////////////////////////

    const editFeatureDataApi = async (data: any) => {

        const formData: any = new FormData()
        formData.append("id", featureId)
        formData.append("image", imageFile || "")
        formData.append("name", data.title)
        formData.append("content", data.content)
        formData.append("active_date", startDate)
        formData.append("expiry_date", endDate)
        try {
            const data = await EDIT_FEATURES_SECTION(formData)
            if (data.code === 200 || data.code === "200") {

                toggleAddFeatureSection();
                clearFormData();
                toast.success(data.message)
                getAllFeatureDataApi(pagination)
            } else {
                toast.error(data.message)
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }

        return false

    }

    const deleteFeatureDataApi = async () => {

        const payload = {
            "id": featureId
        }
        try {
            const data = await DELETE_FEATURES_SECTION(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel)
                getAllFeatureDataApi(pagination)
            } else {
                toast.error(data.message)
            }
        } catch (error) {

        }
    }

    const activeStatusDataApi = async (checked: boolean, row: any) => {
        const payload = {
            "id": row.id,
            "is_active": checked ? '1' : '0',
        }
        try {
            const datas = await STATUS_UPDATE_FEATURES_SECTION(payload)

            if (datas.code === 200 || datas.code === "200") {
                toast.success("Successfully updated")
                getAllFeatureDataApi(pagination)

                return true
            } else {

            }
        } catch (error) {

            return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    useEffect(() => {
        getAllFeatureDataApi(pagination);
    }, []);

    const handleChangePerPageRows = (perPageRows: number) => {
        getAllFeatureDataApi({ ...pagination, per_page_rows: perPageRows })
    }

    const handleOnPageChange = (page: number) => {
        getAllFeatureDataApi({ ...pagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllFeatureDataApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            getAllFeatureDataApi({ ...pagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchBusinessUser();
    }, [searchFilter]);
    const column = [
        {
            flex: 1,
            value: "image_path",
            headerName: "image",
            field: "image_path",
            avatars: "avatars"
        },
        {
            flex: 1,
            value: 'name',
            headerName: 'title',
            field: 'name',
            text: 'text'
        },
        {
            flex: 2,
            value: 'content',
            headerName: 'content',
            field: 'content',
            text: 'text'
        },
        {
            flex: 1,
            headerName: 'Status',
            field: 'Status',
            chips: 'chip',
            value: 'is_active'
        },
        {
            flex: 1,
            headerName: 'status',
            field: 'is_active',
            switch: 'switch',
            value: 'is_active',
            SwitchonChange: activeStatusDataApi
        },
        {
            flex: 1,
            headerName: 'Action',
            field: 'action',
            edit: "edit",
            deleted: 'deleted',
            editOnClick: editOnClickHandler,
            deletedOnClick: deleteOnclickHandler

        },
    ]

    const onSubmit = (data: any) => {
        if (dialogTitle === 'Add') {
            addFeatureApi(data)
        } else {
            editFeatureDataApi(data)
        }
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Features Section'></CardHeader>
                    <Divider />
                    <TCCTableHeader
                        isButton
                        value={searchFilter}
                        onChange={(e: any) => setSearchFilter(e.target.value)}
                        ButtonName='Add Features Section'
                        toggle={() => {
                            setDialogTitle('Add')
                            toggleAddFeatureSection()
                            clearFormData()
                            deafultDateData()
                        }}
                    />

                    <TccDataTable
                        column={column}
                        rows={featureData}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(pagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={pagination.total_items}
                        page={pagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle='Section'
                    />

                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddFeatureSection}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >

                <DrawerHeader
                    title={`${dialogTitle} Features Section`}
                    onClick={() => {
                        toggleAddFeatureSection()
                        clearFormData()
                    }}
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
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
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='content'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        multiline
                                        rows={5}
                                        autoFocus
                                        size='small'
                                        value={content}
                                        label='Content'
                                        onChange={(e) => setContent(e.target.value)}
                                        error={Boolean(errors.content)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.content && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
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
                                    <CustomInput label='ActiveDate - ExpiryDate' start={startDate as Date | number} end={endDate as Date | number} />
                                }
                            />
                        </DatePickerWrapper>
                        <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 6 }}>
                            <Button variant='contained' sx={{ mr: 3 }} type="submit">
                                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={() => {
                                toggleAddFeatureSection()
                                clearFormData()
                            }}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer >
            <DeleteDataModel showModel={showModel} toggle={(show: any) => setShowModel(show)} onClick={deleteFeatureDataApi} />

        </Grid >
    )
}


export default FeaturesSection