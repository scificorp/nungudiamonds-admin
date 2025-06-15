// ** MUI Imports
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Typography, IconButton, Button, FormControl, TextField, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import Box, { BoxProps } from '@mui/material/Box'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { COUNTRY_ADD, COUNTRY_DELETE, COUNTRY_EDIT, COUNTRY_GET_ALL, COUNTRY_STATUS } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import { Controller, useForm } from 'react-hook-form'
import DeleteDataModel from 'src/customComponents/delete-model'


const Country = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [drawerAction, setDrawerAction] = useState(false)
    const [countryName, setCountryName] = useState("")
    const [countryCode, setCountryCode] = useState("")
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
    const [result, setResult] = useState([])
    const [countryId, setCountryId] = useState("")
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [showModel, setShowModel] = useState(false);
    const toggleAddCountryDrawer = () => setDrawerAction(!drawerAction)

    const defaultValues = {
        countryName: countryName,
        countryCode: countryCode
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
        setValue("countryName", data.country_name)
        setValue("countryCode", data.country_code)
        setDialogTitle('Edit');
        toggleAddCountryDrawer();
        setCountryId(data.id);
    }

    const deleteOnClickHandler = async (data: any) => {
        setCountryId(data.id)
        setShowModel(!showModel)
    }

    const clearFormDataHandler = () => {
        reset()
    }

    /////////////////////// ADD API ///////////////////////

    const addApi = async (data: any) => {

        const payload = {
            "name": data.countryName,
            "code": data.countryCode,
        };
        try {
            const data = await COUNTRY_ADD(payload);
            if (data.code === 200 || data.code === "200") {
                toggleAddCountryDrawer();
                toast.success(data.message);
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

    /////////////////////// GET ALL API ///////////////////////

    const getAllApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await COUNTRY_GET_ALL(mbPagination);
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
            "id": countryId,
            "name": data.countryName,
            "code": data.countryCode,
        };
        try {
            const data = await COUNTRY_EDIT(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                toggleAddCountryDrawer();
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
            "id": countryId,
        };
        try {
            const data = await COUNTRY_DELETE(payload);
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
            const data = await COUNTRY_STATUS(payload);
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
            value: 'country_name',
            headerName: 'country name',
            field: 'country_name',
            text: 'text'
        },
        {
            flex: 1,
            value: 'country_code',
            headerName: 'country code',
            field: 'country_code',
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
                    <CardHeader title='Country'></CardHeader>
                    <Divider />
                    <Box>
                        <TCCTableHeader isButton value={searchFilter}
                            onChange={(e: any) => setSearchFilter(e.target.value)}
                            toggle={() => {
                                setDialogTitle('Add')
                                toggleAddCountryDrawer()
                                clearFormDataHandler()
                            }}
                            ButtonName='Add Country'
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
                        iconTitle='Country'
                    />
                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddCountryDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >
                <DrawerHeader
                    title={`${dialogTitle} Country`}
                    onClick={() => {
                        clearFormDataHandler()
                        toggleAddCountryDrawer()
                        clearFormDataHandler()
                    }}
                    tabBar
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='countryName'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        value={countryName}
                                        label='Country Name'
                                        onChange={(e) => setCountryName(e.target.value)}
                                        error={Boolean(errors.countryName)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.countryName && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='countryCode'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }: any) => (
                                    <TextField
                                        autoFocus
                                        size='small'
                                        label='Country Code'
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        error={Boolean(errors.countryCode)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.countryCode && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
                            <Button variant='contained' sx={{ mr: 3 }} type="submit">
                                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={toggleAddCountryDrawer}>
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

export default Country