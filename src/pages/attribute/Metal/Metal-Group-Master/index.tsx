// ** MUI Imports
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import Box, { BoxProps } from '@mui/material/Box'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { Controller, useForm } from 'react-hook-form'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import TccSelect from 'src/customComponents/Form-Elements/select'
import { CARAT_MASTER_DROPDOWN, METAL_GROUP_MASTER_ADD, METAL_GROUP_MASTER_DELETE, METAL_GROUP_MASTER_EDIT, METAL_GROUP_MASTER_GET_ALL, METAL_GROUP_MASTER_STATUS, METAL_MASTER_DROPDOWN, METAL_TONE_DROPDOWN } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import DeleteDataModel from 'src/customComponents/delete-model'

const Metalgroupmaster = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [drawerAction, setDrawerAction] = useState(false)
    const [editorDrawerAction, setEditorDrawerAction] = useState(false)
    const [name, setName] = useState('')
    const [metalValue, setMetalValue] = useState<string>('')
    const [metalOptions, setMetalOptions] = useState([])
    const [caratValue, setCaratValue] = useState<string>()
    const [caratOptions, setCaratOptions] = useState([])
    const [metalToneValue, setMetalToneValue] = useState<string>('')
    const [metalToneOptions, setMetalToneOptions] = useState([])
    const [metalMasterId, setMetalMasterId] = useState()
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
    const [result, setResult] = useState([])
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [showModel, setShowModel] = useState(false);

    const toggleAddMetalGroupMasterDrawer = () => setDrawerAction(!drawerAction)
    const toggleEditorDrawer = () => setEditorDrawerAction(!editorDrawerAction)

    const metalhandleChange = (event: SelectChangeEvent) => {
        setMetalValue(event.target.value as string)
        setCaratValue(event.target.value as string)
    }

    const carathandleChange = (event: SelectChangeEvent) => {
        setCaratValue(event.target.value as string)
    }

    const metaltonehandleChange = (event: SelectChangeEvent) => {
        setMetalToneValue(event.target.value as string)
    }

    const defaultValues = {
        name: name,

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
        setValue("name", data.name);
        setMetalMasterId(data.id);
        setMetalValue(data.id_metal);
        setCaratValue(data.id_kt);
        setMetalToneValue(data.id_metal_tone);
        setDialogTitle('Edit');
        toggleAddMetalGroupMasterDrawer()
    }

    const deleteOnClickHandler = async (data: any) => {
        setMetalMasterId(data.id)
        setShowModel(!showModel)
    }

    const clearFormDataHandler = () => {
        reset()
        setMetalValue('')
        setCaratValue('')
        setMetalToneValue('')
    }

    //////////////////// DROPDOWN API /////////////////////// 

    const metalMasterDropdownApi = async () => {
        try {
            const data = await METAL_MASTER_DROPDOWN();
            setMetalOptions(data.data)
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    useEffect(() => {
        metalMasterDropdownApi()
    }, []);

    /////// CARATMASTER 

    const caratMasterDropdownApi = async () => {
        const payload = {
            "metal_master_id": parseInt(metalValue),
        };
        try {
            const data = await CARAT_MASTER_DROPDOWN(payload);
            setCaratOptions(data.data)
        } catch (e: any) {
            // toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    /////////// METALTONE

    const metaltoneDropdownApi = async () => {
        const payload = {
            "metal_master_id": parseInt(metalValue),
        };
        try {
            const data = await METAL_TONE_DROPDOWN(payload);
            setMetalToneOptions(data.data)

        } catch (e: any) {
            // toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    useEffect(() => {
        caratMasterDropdownApi()
        metaltoneDropdownApi()
    }, [(metalValue)]);

    /////////////////////// ADD API ///////////////////////

    const addApi = async (data: any) => {

        const payload = {
            "name": data.name,
            "metal_master_id": metalValue,
            "kt_id": caratValue,
            "metal_tone_id": metalToneValue,
        };

        try {
            const data = await METAL_GROUP_MASTER_ADD(payload);
            if (data.code === 200 || data.code === "200") {
                toggleAddMetalGroupMasterDrawer();
                toast.success(data.message);
                clearFormDataHandler();
                getAllApi(pagination);
            } else {
                toast.error(data.message);
            }
        } catch (e: any) {
            // toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    /////////////////////// GET API ///////////////////////

    const getAllApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await METAL_GROUP_MASTER_GET_ALL(mbPagination);
            if (data.code === 200 || data.code === "200") {
                setPagination(data.data.pagination)
                setResult(data.data.result)
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    useEffect(() => {
        getAllApi(pagination);
    }, []);

    const handleChangePerPageRows = (perPageRows: number) => {
        getAllApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        getAllApi({ ...pagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            getAllApi({ ...pagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchBusinessUser();
    }, [searchFilter]);

    /////////////////////// EDIT API ///////////////////////

    const editApi = async (data: any) => {
        const payload = {
            "id": metalMasterId,
            "name": data.name,
            "metal_master_id": metalValue,
            "kt_id": caratValue,
            "metal_tone_id": metalToneValue,
        };
        try {
            const data = await METAL_GROUP_MASTER_EDIT(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                toggleAddMetalGroupMasterDrawer();
                clearFormDataHandler();
                getAllApi(pagination);
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

    const deleteApi = async () => {
        const payload = {
            "id": metalMasterId,

        };
        try {
            const data = await METAL_GROUP_MASTER_DELETE(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel);
                getAllApi(pagination);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    //////////////////// STATUS API ///////////////////////

    const statusApi = async (checked: boolean, row: any) => {
        const payload = {
            "id": row.id,
            "is_active": checked ? '1' : '0',
        };
        try {
            const data = await METAL_GROUP_MASTER_STATUS(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                getAllApi(pagination);
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
            value: 'name',
            headerName: 'Name',
            field: 'name',
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
            SwitchonChange: statusApi


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
            addApi(data)
        } else {
            editApi(data)
        }
    }


    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Metal Group Master'></CardHeader>
                    <Divider />
                    <Box>
                        <TCCTableHeader isButton value={searchFilter}
                            onChange={(e: any) => setSearchFilter(e.target.value)}
                            toggle={() => {
                                setDialogTitle('Add')
                                clearFormDataHandler()
                                toggleAddMetalGroupMasterDrawer()
                            }}
                            ButtonName='Add Metal Group Master'
                        />

                    </Box>
                    <TccDataTable
                        column={column}
                        rows={result}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(pagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={pagination.total_items}
                        page={pagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle='Metal Group Master'
                    />
                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddMetalGroupMasterDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >
                <DrawerHeader
                    title={`${dialogTitle} Metal Group Master`}
                    onClick={() => {
                        clearFormDataHandler()
                        toggleAddMetalGroupMasterDrawer()
                    }}
                    tabBar
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form onSubmit={handleSubmit(onsubmit)}>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='name'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        value={name}
                                        label='name'
                                        onChange={(e) => setName(e.target.value)}
                                        error={Boolean(errors.name)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
                        <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select Master"
                            label='Select Master'
                            value={metalValue}
                            id='controlled-select'
                            onChange={metalhandleChange}
                            title='name'
                            Options={metalOptions}
                        />
                        {metalValue == "1" ? <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select Carat"
                            label='Select Carat'
                            value={caratValue}
                            id='controlled-select'
                            onChange={carathandleChange}
                            title='name'
                            Options={caratOptions}
                        /> : ""}

                        <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select MetalTone"
                            label='Select MetalTone'
                            value={metalToneValue}
                            id='controlled-select'
                            onChange={metaltonehandleChange}
                            title='name'
                            Options={metalToneOptions}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                            <Button variant='contained' sx={{ mr: 3 }} type="submit">
                                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={toggleAddMetalGroupMasterDrawer}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>

            <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={deleteApi} />

        </Grid>
    )
}

export default Metalgroupmaster