// ** MUI Imports
import { Divider, CardHeader, Grid, Card, } from '@mui/material'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import { ICommonPagination } from 'src/data/interface'
import { GET_ALL_WISHLIST } from 'src/services/AdminServices'
import { createPagination } from 'src/utils/sharedFunction'

const WishlistProduct = () => {

  let timer: any;
  const [searchFilter, setSearchFilter] = useState()
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState<{ id: number, user_name: string, title: string, sku: string, slug: string, sort_description: string, long_description: string }[]>([]);

  const viewOnClickHandler = (data: any) => {
    window.location.href = `https://nungudiamonds.vercel.app/products/${data.slug}`;
  }

  /////////////////////// GET API ///////////////////////

  const getAllApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_WISHLIST(mbPagination);
      if (data.code === 200 || data.code === "200") {
        setPagination(data.data.pagination)
        const wishlistData = [];
        for (let i: any = 0; i < data.data.result.length; i++) {
          wishlistData.push({ id: i + 1, user_name: data.data.result[i].user_name, title: data.data.result[i].product.name, sku: data.data.result[i].product.sku, slug: data.data.result[i].product.slug, sort_description: data.data.result[i].product.sort_description, long_description: data.data.result[i].product.long_description })
        }

        setResult(wishlistData)


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
      flex: 1,
      value: 'sku',
      headerName: 'product title',
      field: 'sku',
      text: 'text'
    },
    {
      flex: 1,
      value: 'sort_description',
      headerName: 'sort_description',
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
          <CardHeader title='Wishlist Products'></CardHeader>
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

export default WishlistProduct
