// ** MUI Imports
import { Icon } from '@iconify/react'
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, FormControl, TextField, FormHelperText } from '@mui/material'
import { ChangeEvent, useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import Box, { BoxProps } from '@mui/material/Box'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { Controller, useForm } from 'react-hook-form'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { TESTIMONIAL_ADD, TESTIMONIAL_DELETE, TESTIMONIAL_EDIT, TESTIMONIAL_GET_ALL, TESTIMONIAL_STATUS } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import DeleteDataModel from 'src/customComponents/delete-model'

const Testimonials = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [pageSize, setPageSize] = useState(10)
    const [drawerAction, setDrawerAction] = useState(false)
    const [testimonialName, setTestimonialName] = useState('')
    const [testimonialId, setTestimonialId] = useState('')
    const [testimonialDesignation, setTestimonialDesignation] = useState('')
    const [imageFile, setImageFile] = useState<string>()
    const [imageShow, setImageShow] = useState("")
    const [testimonialpagination, setTestimonialPagination] = useState({ ...createPagination(), search_text: "" })
    const [testimonialresult, setTestimonialResult] = useState([])
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [showModel, setShowModel] = useState(false);
    const [removeimage, setRemoveImage] = useState("0")
    const [textareavalue, setTextAreaValue] = useState<string>('')

    const toggleAddTestimonialDrawer = () => {
        if (drawerAction == false) {
            setRemoveImage("1")
        } else {
            setRemoveImage("0")
        }
        setDrawerAction(!drawerAction)
    }

    const defaultValues = {
        testimonialName: testimonialName,
        testimonialDesignation: testimonialDesignation,
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

    const testimonialhandleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTextAreaValue(event.target.value)
    }
    const editOnClickHandler = async (data: any) => {
        setValue("testimonialName", data.person_name)
        setValue("testimonialDesignation", data.designation)
        setTextAreaValue(data.text)
        setImageShow(data.image_path);
        setDialogTitle('Edit');
        toggleAddTestimonialDrawer();
        setTestimonialId(data.id);
    }
    const deleteOnClickHandler = async (data: any) => {
        setTestimonialId(data.id)
        setShowModel(!showModel)
    }
    const clearFormDataHandler = () => {
        reset()
        setImageShow('')
        setTextAreaValue('')
    }

    /////////////////// ADD API //////////////////////

    const addApi = async (data: any) => {
        if (!imageFile) {
            toast.error("image is required", {
                position: "top-left"
            });
        } else {
            const formData = new FormData()
            formData.append("image", imageFile || "")
            formData.append("name", data.testimonialName)
            formData.append("designation", data.testimonialDesignation)
            formData.append("text", textareavalue)
            try {
                const data = await TESTIMONIAL_ADD(formData);
                if (data.code === 200 || data.code === "200") {
                    toggleAddTestimonialDrawer();
                    toast.success(data.message);
                    getAllApi(testimonialpagination);
                    clearFormDataHandler();
                } else {
                    toast.error(data.message);
                }
            } catch (e: any) {
                toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
            }
        }
        return false;
    }

    //////////////////////// GET API ////////////////////////

    const getAllApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await TESTIMONIAL_GET_ALL(mbPagination);
            if (data.code === 200 || data.code === "200") {
                setTestimonialPagination(data.data.pagination)
                setTestimonialResult(data.data.result)
            } else {
                toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    useEffect(() => {
        getAllApi(testimonialpagination);
    }, []);

    const handleChangePerPageRows = (perPageRows: number) => {
        getAllApi({ ...testimonialpagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        getAllApi({ ...testimonialpagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllApi({ ...testimonialpagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }
    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            getAllApi({ ...testimonialpagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchBusinessUser();
    }, [searchFilter]);

    ////////////////////////// EDIT API ////////////////////////////

    const editApi = async (data: any) => {
        const formData = new FormData()
        formData.append("image", imageFile || "")
        formData.append("id", testimonialId)
        formData.append("name", data.testimonialName)
        formData.append("designation", data.testimonialDesignation)
        formData.append("text", textareavalue)
        try {
            const data = await TESTIMONIAL_EDIT(formData);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                toggleAddTestimonialDrawer();
                clearFormDataHandler();
                getAllApi(testimonialpagination);
            } else {
                toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    ///////////////////// DELETE API //////////////////

    const toggleModel = (showdata: any) => {
        setShowModel(showdata)
    }

    const deleteApi = async () => {
        const payload = {
            "id": testimonialId,
        };
        try {
            const data = await TESTIMONIAL_DELETE(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel);
                getAllApi(testimonialpagination);
            } else {
                toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    //////////////////// STATUS API //////////////////

    const statusApi = async (checked: boolean, row: any) => {
        const payload = {
            "id": row.id,
            "is_active": checked ? '1' : '0',
        };
        try {
            const data = await TESTIMONIAL_STATUS(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                getAllApi(testimonialpagination);
            } else {
                toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    const column = [
        {
            value: 'image_path',
            headerName: 'image',
            field: 'image_path',
            avatars: 'avatars'
        },
        {
            flex: 1,
            value: 'person_name',
            headerName: 'name',
            field: 'person_name',
            text: 'text'
        },
        {
            flex: 1,
            value: 'designation',
            headerName: 'Designation',
            field: 'designation',
            text: 'text'
        },
        {
            flex: 1,
            value: 'text',
            headerName: 'Text',
            field: 'text',
            text: 'text'
        },
        {
            flex: 1,
            headerName: 'Status',
            field: 'Status',
            chips: 'chips',
            value: 'is_active'
        },
        {
            flex: 1,
            headerName: 'status',
            field: 'is_active',
            switch: 'switch',
            value: 'is_active',
            SwitchonChange: statusApi
        },
        {
            flex: 1,
            headerName: 'Action',
            field: 'action',
            edit: "edit",
            deleted: 'deleted',
            editOnClick: editOnClickHandler,
            deletedOnClick: deleteOnClickHandler
        },
    ]

    const onSubmit = (data: any) => {
        if (dialogTitle === 'Add') {
            addApi(data)
        } else {
            editApi(data)
        }
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Testimonials 🚀'></CardHeader>
                    <Divider />
                    <Box>
                        <TCCTableHeader isButton value={searchFilter}
                            onChange={(e: any) => setSearchFilter(e.target.value)}
                            toggle={() => {
                                toggleAddTestimonialDrawer()
                                setDialogTitle('Add')
                                clearFormDataHandler()
                            }}
                            ButtonName='Add Testimonial'
                        />

                    </Box>
                    <TccDataTable
                        column={column}
                        rows={testimonialresult}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(testimonialpagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={testimonialpagination.total_items}
                        page={testimonialpagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle='Testimonial'
                    />
                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddTestimonialDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >
                <DrawerHeader
                    title={`${dialogTitle} Testimonial`}
                    onClick={() => {
                        clearFormDataHandler()
                        toggleAddTestimonialDrawer()
                    }}
                    tabBar
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='testimonialName'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        value={testimonialName}
                                        label='Name'
                                        onChange={(e) => setTestimonialName(e.target.value)}
                                        error={Boolean(errors.testimonialName)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.testimonialName && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='testimonialDesignation'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        value={testimonialDesignation}
                                        label='Designations'
                                        onChange={(e) => setTestimonialDesignation(e.target.value)}
                                        error={Boolean(errors.testimonialDesignation)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.testimonialDesignation && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
                        <TextField
                            sx={{ mb: 4 }}
                            fullWidth
                            autoFocus
                            value={textareavalue}
                            onChange={testimonialhandleChange}
                            // size='small'
                            rows={4}
                            multiline label='Text'
                            id='textarea-outlined-static'
                        />

                        <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                            <Button variant='contained' sx={{ mr: 3 }} type='submit'>
                                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={toggleAddTestimonialDrawer}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>
            <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={deleteApi} />
        </Grid >
    )
}

export default Testimonials