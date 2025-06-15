// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { ChangeEvent, useEffect, useState } from 'react'
import { Box, Button, Divider, TextField } from '@mui/material'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import { ICommonPagination } from 'src/data/interface'
import { DELETE_PRODUCT_API, FEATURE_STATUS_UPDATE_PRODUCT, GET_ALL_PRODUCT_LIST, STATUS_UPDATE_PRODUCT, TRENDING_STATUS_UPDATE_PRODUCT } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { appErrors, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { createPagination } from 'src/utils/sharedFunction'
import DeleteDataModel from 'src/customComponents/delete-model'
import Router, { useRouter } from 'next/router'
import ProductAdd from '../add-products'
import { Icon } from '@iconify/react'

const ProductList = () => {

  let timer: any;
  const [searchFilter, setSearchFilter] = useState('')
  const [checked, setChecked] = useState<boolean>(true)
  const [productList, setProductList] = useState([])
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [showModel, setShowModel] = useState(false)
  const [productId, setProductId] = useState()

  const editOnClickHandler = (data: any) => {
    Router.push({ pathname: "/product/add-products/", query: { id: data.id } })
  }

  const viewOnClickHandler = (data: any) => {
    Router.push({ pathname: "/product/add-products/", query: { id: data.id, action: "view" } })
  }
  /////////////////// List API ///////////////////

  const getAllProductList = async (mbPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_PRODUCT_LIST(mbPagination);
      if (data.code === 200 || data.code === "200") {

        setProductList(data.data.result);
        setPagination(data.data.pagination)

      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  useEffect(() => {
    getAllProductList(pagination);
  }, []);

  const handleChangePerPageRows = (perPageRows: number) => {
    getAllProductList({ ...pagination, per_page_rows: perPageRows, current_page: 1 })
  }

  const handleOnPageChange = (page: number) => {
    getAllProductList({ ...pagination, current_page: page + 1 })
  }

  const handleChangeSortBy = (orderSort: any) => {
    getAllProductList({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }
  const searchBusinessUser = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      getAllProductList({ ...pagination, current_page: 1, search_text: searchFilter });
    }, SEARCH_DELAY_TIME);
  }

  useEffect(() => {
    searchBusinessUser();
  }, [searchFilter]);

  /////////////////// STATUS API ///////////////////

  const activeStatusDataApi = async (checked: boolean, row: any) => {
    const payload = {
      "id_product": row.id,
      "is_active": checked ? '1' : '0',
    }
    try {
      const datas = await STATUS_UPDATE_PRODUCT(payload)

      if (datas.code === 200 || datas.code === "200") {
        toast.success("Successfully updated")
        getAllProductList(pagination)

        return true
      } else {

      }
    } catch (error) {

      return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const featureproductStatusDataApi = async (checked: boolean, row: any) => {
    const payload = {
      "id_product": row.id,
      "is_featured": checked ? '1' : '0',
    }
    try {
      const datas = await FEATURE_STATUS_UPDATE_PRODUCT(payload)

      if (datas.code === 200 || datas.code === "200") {
        toast.success("Successfully updated")
        getAllProductList(pagination)

        return true
      } else {

      }
    } catch (error) {

      return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  const trendingproductStatusDataApi = async (checked: boolean, row: any) => {
    const payload = {
      "id_product": row.id,
      "is_trending": checked ? '1' : '0',
    }
    try {
      const datas = await TRENDING_STATUS_UPDATE_PRODUCT(payload)

      if (datas.code === 200 || datas.code === "200") {
        toast.success("Successfully updated")
        getAllProductList(pagination)

        return true
      } else {

      }
    } catch (error) {

      return toast.error(appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    }
  }

  /////////////////// DELETE API ///////////////////

  const deleteOnclickHandler = (data: any) => {
    setProductId(data.id)
    setShowModel(!showModel)
  }

  const deleteProductApi = async () => {

    const payload = {
      "id": productId
    }
    // console.log(payload)
    try {
      const data = await DELETE_PRODUCT_API(payload);
      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        setShowModel(!showModel)
        getAllProductList(pagination)
      } else {
        toast.error(data.message)
      }
    } catch (error) {

    }
  }

  const imagesUploadOnClick = (data: any) => {
    Router.push({ pathname: "/product/image-upload", query: { id: data.id } })
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
      value: 'sku',
      headerName: 'sku',
      field: 'sku',
      text: 'text'
    },
    {
      flex: 1,
      value: 'category_name',
      field: 'category',
      text: 'text'
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
      SwitchonChange: activeStatusDataApi
    },
    {
      flex: 1,
      value: "is_featured",
      headerName: 'featured',
      field: 'is_featured',
      switch: 'switch',
      SwitchonChange: featureproductStatusDataApi
    },
    {
      flex: 1,
      value: "is_trending",
      headerName: 'trending',
      field: 'is_trending',
      switch: 'switch',
      SwitchonChange: trendingproductStatusDataApi
    },
    {
      flex: 1,
      value: 'action',
      headerName: 'action',
      field: 'action',
      view: 'view',
      edit: 'edit',
      deleted: 'deleted',
      deletedOnClick: deleteOnclickHandler,
      imageUpload: 'imageUpload',
      imageUploadOnClick: imagesUploadOnClick,
      editOnClick: editOnClickHandler,
      viewOnClick: viewOnClickHandler,
    },
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Product List'></CardHeader>
          <Divider />

          <Box
            sx={{
              py: 4,
              px: 6,
              rowGap: 2,
              columnGap: 4,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <TextField
              size='small'
              value={searchFilter}
              placeholder='Search'
              onChange={(e: any) => setSearchFilter(e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='contained'
                color='primary'
                onClick={() => Router.push('/product/add-products')}
                startIcon={<Icon fontSize='1.125rem' icon='tabler:plus' />}
              >
                Add Product
              </Button>
            </Box>
          </Box>
          <TccDataTable
            column={column}
            rows={productList}
            handleSortChanges={handleChangeSortBy}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            iconTitle='Product'
          />
        </Card>
      </Grid>
      <DeleteDataModel showModel={showModel} toggle={(show: any) => setShowModel(show)} onClick={deleteProductApi} />

    </Grid>
  )
}

export default ProductList
