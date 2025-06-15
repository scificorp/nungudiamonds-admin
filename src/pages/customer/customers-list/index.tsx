// ** MUI Imports
import { CardContent, Divider, CardHeader, Grid, Card, Drawer, Button, FormControl, TextField, FormHelperText, SelectChangeEvent } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import Box from '@mui/material/Box'

import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { NextResponse } from 'next/dist/server/web/spec-extension/response'
import Router from 'next/router'
import { Controller, useForm } from 'react-hook-form'
import { appErrors, FIELD_REQUIRED, SEARCH_DELAY_TIME } from 'src/AppConstants'
import { CUSTOMER_ADD, CUSTOMER_COUNTRY, CUSTOMER_DELETE, CUSTOMER_EDIT, CUSTOMER_GET_ALL, CUSTOMER_STATUS } from 'src/services/AdminServices'
import { toast } from 'react-hot-toast'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import TccSelect from 'src/customComponents/Form-Elements/select'
import DeleteDataModel from 'src/customComponents/delete-model'

const Customers = () => {

  let timer: any;
  const [searchFilter, setSearchFilter] = useState()
  const [pageSize, setPageSize] = useState(10)
  const [drawerAction, setDrawerAction] = useState(false)
  const [customersName, setCustomersName] = useState('')
  const [customersId, setCustomersId] = useState('')
  const [customersEmail, setCustomersEmail] = useState('')
  const [customersPhone, setCustomersPhone] = useState('')
  const [customersPassword, setCustomersPassword] = useState('')
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState([])
  const [imageFile, setImageFile] = useState<string>()
  const [countryValue, setCountryValue] = useState<string>('')
  const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
  const [removeimage, setRemoveImage] = useState("0")
  const [showModel, setShowModel] = useState(false);
  const [imageShow, setImageShow] = useState("")
  const [countryResult, setCountryResult] = useState([])



  const toggleAddCustomersDrawer = () => {
    if (drawerAction == false) {
      setRemoveImage("1")
    } else {
      setRemoveImage("0")
    }
    setDrawerAction(!drawerAction)
  }
  const viewUserDetails = (data: any) => {
    Router.push({ pathname: "/customer/customers-details", query: { id: data.id } })
  }

  // const editUserDetails = () => {
  //   setDialogTitle('Edit')
  //   toggleAddCustomersDrawer()
  // }

  const defaultValues = {
    customersName: customersName,
    customersEmail: customersEmail,
    customersPhone: customersPhone,
    customersPassword: customersPassword,

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

  const handleChange = (event: SelectChangeEvent) => {
    setCountryValue(event.target.value as string)
  }
  const editOnClickHandler = async (data: any) => {
    setValue("customersName", data.full_name)
    setValue("customersEmail", data.email)
    setValue("customersPhone", data.mobile)
    setImageShow(data.image_path);
    setCountryValue(data.country_id)
    setDialogTitle('Edit');
    toggleAddCustomersDrawer();
    setCustomersId(data.id);
  }
  const deleteOnClickHandler = async (data: any) => {

    setCustomersId(data.id)
    setShowModel(!showModel)
  }
  const clearFormDataHandler = () => {
    reset()
    setImageShow("")
    setCountryValue('')
  }

  ////////////// COUNTRY DROPDOWN ////////////////

  const countryGetAllApi = async () => {
    try {
      const data = await CUSTOMER_COUNTRY();
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

  /////////////////// ADD API //////////////////////

  const addApi = async (data: any) => {
    const formData = new FormData()
    formData.append("image", imageFile || "")
    formData.append("full_name", data.customersName)
    formData.append("email", data.customersEmail)
    formData.append("password", data.customersPassword)
    formData.append("mobile", data.customersPhone)
    formData.append("country_id", countryValue)
    try {
      const data = await CUSTOMER_ADD(formData);
      if (data.code === 200 || data.code === "200") {
        toggleAddCustomersDrawer();
        toast.success(data.message);
        getAllApi(pagination);
        clearFormDataHandler();
      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }
    return false;
  }

  //////////////////////// GET API ////////////////////////

  const getAllApi = async (mbPagination: ICommonPagination) => {
    try {
      const data = await CUSTOMER_GET_ALL(mbPagination);
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

  ////////////////////////// EDIT API ////////////////////////////

  const editApi = async (data: any) => {
    const formData = new FormData()
    formData.append("image", imageFile || "")
    formData.append("full_name", data.customersName)
    formData.append("email", data.customersEmail)
    formData.append("mobile", data.customersPhone)
    formData.append("id", customersId)
    formData.append("country_id", countryValue)

    try {
      const data = await CUSTOMER_EDIT(formData);

      if (data.code === 200 || data.code === "200") {
        toast.success(data.message);
        toggleAddCustomersDrawer();
        clearFormDataHandler();
        getAllApi(pagination);
      } else {
        return toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }

    return false;
  }

  ///////////////////// DELETE API //////////////////

  const toggleModel = (showdata: any) => {
    setShowModel(showdata)
  }

  const deleteApi = async () => {
    const payload = {
      "id": customersId,
    };
    try {
      const data = await CUSTOMER_DELETE(payload);

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

  //////////////////// STATUS API //////////////////

  const statusApi = async (checked: boolean, row: any) => {
    const payload = {
      "id": row.id,
      "is_active": checked ? '1' : '0',
    };
    try {
      const data = await CUSTOMER_STATUS(payload);

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
      value: 'image_path',
      headerName: 'image',
      field: 'image_path',
      avatars: 'avatars'
    },
    {
      flex: 1,
      value: 'full_name',
      headerName: 'name',
      field: 'full_name',
      text: 'text'
    },
    {
      flex: 2,
      value: 'email',
      headerName: 'email',
      field: 'email',
      text: 'text'
    },
    {
      flex: 1,
      value: 'mobile',
      headerName: 'Phone Number',
      field: 'mobile',
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
      value: 'is_active',
      headerName: 'Status',
      field: 'is_active',
      switch: 'switch',
      SwitchonChange: statusApi

    },
    {
      flex: 1,
      value: 'action',
      headerName: 'action',
      field: 'action',
      edit: 'edit',
      view: 'view',
      deleted: 'delete',
      viewOnClick: viewUserDetails,
      editOnClick: editOnClickHandler,
      deletedOnClick: deleteOnClickHandler
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
          <CardHeader title='Customers List '></CardHeader>
          <Divider />
          <TCCTableHeader isButton value={searchFilter}
            onChange={(e: any) => setSearchFilter(e.target.value)}
            toggle={() => {
              toggleAddCustomersDrawer()
              setDialogTitle('Add')
              clearFormDataHandler()
            }}
            ButtonName='Add New Customers'
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
            iconTitle={'Customers'}

          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddCustomersDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <DrawerHeader
          title={`${dialogTitle} Customer`}
          onClick={() => {
            clearFormDataHandler()
            toggleAddCustomersDrawer()
          }}
          tabBar
        />
        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='customersName'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    value={customersName}
                    label='Name'
                    onChange={(e) => setCustomersName(e.target.value)}
                    error={Boolean(errors.customersName)}
                    {...field}
                  />
                )}
              />
              {errors.customersName && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='customersEmail'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    value={customersEmail}
                    label='Email'
                    onChange={(e) => setCustomersEmail(e.target.value)}
                    error={Boolean(errors.customersEmail)}
                    {...field}
                  />
                )}
              />
              {errors.customersEmail && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='customersPhone'
                control={control}
                rules={{ required: true, minLength: 10, maxLength: 10 }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    type='number'
                    size='small'
                    value={customersPhone}
                    label='Mobile No.'
                    onChange={(e) => setCustomersPhone(e.target.value)}
                    error={Boolean(errors.customersPhone)}
                    {...field}
                  />
                )}
              />
              {errors.customersPhone && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            {dialogTitle === "Add" && <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='customersPassword'
                control={control}
                rules={{ required: true }}
                render={({ field }: any) => (
                  <TextField
                    autoFocus
                    size='small'
                    value={customersPassword}
                    label='Password'
                    onChange={(e) => setCustomersPassword(e.target.value)}
                    error={Boolean(errors.customersPassword)}
                    {...field}
                  />
                )}
              />
              {errors.customersPassword && <FormHelperText sx={{ color: 'error.main' }}>{FIELD_REQUIRED}</FormHelperText>}
            </FormControl>
            }
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

            <TccSingleFileUpload onDrop={setImageFile} onClick={removeimage} imageFile={imageShow} />

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }} type="submit">
                {dialogTitle === 'Add' ? "SUBMIT" : "EDIT"}
              </Button>
              <Button variant='outlined' color='secondary' onClick={toggleAddCustomersDrawer}>
                Cancel
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
      <DeleteDataModel showModel={showModel} toggle={toggleModel} onClick={deleteApi} />
    </Grid >
  )
}

export default Customers
