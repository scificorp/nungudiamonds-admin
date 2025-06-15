// ** MUI Imports
import { Divider, CardHeader, Grid, Card, } from '@mui/material'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import { ICommonPagination } from 'src/data/interface'
import { GET_ALL_CART_PRODUCT } from 'src/services/AdminServices'
import { createPagination } from 'src/utils/sharedFunction'

const CartProduct = () => {

    let timer: any;
    const [searchFilter, setSearchFilter] = useState()
    const [pageSize, setPageSize] = useState(10)
    const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
    const [result, setResult] = useState<{ id: number, user_name: string, title: string, sku: string, slug: string, sort_description: string, long_description: string }[]>([]);



    const viewOnClickHandler = (data: any) => {

        window.location.href = `https://nungudiamonds.vercel.app/products/${data.slug}`;

    }

    /////////////////////// GET API ///////////////////////

    const getAllApi = async (mbPagination: ICommonPagination) => {
        try {
            const data = await GET_ALL_CART_PRODUCT(mbPagination);
            if (data.code === 200 || data.code === "200") {
                setPagination(data.data.pagination)
                const productcartData = [];
                for (const item of data.data.result) {
                    productcartData.push({ id: item.product.id, user_name: item.user_name, title: item.product.name, sku: item.product.sku, slug: item.product.slug, sort_description: item.product.sort_description, long_description: item.product.long_description });
                }
                setResult(productcartData);
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

    const column = [
        {
            flex: 1,
            value: 'user_name',
            headerName: 'User Name',
            field: 'user_name',
            text: 'text'
        },
        {
            flex: 1,
            value: 'title',
            headerName: 'Product name',
            field: 'title',
            text: 'text'
        },
        {
            flex: 1.5,
            value: 'sku',
            headerName: 'sku',
            field: 'sku',
            text: 'text'
        },
        {
            flex: 1,
            value: 'sort_description',
            headerName: 'Sort Description',
            field: 'sort_description',
            text: 'text'
        },
        {
            flex: 1,
            value: 'action',
            headerName: 'action',
            field: 'action',
            view: 'view',
            viewOnClick: viewOnClickHandler
        },
    ]

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='Cart Products'></CardHeader>
                    <Divider />

                    <TCCTableHeader value={searchFilter}
                        onChange={(e: any) => setSearchFilter(e.target.value)}

                    />
                    <TccDataTable
                        column={column}
                        rows={result}
                        handleSortChanges={handleChangeSortBy}
                        pageSize={parseInt(pagination.per_page_rows.toString())}
                        onChangepage={handleChangePerPageRows}
                        rowCount={pagination.total_items}
                        page={pagination.current_page - 1}
                        onPageChange={handleOnPageChange}
                        iconTitle={'Product'}
                    />
                </Card>
            </Grid>

        </Grid>
    )
}

export default CartProduct
