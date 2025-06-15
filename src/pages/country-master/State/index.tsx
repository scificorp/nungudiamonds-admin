// ** MUI Imports
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, SelectChangeEvent, FormControl, TextField, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import Box, { BoxProps } from '@mui/material/Box'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import TccSelect from 'src/customComponents/Form-Elements/select'
import { Controller, useForm } from 'react-hook-form'
import { createPagination } from 'src/utils/sharedFunction'
import { STATE_DROPDOWN_LIST, STATE_ADD, STATE_DELETE, STATE_EDIT, STATE_GET_ALL, STATE_STATUS } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { ICommonPagination } from 'src/data/interface'
import DeleteDataModel from 'src/customComponents/delete-model'




const State = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [drawerAction, setDrawerAction] = useState(false)
    const [stateName, setStateName] = useState('')
    const [stateCode, setStateCode] = useState('')
    const [countryId, setCountryId] = useState('')
    const [stateId, setStateId] = useState('')
    const [countryValue, setCountryValue] = useState<string>('')
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
    const [countryResult, setCountryResult] = useState([])
    const [result, setResult] = useState([])
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [showModel, setShowModel] = useState(false);


    const toggleAddStateDrawer = () => setDrawerAction(!drawerAction)

    const handleChange = (event: SelectChangeEvent) => {
        setCountryValue(event.target.value as string)
    }

    const defaultValues = {
        stateName: stateName,
        stateCode: stateCode,

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
        setStateId(data.id);
        setValue("stateName", data.state_name)
        setValue("stateCode", data.state_code)
        setCountryValue(data.id_country)
        setDialogTitle('Edit');
        toggleAddStateDrawer();

    }

    const deleteOnClickHandler = async (data: any) => {
        setStateId(data.id)
        setShowModel(!showModel)
    }

    const clearFormDataHandler = () => {
        reset()
        setCountryValue('')
    }

    ////////////// COUNTRY DROPDOWN ////////////////

    const countryGetAllApi = async () => {
        try {
            const data = await STATE_DROPDOWN_LIST();
            if (data.code === 200 || data.code === "200") {
                setCountryResult(data.data)
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }
    useEffect(() => {
        countryGetAllApi();
    }, []);

    /////////////////////// ADD API ///////////////////////

    const addApi = async (data: any) => {

        const payload = {
            "name": data.stateName,
            "code": data.stateCode,
            "country_id": countryValue,
        };

        try {
            const data = await STATE_ADD(payload);
            if (data.code === 200 || data.code === "200") {
                toggleAddStateDrawer();
                toast.success(data.message);
                clearFormDataHandler();
                getAllStateApi(pagination);
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

    const getAllStateApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await STATE_GET_ALL(mbPagination);
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

        getAllStateApi(pagination);

    }, []);

    const handleChangePerPageRows = (perPageRows: number) => {
        getAllStateApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        getAllStateApi({ ...pagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllStateApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            getAllStateApi({ ...pagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {

        searchBusinessUser();

    }, [searchFilter]);

    /////////////////////// EDIT API ///////////////////////

    const editApi = async (data: any) => {
        const payload = {
            "id": stateId,
            "name": data.stateName,
            "code": data.stateCode,
            "country_id": countryValue,
        };

        try {
            const data = await STATE_EDIT(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                toggleAddStateDrawer();
                clearFormDataHandler();
                getAllStateApi(pagination);
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
            "id": stateId,
        };
        try {
            const data = await STATE_DELETE(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel);
                getAllStateApi(pagination);
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
            const data = await STATE_STATUS(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                getAllStateApi(pagination);

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
            value: 'state_name',
            headerName: 'state name',
            field: 'state_name',
            text: 'text'
        },
        {
            flex: 1,
            value: 'state_code',
            headerName: 'state code',
            field: 'state_code',
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
            SwitchonChange: statusApi,


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
            addApi(data)
        } else {
            editApi(data)
        }
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='State'></CardHeader>
                    <Divider />
                    <Box>
                        <TCCTableHeader isButton value={searchFilter}
                            onChange={(e: any) => setSearchFilter(e.target.value)}
                            toggle={() => {
                                setDialogTitle('Add')
                                clearFormDataHandler()
                                toggleAddStateDrawer()
                            }}
                            ButtonName='Add State'
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
                        iconTitle='State'
                    />
                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddStateDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >
                <DrawerHeader
                    title={`${dialogTitle} State`}
                    onClick={() => {
                        clearFormDataHandler()
                        toggleAddStateDrawer()
                    }}
                    tabBar
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='stateName'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        value={stateName}
                                        label='State Name'
                                        onChange={(e) => setStateName(e.target.value)}
                                        error={Boolean(errors.stateName)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.stateName && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='stateCode'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        value={stateCode}
                                        label='State Code'
                                        onChange={(e) => setStateCode(e.target.value)}
                                        error={Boolean(errors.stateCode)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.stateCode && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>

                        <TccSelect
                            sx={{ mb: 4 }}
                            fullWidth
                            inputLabel="Select Country"
                            label='Select Country'
                            value={countryValue}
                            id='controlled-select'
                            onChange={handleChange}
                            title='country_name'
                            Options={countryResult}

                        />


                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                            <Button variant='contained' sx={{ mr: 3 }} type='submit'>
                                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={toggleAddStateDrawer}>
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

export default State