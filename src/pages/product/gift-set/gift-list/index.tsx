// ** MUI Imports
import { Icon } from '@iconify/react'
import { Alert, Divider, Grid, Card, Button } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import TccDataTable from 'src/customComponents/data-table/table'
import Box from '@mui/material/Box'
import { appErrors, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'
import { GIFTSET_DELETE, GIFTSET_GET_ALL, GIFTSET_STATUS } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { ICommonPagination } from 'src/data/interface'
import DeleteDataModel from 'src/customComponents/delete-model'
import Router from 'next/router'
import AdminPageHeader from 'src/components/common/AdminPageHeader'

const GiftSet = () => {

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [searchFilter, setSearchFilter] = useState('')
    const [id, setId] = useState('');
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
    const [showModel, setShowModel] = useState(false);
    const [result, setResult] = useState([])

    const editOnClickHandler = async (data: any) => {
        Router.push({ pathname: "/product/gift-set/gift-add", query: { slug: data.slug } })
    }

    const viewOnClickHandler = async (data: any) => {
        Router.push({ pathname: "/product/gift-set/gift-add", query: { slug: data.slug, action: "view" } })
    }

    const deleteOnClickHandler = async (data: any) => {
        setId(data.id)
        setShowModel(!showModel)
    }



    /////////////////////// GET API ///////////////////////

    const getAllApi = useCallback(async (mbPagination: ICommonPagination) => {
        try {
            const data = await GIFTSET_GET_ALL(mbPagination);

            if (data.code === 200 || data.code === "200") {
                setResult(Array.isArray(data.data.result) ? data.data.result : [])
                setPagination(data.data.pagination || mbPagination)
            } else {
                return toast.error(data.message);
            }
        } catch (e: any) {
            toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
        }

        return false;
    }, [])

    useEffect(() => {
        getAllApi({ ...createPagination(), search_text: "" });
    }, [getAllApi]);

    const handleChangePerPageRows = (perPageRows: number) => {
        getAllApi({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
    }

    const handleOnPageChange = (page: number) => {
        getAllApi({ ...pagination, current_page: page + 1 })
    }

    const handleChangeSortBy = (orderSort: any) => {
        getAllApi({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
    }
    const searchBusinessUser = useCallback(async () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }

        timerRef.current = setTimeout(() => {
            getAllApi({ ...createPagination(), current_page: 1, search_text: searchFilter });
        }, SEARCH_DELAY_TIME);
    }, [getAllApi, searchFilter]);

    useEffect(() => {
        searchBusinessUser();
    }, [searchBusinessUser]);


    /////////////////////// DELETE  API ///////////////////////

    const toggleModel = (showdata: any) => {
        setShowModel(showdata)
    }

    const deleteApi = async () => {
        const payload = {
            "id": id,
        };

        try {
            const data = await GIFTSET_DELETE(payload);
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
            const data = await GIFTSET_STATUS(payload);
            if (data.code === 200 || data.code === "200") {
                toast.success(data.message);
                getAllApi(pagination)

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
            headerName: 'product title',
            field: 'product_title',
            value: 'product_title',
            text: 'text'
        },
        {
            flex: 1,
            value: 'sku',
            headerName: 'sku',
            field: 'sku',
            text: 'text'
        },
        {
            flex: 1,
            value: 'price',
            headerName: 'price',
            field: 'price',
            price: 'price'
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
            value: "is_active",
            headerName: 'Status',
            field: 'is_active',
            switch: 'switch',
            SwitchonChange: statusApi
        },
        {
            flex: 2,
            headerName: 'Action',
            field: 'action',
            view: 'view',
            viewOnClick: viewOnClickHandler,
            edit: "edit",
            editOnClick: editOnClickHandler,
            deleted: 'deleted',
            deletedOnClick: deleteOnClickHandler,
        },
    ]


    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <Divider />
                    <Box sx={{ px: 6, pt: 6, pb: 4 }}>
                        <AdminPageHeader
                            title='Legacy Gift Products'
                            subtitle='Manage standalone gift products used by the legacy giftset order flow.'
                            searchValue={searchFilter}
                            onSearchChange={setSearchFilter}
                            actions={
                                <Button
                                    variant='contained'
                                    onClick={() => Router.push("/product/gift-set/gift-add")}
                                    startIcon={<Icon icon='tabler:plus' />}
                                >
                                    Add Gift Product
                                </Button>
                            }
                        />
                        <Alert severity='warning' sx={{ mt: 3 }}>
                            This is not a bundle builder. The current API stores standalone gift products and
                            giftset orders separately; it does not attach multiple catalog products into one bundled offer.
                        </Alert>
                    </Box>
                    <Divider />
                    <TccDataTable
                        column={column}
                        rows={result}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(pagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={pagination.total_items}
                        page={pagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle='Gift Product'
                        emptyMessage='No legacy gift products found.'
                    />
                </Card>
            </Grid>

            <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={deleteApi} />
        </Grid>
    )
}

export default GiftSet
