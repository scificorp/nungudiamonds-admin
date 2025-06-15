// ** MUI Imports
import { Icon } from '@iconify/react'
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, FormHelperText, ListItem, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import Box, { BoxProps } from '@mui/material/Box'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { Controller, useForm } from 'react-hook-form'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import TccSelect from 'src/customComponents/Form-Elements/select'
import { toast } from 'react-hot-toast'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import DeleteDataModel from 'src/customComponents/delete-model'
import { ADD_DIAMOND_GROUP_MASTER, ADD_PRODUCT_DROPDOWN_LIST, BULK_UPLOAD_DIAMOND_GROUP_MASTER, DELETE_DIAMOND_GROUP_MASTER, EDIT_DIAMOND_GROUP_MASTER, GET_DIAMOND_GROUP_MASTER, STATUS_UPDATE_DIAMOND_GROUP_MASTER } from 'src/services/AdminServices'


const DiamondgroupMaster = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [drawerAction, setDrawerAction] = useState(false)
    const [editorDrawerAction, setEditorDrawerAction] = useState(false)
    const [diamondMasterId, setDiamondMasterId] = useState()
    const [diamondGroupMasterPagination, setDiamondGroupMasterPagination] = useState({ ...createPagination(), search_text: "" })
    const [diamondGroupMasterResult, setDiamondGroupMasterResult] = useState([])

    const [stoneList, setStoneList] = useState([])
    const [shapeList, setShapeList] = useState([])
    const [mmSizeList, setMmSizeList] = useState([])
    const [colorList, setColorList] = useState([])
    const [clarityList, setClarityList] = useState([])
    const [cutsList, setCutsList] = useState([])

    const [stoneId, setStoneId] = useState('')
    const [shapeId, setShapeId] = useState('')
    const [mmSizeId, setMmSizeId] = useState('')
    const [colorId, setColorId] = useState('')
    const [clarityId, setClarityId] = useState('')
    const [cutsId, setCutsId] = useState('')
    const [values, setValues] = useState(1)
    const [rate, setRate] = useState('')
    const [file, setFile] = useState<File>()
    const [bulkErrorMeassage, setBulkErrorMeassage] = useState([])
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [showModel, setShowModel] = useState(false);

    const toggleAddDiamondGroupMasterDrawer = () => setDrawerAction(!drawerAction)
    const toggleEditorDrawer = () => setEditorDrawerAction(!editorDrawerAction)

    const defaultValues = {
        rate: rate
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

    const editOnClickHandler = async (data: any) => {

        setDiamondMasterId(data.id);
        setStoneId(data.id_stone)
        setShapeId(data.id_shape)
        setMmSizeId(data.id_mm_size)
        setColorId(data.id_color)
        setClarityId(data.id_clarity)
        setCutsId(data.id_cuts)
        setValue("rate", data.rate)
        setDialogTitle('Edit');
        toggleAddDiamondGroupMasterDrawer()
    }

    const deleteOnClickHandler = async (data: any) => {
        setDiamondMasterId(data.id)
        setShowModel(!showModel)
    }

    const clearFormDataHandler = () => {
        reset()
        setStoneId('')
        setShapeId('')
        setMmSizeId('')
        setColorId('')
        setClarityId('')
        setCutsId('')
    }

    //////////////////// DROPDOWN API ///////////////////////

    const getAllDropDownData = async () => {

        try {
            const data = await ADD_PRODUCT_DROPDOWN_LIST();
            if (data.code === 200 || data.code === "200") {

                setStoneList(data.data.stone)
                setShapeList(data.data.stone_shape)
                setColorList(data.data.stone_color)
                setCutsList(data.data.stone_cut)
                setClarityList(data.data.stone_clarity)
                setMmSizeList(data.data.MM_Size)

            } else {

                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        }
    }

    useEffect(() => {
        getAllDropDownData()
    }, [])

    /////////////////////// ADD API ///////////////////////

    const diamondMasterGroupAddApi = async (data: any) => {

        const payload = {

            "id_stone": stoneId,
            "id_shape": shapeId,
            "id_mm_size": mmSizeId,
            "id_color": colorId,
            "id_clarity": clarityId,
            "id_cuts": cutsId,
            "rate": data.rate,
        };

        try {
            const data = await ADD_DIAMOND_GROUP_MASTER(payload);
            if (data.code === 200 || data.code === "200") {
                toggleAddDiamondGroupMasterDrawer();
                toast.success(data.message);
                clearFormDataHandler();
                diamondGroupMastergetallApi(diamondGroupMasterPagination);
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

    /////////////////////// GET API ///////////////////////

    const diamondGroupMastergetallApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await GET_DIAMOND_GROUP_MASTER(mbPagination);
            if (data.code === 200 || data.code === "200") {
                setDiamondGroupMasterPagination(data.data.pagination)
                setDiamondGroupMasterResult(data.data.result)
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    useEffect(() => {
        diamondGroupMastergetallApi(diamondGroupMasterPagination);
    }, []);

    const handleChangePerPageRows = (perPageRows: number) => {
        diamondGroupMastergetallApi({ ...diamondGroupMasterPagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        diamondGroupMastergetallApi({ ...diamondGroupMasterPagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        diamondGroupMastergetallApi({ ...diamondGroupMasterPagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    const searchDiamondGroupUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            diamondGroupMastergetallApi({ ...diamondGroupMasterPagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchDiamondGroupUser();
    }, [searchFilter]);

    /////////////////////// EDIT API ///////////////////////

    const diamondGroupMasterEditApi = async (data: any) => {
        const payload = {
            "id": diamondMasterId,
            "id_stone": stoneId,
            "id_shape": shapeId,
            "id_mm_size": mmSizeId,
            "id_color": colorId,
            "id_clarity": clarityId,
            "id_cuts": cutsId,
            "rate": data.rate,
        };
        try {
            const data = await EDIT_DIAMOND_GROUP_MASTER(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                toggleAddDiamondGroupMasterDrawer();
                clearFormDataHandler();
                diamondGroupMastergetallApi(diamondGroupMasterPagination);
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

    /////////////////////// DELETE  API ///////////////////////

    const toggleModel = (showdata: any) => {
        setShowModel(showdata)
    }

    const diamondGroupMasterDeleteApi = async () => {
        const payload = {
            "id": diamondMasterId,
        };
        try {
            const data = await DELETE_DIAMOND_GROUP_MASTER(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel);
                diamondGroupMastergetallApi(diamondGroupMasterPagination);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    //////////////////// STATUS API ///////////////////////

    const diamondGroupMasterStatusApi = async (checked: boolean, row: any) => {
        const payload = {
            "id": row.id,
            "is_active": checked ? '1' : '0',
        };
        try {
            const data = await STATUS_UPDATE_DIAMOND_GROUP_MASTER(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                diamondGroupMastergetallApi(diamondGroupMasterPagination);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    /////////////////////// BULK UPLOAD API ///////////////////////

    const bulkUploadApi = async () => {
        const formData: any = new FormData()
        formData.append("diamond_csv", file || "")

        try {
            const data = await BULK_UPLOAD_DIAMOND_GROUP_MASTER(formData);

            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
            } else {
                toast.error(data.message);
                return toast.error(data.data.map((t: any) => t.error_message));
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
            setBulkErrorMeassage(e.data.data)
        }

        return false;
    }

    const column = [

        {
            flex: 1,
            value: 'diamond',
            headerName: 'Stone',
            field: 'diamond',
            text: 'text'
        },
        {
            flex: 1,
            value: 'diamond_shape',
            headerName: 'Shape',
            field: 'diamond_shape',
            text: 'text'
        },
        {
            flex: 1,
            value: 'diamond_mm_size',
            headerName: 'MM Size',
            field: 'diamond_mm_size',
            text: 'text'
        },
        {
            flex: 1,
            value: 'diamond_color',
            headerName: 'Color',
            field: 'diamond_color',
            text: 'text'
        },
        {
            flex: 1,
            value: 'diamond_clarity',
            headerName: 'Clarity',
            field: 'diamond_clarity',
            text: 'text'
        },
        {
            flex: 1,
            value: 'diamond_cuts',
            headerName: 'Cut',
            field: 'diamond_cuts',
            text: 'text'
        },
        {
            flex: 1,
            value: 'rate',
            headerName: 'Price',
            field: 'rate',
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
            SwitchonChange: diamondGroupMasterStatusApi


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

    const onsubmit = (data: any) => {
        if (dialogTitle === "Add") {
            diamondMasterGroupAddApi(data)
        } else {
            diamondGroupMasterEditApi(data)
        }
    }
    const URL = 'https://nungu-diamonds.s3.eu-north-1.amazonaws.com/samplecsv/Sample_DiamondGroup.xlsx'

    const onButtonClick = () => {
        fetch(URL).then(response => {
            response.blob().then(blob => {
                const fileURL = window.URL.createObjectURL(blob);
                let alink = document.createElement('a');
                alink.href = fileURL;
                alink.download = 'Sample_DiamondGroup.xlsx';
                alink.click();
            })
        })
    }


    return (
        <Grid container spacing={6}>
            {bulkErrorMeassage != null && bulkErrorMeassage.length > 0 ?
                <Grid item xs={12} sm={12}>
                    <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
                        <Table stickyHeader aria-label='sticky table'>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='center'>Row Id</TableCell>
                                    <TableCell align='center'>Error Message</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bulkErrorMeassage && bulkErrorMeassage.map((t: any, index: any) =>
                                    <TableRow key={"ERR_" + index}>
                                        <TableCell align='center' >
                                            {t.row_id}
                                        </TableCell>
                                        <TableCell align='center' >
                                            {t.error_message}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                : <></>}
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Diamond Group Master'></CardHeader>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: "end", mt: 3 }}>
                        <Button variant='contained' sx={{ '& svg': { mr: 2 }, mr: 4 }} onClick={onButtonClick} >
                            <Icon icon='material-symbols:download' fontSize='1.125rem' /> Download
                        </Button>
                    </Box>
                    <Box>

                        <TCCTableHeader importButton value={searchFilter}
                            onChange={(e: any) => setSearchFilter(e.target.value)}
                            onChangeUpload={(event: any) => setFile(event.target.files[0])}
                            uploadOnClick={bulkUploadApi}
                            toggle={() => {
                                setDialogTitle('Add')
                                clearFormDataHandler()
                                toggleAddDiamondGroupMasterDrawer()
                            }}
                            ButtonName='Add Diamond Group Master'
                        />
                    </Box>

                    <TccDataTable
                        column={column}
                        rows={diamondGroupMasterResult}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(diamondGroupMasterPagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={diamondGroupMasterPagination.total_items}
                        page={diamondGroupMasterPagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle='Diamond Group Master'
                    />
                </Card>
            </Grid >
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddDiamondGroupMasterDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >
                <DrawerHeader
                    title={`${dialogTitle} Diamond Group Master`}
                    onClick={() => {
                        clearFormDataHandler()

                        toggleAddDiamondGroupMasterDrawer()
                    }}
                    tabBar
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form onSubmit={handleSubmit(onsubmit)}>

                        <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select Stone"
                            label='Select Stone'
                            value={stoneId}
                            id='controlled-select'
                            onChange={(event: any) => setStoneId(event.target.value)}
                            title='name'
                            Options={stoneList}
                        />
                        <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select Shape"
                            label='Select Shape'
                            value={shapeId}
                            id='controlled-select'
                            onChange={(event: any) => setShapeId(event.target.value)}
                            title='name'
                            Options={shapeList}
                        />
                        <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select MM Size"
                            label='Select MM Size'
                            value={mmSizeId}
                            id='controlled-select'
                            onChange={(event: any) => setMmSizeId(event.target.value)}
                            title='value'
                            Options={mmSizeList}
                        />
                        <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select Color"
                            label='Select Color'
                            value={colorId}
                            id='controlled-select'
                            onChange={(event: any) => setColorId(event.target.value)}
                            title='name'
                            Options={colorList}
                        />
                        <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select Clarity"
                            label='Select Clarity'
                            value={clarityId}
                            id='controlled-select'
                            onChange={(event: any) => setClarityId(event.target.value)}
                            title='name'
                            Options={clarityList}
                        />
                        <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select Cuts"
                            label='Select Cuts'
                            value={cutsId}
                            id='controlled-select'
                            onChange={(event: any) => setCutsId(event.target.value)}
                            title='value'
                            Options={cutsList}
                        />
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='rate'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        value={rate}
                                        label='Price'
                                        onChange={(e) => setRate(e.target.value)}
                                        error={Boolean(errors.rate)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.rate && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                            <Button variant='contained' sx={{ mr: 3 }} type="submit">
                                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={toggleAddDiamondGroupMasterDrawer}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>

            <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={diamondGroupMasterDeleteApi} />

        </Grid >
    )
}

export default DiamondgroupMaster
