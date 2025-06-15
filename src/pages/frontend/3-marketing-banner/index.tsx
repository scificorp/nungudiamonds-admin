// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Box, Button, Divider, Drawer, FormControl, FormHelperText, TextField } from '@mui/material'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import { useEffect, useState } from 'react'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { ICommonPagination } from 'src/data/interface'
import { ADD_MARKETING_BANNER, DELETE_MARKETING_BANNER, EDIT_MARKETING_BANNER, GET_ALL_MARKETING_BANNER, STATUS_UPDATE_MARKETING_BANNER } from 'src/services/AdminServices'
import { createPagination } from 'src/utils/sharedFunction'
import { toast } from 'react-hot-toast'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import DeleteDataModel from 'src/customComponents/delete-model'
import { Controller, useForm } from 'react-hook-form'

const MarketingBanner = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState('')
    const [drawerAction, setDrawerAction] = useState(false)
    const [bannerLink, setBannerLink] = useState("")
    const [bannerName, setBannerName] = useState("")
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [imageFile, setImageFile] = useState<string>()
    const [imageShow, setImageShow] = useState("")
    const [removeimage, setRemoveImage] = useState("0")
    const [bannerId, setBannerId] = useState("");
    const [showModel, setShowModel] = useState(false)
    const [getBannerData, setBannerData] = useState([]);
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" });

    const defaultValues = {
        bannerName: bannerName,
        bannerLink: bannerLink
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

    const toggleAddMarketingBanner = () => {
        if (drawerAction == false) {
            setRemoveImage("1")
        } else {
            setRemoveImage("0")
        }
        setDrawerAction(!drawerAction)
    }
    const clearFormData = () => {
        setImageShow("")
        reset()
    }

    const editOnClickHandler = (data: any) => {
        setImageShow(data.image_path)
        setValue("bannerName", data.name)
        setValue("bannerLink", data.target_url)
        setBannerId(data.id)
        setDialogTitle('Edit')
        toggleAddMarketingBanner()
    }
    const deleteOnclickHandler = (data: any) => {
        setBannerId(data.id)
        setShowModel(!showModel)
    }

    const getAllBannerDataApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await GET_ALL_MARKETING_BANNER(mbPagination);
            if (data.code === 200 || data.code === "200") {

                setBannerData(data.data.result);
                setPagination(data.data.pagination)

            } else {

                return toast.error(data.message);
            }
        } catch (error) {

            return error
        }
    }

    const addBannerApi = async (data: any) => {
        if (!imageFile) {
            toast.error("image is required", {
                position: "top-left"
            });
        } else {
            const formData = new FormData()
            formData.append("image", imageFile || "")
            formData.append("name", data.bannerName)
            formData.append("target_url", data.bannerLink)
            formData.append("active_date", "2023-03-14")
            formData.append("expiry_date", "2023-04-14")
            try {
                const data = await ADD_MARKETING_BANNER(formData)
                if (data.code === 200 || data.code === "200") {

                    toggleAddMarketingBanner();
                    clearFormData();
                    toast.success(data.message)
                    getAllBannerDataApi(pagination)

                } else {
                    toast.error(data.message)
                }
            } catch (e: any) {
                toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
            }
        }
        return false
    }

    const editBannerDataApi = async (data: any) => {

        const formData = new FormData()
        formData.append("id", bannerId)
        formData.append("image", imageFile || "")
        formData.append("name", data.bannerName)
        formData.append("target_url", data.bannerLink)
        formData.append("is_active", "1")
        formData.append("active_date", "2023-03-14")
        formData.append("expiry_date", "2023-04-14")
        try {
            const data = await EDIT_MARKETING_BANNER(formData)
            if (data.code === 200 || data.code === "200") {

                toggleAddMarketingBanner();
                clearFormData();
                toast.success(data.message)
                getAllBannerDataApi(pagination)
            } else {
                toast.error(data.message)
            }
        } catch (e: any) {

            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }

        return false

    }

    const deleteBannerDataApi = async () => {

        const payload = {
            "id": bannerId
        }
        try {
            const data = await DELETE_MARKETING_BANNER(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel)
                clearFormData()
                getAllBannerDataApi(pagination)
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
            const datas = await STATUS_UPDATE_MARKETING_BANNER(payload)

            if (datas.code === 200 || datas.code === "200") {
                toast.success("Successfully updated")
                getAllBannerDataApi(pagination)

                return true
            } else {

            }
        } catch (error) {

            return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    useEffect(() => {

        getAllBannerDataApi(pagination);

    }, []);

    const handleChangePerPageRows = (perPageRows: number) => {
        getAllBannerDataApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        getAllBannerDataApi({ ...pagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllBannerDataApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            getAllBannerDataApi({ ...pagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }
    useEffect(() => {

        searchBusinessUser();

    }, [searchFilter]);

    const onSubmit = (data: any) => {
        if (dialogTitle === 'Add') {
            addBannerApi(data)
        } else {
            editBannerDataApi(data)
        }
    }

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
            value: 'target_url',
            headerName: 'Link',
            field: 'target_url',
            text: 'text'
        },
        {
            flex: 1,
            headerName: 'Status',
            field: '',
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

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Marketing Banner'></CardHeader>
                    <Divider />
                    <TCCTableHeader
                        isButton
                        value={searchFilter}
                        onChange={(e: any) => setSearchFilter(e.target.value)}
                        ButtonName='Add Banner'
                        toggle={() => {
                            setDialogTitle('Add')
                            toggleAddMarketingBanner()
                            clearFormData()
                        }}
                    />

                    <TccDataTable
                        column={column}
                        rows={getBannerData}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(pagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={pagination.total_items}
                        page={pagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle='Banner'
                    />

                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddMarketingBanner}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >

                <DrawerHeader
                    title={`${dialogTitle} Marketing Banner`}
                    onClick={() => {
                        toggleAddMarketingBanner()
                        clearFormData()
                    }}
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='bannerName'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        value={bannerName}
                                        label='Banner Name'
                                        onChange={(e) => setBannerName(e.target.value)}
                                        error={Boolean(errors.bannerName)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.bannerName && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='bannerLink'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        label='Link'
                                        value={bannerLink}
                                        onChange={(e) => setBannerLink(e.target.value)}
                                        error={Boolean(errors.bannerLink)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.bannerLink && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>

                        <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 6 }}>
                            <Button variant='contained' sx={{ mr: 3 }} type="submit">
                                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={() => {
                                toggleAddMarketingBanner()
                                clearFormData()
                            }}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>
            <DeleteDataModel showModel={showModel} toggle={(show: any) => setShowModel(show)} onClick={deleteBannerDataApi} />

        </Grid>
    )
}

export default MarketingBanner