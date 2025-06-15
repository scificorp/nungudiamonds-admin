import { Divider, CardHeader, Grid, Card, Drawer, Button, FormControl, TextField, FormHelperText } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import Box, { BoxProps } from '@mui/material/Box'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { Controller, useForm } from 'react-hook-form'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'
import { TAX_ADD, TAX_DELETE, TAX_EDIT, TAX_GET_ALL, TAX_STATUS } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { ICommonPagination } from 'src/data/interface'
import DeleteDataModel from 'src/customComponents/delete-model'

const Taxs = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [drawerAction, setDrawerAction] = useState(false)
    const [name, setName] = useState('')
    const [rate, setRate] = useState('')
    const [id, setId] = useState('');
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
    const [result, setResult] = useState([])
    const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
    const [showModel, setShowModel] = useState(false);

    const toggleAddTaxDrawer = () => setDrawerAction(!drawerAction)

    const defaultValues = {
        name: name,
        rate: rate,
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
        setValue("name", data.name)
        setValue("rate", data.rate)
        setDialogTitle('Edit');
        toggleAddTaxDrawer();
        setId(data.id);
    }

    const deleteOnClickHandler = async (data: any) => {
        setId(data.id)
        setShowModel(!showModel)
    }

    const clearFormDataHandler = () => {
        reset()
    }

    /////////////////////// ADD API ///////////////////////

    const taxAddApi = async (data: any) => {

        const payload = {
            "name": data.name,
            "rate": data.rate,
        };

        try {
            const data = await TAX_ADD(payload);
            if (data.code === 200 || data.code === "200") {
                toggleAddTaxDrawer();
                toast.success(data.message);
                clearFormDataHandler();
                taxGetallApi(pagination);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    /////////////////////// GET API ///////////////////////

    const taxGetallApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await TAX_GET_ALL(mbPagination);
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
        taxGetallApi(pagination);
    }, []);

    const handleChangePerPageRows = (perPageRows: number) => {
        taxGetallApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        taxGetallApi({ ...pagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        taxGetallApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }

    const searchBusinessUser = async () => {
        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            taxGetallApi({ ...pagination, current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }

    useEffect(() => {
        searchBusinessUser();
    }, [searchFilter]);

    /////////////////////// EDIT API ///////////////////////

    const taxEditApi = async (data: any) => {
        const payload = {
            "id": id,
            "name": data.name,
            "rate": data.rate,
        };

        try {
            const data = await TAX_EDIT(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                toggleAddTaxDrawer();
                clearFormDataHandler();
                taxGetallApi(pagination);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    /////////////////////// DELETE  API ///////////////////////

    const toggleModel = (showdata: any) => {
        setShowModel(showdata)
    }

    const taxDeleteApi = async () => {
        const payload = {
            "id": id,
        };

        try {
            const data = await TAX_DELETE(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                setShowModel(!showModel);
                taxGetallApi(pagination);
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }

    //////////////////// STATUS API ///////////////////////

    const taxStatusApi = async (checked: boolean, row: any) => {
        const payload = {
            "id": row.id,
            "is_active": checked ? '1' : '0',
        };
        try {
            const data = await TAX_STATUS(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                taxGetallApi(pagination);

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
            headerName: 'name',
            field: 'name',
            text: 'text'
        },
        {
            flex: 1,
            value: 'rate',
            headerName: 'rate (%)',
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
            SwitchonChange: taxStatusApi

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
            taxAddApi(data)
        } else {
            taxEditApi(data)
        }
    }

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Tax'></CardHeader>
                    <Divider />
                    <Box>
                        <TCCTableHeader isButton value={searchFilter}
                            onChange={(e: any) => setSearchFilter(e.target.value)}
                            toggle={() => {
                                setDialogTitle('Add')
                                toggleAddTaxDrawer()
                                clearFormDataHandler();
                            }}
                            ButtonName='Add Tax'
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
                        iconTitle='Tax'
                    />
                </Card>
            </Grid>
            <Drawer
                open={drawerAction}
                anchor='right'
                variant='temporary'
                onClose={toggleAddTaxDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
            >
                <DrawerHeader
                    title={`${dialogTitle} Tax`}
                    onClick={() => {
                        clearFormDataHandler()
                        toggleAddTaxDrawer()
                    }}
                    tabBar
                />

                <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
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
                                        label='Tax name'
                                        onChange={(e) => setName(e.target.value)}
                                        error={Boolean(errors.name)}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
                        </FormControl>
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
                                        label='Rate (%)'
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
                                {dialogTitle === "Add" ? "SUBMIT" : "EDIT"}
                            </Button>
                            <Button variant='outlined' color='secondary' onClick={toggleAddTaxDrawer}>
                                Cancel
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Drawer>
            <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={taxDeleteApi} />
        </Grid>
    )
}

export default Taxs