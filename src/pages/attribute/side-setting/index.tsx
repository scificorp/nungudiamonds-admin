
// ** MUI Imports
import { Icon } from '@iconify/react'
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, FormControl, TextField, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import Box, { BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import TabList from '@mui/lab/TabList'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import TccEditor from 'src/customComponents/Form-Elements/editor'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { toast } from 'react-hot-toast'
import { SETTING_STYLE_ADD, SETTING_STYLE_DELETE, SETTING_STYLE_EDIT, SETTING_STYLE_GET_ALL, SETTING_STYLE_STATUS, SIDE_SETTING_STYLE_ADD, SIDE_SETTING_STYLE_DELETE, SIDE_SETTING_STYLE_EDIT, SIDE_SETTING_STYLE_GET_ALL, SIDE_SETTING_STYLE_STATUS } from 'src/services/AdminServices'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import DeleteDataModel from 'src/customComponents/delete-model'
import { createPagination } from 'src/utils/sharedFunction'
import { ICommonPagination } from 'src/data/interface'
import { Controller, useForm } from 'react-hook-form'

const SideSettingStyle = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [pageSize, setPageSize] = useState(10)
    const [drawerAction, setDrawerAction] = useState(false)
    const [editorDrawerAction, setEditorDrawerAction] = useState(false)
    const [settingStyle, setSettingStyle] = useState('')
    const [imageFile, setImageFile] = useState<string>()
    const [removeimage, setRemoveImage] = useState("0")
    const [settingStylePagination, setSettingStylePagination] = useState({ ...createPagination(), search_text: "" })
    const [settingStyleResult, setSettingStyleResult] = useState([])
    const [settingStyleId, setSettingStyleId] = useState('');
    const [imageShow, setImageShow] = useState("")
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [showModel, setShowModel] = useState(false);
    const [sortCode, setSortCode] = useState('')
    const [editerData, setEditerData] = useState("")
    const [edit, setEdit] = useState<String>('<p></p>')
    const [called, setCalled] = useState(true)

    const defaultValues = {
        settingStyle: settingStyle,
        sortCode: sortCode,
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
    const toggleAddSettingStyleDrawer = () => {
        if (drawerAction == false) {
            setRemoveImage("1")
        } else {
            setRemoveImage("0")
        }
        setDrawerAction(!drawerAction)
    }

    const toggleEditorDrawer = () => setEditorDrawerAction(!editorDrawerAction)

    const editOnClickHandler = async (data: any) => {
        setDialogTitle('Edit');
        setValue("settingStyle", data.name);
        setValue("sortCode", data.sort_code);
        setImageShow(data.image_path);
        toggleAddSettingStyleDrawer();
        setSettingStyleId(data.id);
    }

    const deleteOnClickHandler = async (data: any) => {

        setSettingStyleId(data.id)
        setShowModel(!showModel)
    }
    const clearFormDataHandler = () => {
        reset()
        setImageShow("")
    }

    /////////////////// ADD API ///////////////////////

    const sideSettingStyleAddApi = async (data: any) => {
        const formData = new FormData()
        formData.append("image", imageFile || "")
        formData.append("name", data.settingStyle)
        formData.append("sort_code", data.sortCode)

        try {
            const data = await SIDE_SETTING_STYLE_ADD(formData);

            if (data.code === 200 || data.code === "200") {
                toggleAddSettingStyleDrawer();
                toast.success(data.message);
                sideSettingStyleGetAllApi(settingStylePagination);
                clearFormDataHandler();
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN, {
                position: "top-center"
            });
        }

        return false;
    }

    //////////////////////// GET API ////////////////////////

    const sideSettingStyleGetAllApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await SIDE_SETTING_STYLE_GET_ALL(mbPagination);
            if (data.code === 200 || data.code === "200") {
                setSettingStylePagination(data.data.pagination)
                setSettingStyleResult(data.data.result)
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    useEffect(() => {
        sideSettingStyleGetAllApi(settingStylePagination);
    }, []);

    const handleChangePerPageRows = (perPageRows: number) => {
        sideSettingStyleGetAllApi({ ...settingStylePagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        sideSettingStyleGetAllApi({ ...settingStylePagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        sideSettingStyleGetAllApi({ ...settingStylePagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }
    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            sideSettingStyleGetAllApi({ ...settingStylePagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchBusinessUser();
    }, [searchFilter])

    ////////////////////////// EDIT API //////////////////////////

    const sideSettingStyleEditApi = async (data: any) => {
        const formData = new FormData()
        formData.append("id", settingStyleId)
        formData.append("image", imageFile || "")
        formData.append("name", data.settingStyle)
        formData.append("sort_code", data.sortCode)
        try {
            const data = await SIDE_SETTING_STYLE_EDIT(formData);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                toggleAddSettingStyleDrawer();
                clearFormDataHandler();
                sideSettingStyleGetAllApi(settingStylePagination);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN, {
                position: "top-center"
            });
        }

        return false;
    }

    ///////////////////// DELETE API ///////////////////////

    const toggleModel = (showdata: any) => {
        setShowModel(showdata)
    }

    const sideSettingStyleDeleteApi = async () => {
        const payload = {
            "id": settingStyleId,
        };
        try {
            const data = await SIDE_SETTING_STYLE_DELETE(payload);

            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel);
                sideSettingStyleGetAllApi(settingStylePagination);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    //////////////////// STATUS API ///////////////////////

    const sideSettingStyleStatusApi = async (checked: boolean, row: any) => {
        const payload = {
            "id": row.id,
            "is_active": checked ? '1' : '0',
        };
        try {
            const data = await SIDE_SETTING_STYLE_STATUS(payload);

            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                sideSettingStyleGetAllApi(settingStylePagination)

            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    const column = [

        {
            flex: 1,
            headerName: 'image',
            field: 'image_path',
            avatars: 'avatars',
            value: 'image_path'
        },
        {
            flex: 1,
            value: 'name',
            headerName: 'value',
            field: 'name',
            text: 'text'
        },
        {
            flex: 1,
            value: 'slug',
            headerName: 'slug',
            field: 'slug',
            text: 'text'
        },
        {
            flex: 1,
            value: 'sort_code',
            headerName: 'sort code',
            field: 'sort_code',
            text: 'text'
        },
        {
            flex: 1,
            headerName: 'Status',
            field: '',
            chips: 'chips',
            value: 'is_active'

        },
        {
            flex: 1,
            headerName: 'status',
            field: 'is_active',
            switch: 'switch',
            value: 'is_active',
            SwitchonChange: sideSettingStyleStatusApi

        },
        {
            flex: 1,
            headerName: 'Action',
            field: 'action',
            edit: "edit",
            editOnClick: editOnClickHandler,
            deleted: 'deleted',
            deletedOnClick: deleteOnClickHandler,
        },
    ]

    const onSubmit = (data: any) => {
        if (dialogTitle === 'Add') {
            sideSettingStyleAddApi(data)
        } else {
            sideSettingStyleEditApi(data)
        }
    }


    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Side Setting Style'></CardHeader>
                    <Divider />
                    <Box>
                        <TCCTableHeader isButton value={searchFilter}
                            onChange={(e: any) => setSearchFilter(e.target.value)}
                            toggle={() => {
                                setDialogTitle('Add')
                                toggleAddSettingStyleDrawer()
                                clearFormDataHandler()
                            }}
                            ButtonName='Add Side Setting Style'
                            infoButton
                            infotoggle={toggleEditorDrawer}
                        />

                    </Box>
                    <TccDataTable
                        column={column}
                        rows={settingStyleResult}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(settingStylePagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={settingStylePagination.total_items}
                        page={settingStylePagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle='side Setting Style'
                    />
                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddSettingStyleDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >
                <DrawerHeader
                    title={`${dialogTitle} Side Setting Style`}
                    onClick={() => {
                        clearFormDataHandler()
                        toggleAddSettingStyleDrawer()
                    }}
                    tabBar
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='settingStyle'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        value={settingStyle}
                                        label='SIde Setting Style Name'
                                        onChange={(e) => setSettingStyle(e.target.value)}
                                        error={Boolean(errors.settingStyle)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.settingStyle && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='sortCode'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        label='Sort Code'
                                        value={sortCode}
                                        onChange={(e) => setSortCode(e.target.value)}
                                        error={Boolean(errors.sortCode)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.sortCode && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
                        <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                            <Button variant='contained' sx={{ mr: 3 }} type="submit">
                                {dialogTitle === "Add" ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={toggleAddSettingStyleDrawer}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>

            <Drawer
                open={editorDrawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleEditorDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 800, sm: 800 } } }}
            >
                <DrawerHeader
                    title='Add Setting Style Info'
                    onClick={toggleEditorDrawer}
                />


                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form>

                        <TccEditor getHtmlData={setEditerData} data={edit} called={called} />
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                            <Button variant='contained' sx={{ mr: 3 }}>
                                Submit
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={toggleEditorDrawer}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>
            <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={sideSettingStyleDeleteApi} />
        </Grid>
    )
}


export default SideSettingStyle