// ** MUI Imports
import { Divider, CardHeader, Grid, Card, Drawer, Button } from '@mui/material'
import { useEffect, useState } from 'react'
import TCCTableHeader from 'src/customComponents/data-table/header'
import TccDataTable from 'src/customComponents/data-table/table'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import TccSingleFileUpload from 'src/customComponents/Form-Elements/file-upload/singleFile-upload'
import TccSelect from 'src/customComponents/Form-Elements/select'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { ADD_BUSINESS_USER, DELETE_BUSINESS_USER, GET_ALL_BUSINESS_USER, GET_ALL_ROLES, UPDATE_BUSINESS_USER } from 'src/services/AppServices'
import { DEFAULT_STATUS_CODE_SUCCESS, SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import { toast } from 'react-hot-toast'
import { IBusinessUser, ICommonPagination, IRole } from 'src/data/interface'
import { useForm, Controller } from 'react-hook-form'
import { createPagination } from 'src/utils/sharedFunction'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import DeleteDataModel from 'src/customComponents/delete-model'

interface IBUFormState {
  name: string,
  email: string,
  phone_number: string,
  password: string,
  confirm_password: string,
  id_role: string,
  is_active: string,
}

const buDefaultValues = {
  name: "",
  email: "",
  phone_number: "",
  password: "",
  confirm_password: "",
  id_role: "",
  is_active: '1',
}


const schema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  phone_number: yup.string().required().min(10, 'Please Enter 10 Digit Number').max(10, 'Please Enter 10 Digit Number'),
  password: yup.string().required(),
  confirm_password: yup.string().required(),
  id_role: yup.string().required(),
})

const editSchema = yup.object().shape({
  name: yup.string().required(),
  phone_number: yup.string().required().min(10, 'Please Enter 10 Digit Number').max(10, 'Please Enter 10 Digit Number'),
  id_role: yup.string().required(),
})

const UserList = () => {

  const [searchFilter, setSearchFilter] = useState()
  const [drawerAction, setDrawerAction] = useState(false)
  const [businessUserList, setBusinessUserList] = useState<IBusinessUser[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ title: string; id: number; }[]>([]);
  const [imageFile, setImageFile] = useState<File>();
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
  const [showModel, setShowModel] = useState(false);
  const [deleteId, setDeleteId] = useState('')

  let timer: any;
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IBUFormState>({
    defaultValues: buDefaultValues, mode: 'onBlur',
    resolver: !editId ? yupResolver(schema) : yupResolver(editSchema)
  })

  const toggleAddUserDrawer = () => { if (!drawerAction) { reset(buDefaultValues) } setDrawerAction(!drawerAction), setEditId(null) }

  const onClickEdit = (row: IBusinessUser) => {
    setEditId(row.id);
    setDialogTitle('Edit');
    reset({ name: row.name, phone_number: row.phone_number, id_role: row.id_role, is_active: row.is_active })
    setDrawerAction(true);
  }

  const deleteOnClickHandler = async (data: any) => {
    setDeleteId(data.id)
    setShowModel(!showModel)
  }

  const toggleModel = (showdata: any) => {
    setShowModel(showdata)
  }

  const deleteApi = async () => {
    try {
      const data = await DELETE_BUSINESS_USER(parseInt(deleteId));
      if (data?.code === DEFAULT_STATUS_CODE_SUCCESS) {
        toast.success(data?.message);
        fetchBusinessUser({ ...pagination, current_page: 1 });
        setShowModel(!showModel);
      } else {
        toast.error(data?.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN);
    }
  }


  const switchonChange = async (checked: boolean, row: any) => {
    try {
      const formData = new FormData();
      formData.append('is_active', checked ? '1' : '0');
      formData.append('only_active_inactive', '1');
      const data = await UPDATE_BUSINESS_USER(formData, row.id);
      if (data?.code === DEFAULT_STATUS_CODE_SUCCESS) {
        toast.success(data?.message);
        const tempBusinessUserList = businessUserList.map(item => {
          if (item.id === row.id) {
            return { ...item, is_active: checked ? '1' : '0' }
          }

          return item
        })
        setBusinessUserList(tempBusinessUserList)
      } else {
        toast.error(data?.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message);

    }
  }

  const column = [
    // {
    //   flex: 1,
    //   value: 'imgs',
    //   headerName: 'image',
    //   field: 'imgs',
    //   avatars: 'avatars'
    // },
    {
      flex: 1,
      value: 'name',
      headerName: 'name',
      field: 'name',
      text: 'text'
    },
    {
      flex: 1,
      value: 'email',
      headerName: 'email',
      field: 'email',
      text: 'text'
    },
    {
      flex: 1,
      value: 'phone_number',
      headerName: 'Phone Number',
      field: 'phone_number',
      text: 'text'
    },
    {
      flex: 1,
      value: 'is_active',
      headerName: 'Status',
      field: 'is_active',
      switch: 'switch',
      SwitchonChange: switchonChange
    },

    {
      flex: 1,
      value: 'action',
      headerName: 'action',
      field: 'action',
      edit: 'switch',
      editOnClick: onClickEdit,
      deleted: 'switch',
      deletedOnClick: deleteOnClickHandler
    },
  ]

  useEffect(() => {
    fetchBusinessUser(pagination);
    getAllRoles();
  }, []);

  const getAllRoles = async () => {
    try {
      const data = await GET_ALL_ROLES();
      if (data.code === DEFAULT_STATUS_CODE_SUCCESS) {
        const tempRoleOptions = [];
        for (const item of data.data) {
          tempRoleOptions.push({ title: item.role_name, id: item.id });
        }
        setRoleOptions(tempRoleOptions);
      }
    } catch (e) { }
  }

  const fetchBusinessUser = async (buPagination: ICommonPagination) => {
    try {
      const data = await GET_ALL_BUSINESS_USER(buPagination);
      if (data.code === DEFAULT_STATUS_CODE_SUCCESS) {
        setBusinessUserList(data.data.result);
        setPagination(data.data.pagination)
      } else {
        toast.error(data?.message);
      }
    } catch (e: any) {
      toast.error(e?.data?.message);
    }
  }

  const searchBusinessUser = async () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fetchBusinessUser({ ...pagination, current_page: 1, search_text: searchFilter });
    }, SEARCH_DELAY_TIME);
  }

  useEffect(() => {
    searchBusinessUser();
  }, [searchFilter]);

  const saveBusinessUser = async (values: IBUFormState) => {
    try {

      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('phone_number', values.phone_number);
      formData.append('id_role', values.id_role.toString());
      formData.append('is_active', values.is_active);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (!editId) {
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('confirm_password', values.confirm_password);
      }

      let data;
      if (!editId) {

        data = await ADD_BUSINESS_USER(formData);
      } else {

        data = await UPDATE_BUSINESS_USER(formData, editId);
      }
      if (data?.code === DEFAULT_STATUS_CODE_SUCCESS) {
        reset(buDefaultValues);
        toast.success(data?.message);
        setDrawerAction(false);
        fetchBusinessUser({ ...pagination, current_page: 1 });
      } else {
        toast.error(data?.message);
      }

    } catch (e: any) {
      toast.error(e?.data?.message, {
        position: "top-center"
      });
    }

  }
  const handleChangeSortBy = (orderSort: any) => {
    fetchBusinessUser({ ...pagination, sort_by: orderSort == undefined ? "id" : orderSort.map((t: any) => t.field), order_by: orderSort == undefined ? "DESC" : orderSort.map((t: any) => t.sort) })
  }

  const handleChangePerPageRows = (perPageRows: number) => {
    fetchBusinessUser({ ...pagination, per_page_rows: perPageRows })
  }

  const handleOnPageChange = (page: number) => {
    fetchBusinessUser({ ...pagination, current_page: page + 1 })
  }



  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='User List'></CardHeader>
          <Divider />
          <TCCTableHeader isButton value={searchFilter}
            onChange={(e: any) => setSearchFilter(e.target.value)}
            toggle={() => {
              setDialogTitle('Add')
              toggleAddUserDrawer()
            }}
            ButtonName='Add New User'
          />
          <TccDataTable
            column={column}
            rows={businessUserList}
            handleSortChanges={handleChangeSortBy}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            iconTitle={'User'}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
          />
        </Card>
      </Grid>
      <Drawer
        open={drawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleAddUserDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
      >
        <DrawerHeader
          title={`${dialogTitle} New user`}
          onClick={() => {
            toggleAddUserDrawer()
          }}
        />
        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <form onSubmit={handleSubmit(saveBusinessUser)}>
            <FormControl fullWidth>
              <Controller
                name='name'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TccInput label='Name' fullWidth
                    sx={{ mb: 4, mt: 4 }}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    error={Boolean(errors.name)} />
                )}
              />
              {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
            </FormControl>


            {!editId && <FormControl fullWidth>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TccInput label='Email' fullWidth
                    sx={{ mb: 4, mt: 4 }}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}

                    error={Boolean(errors.email)} />
                )}
              />
              {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}

            </FormControl>}

            <FormControl fullWidth>
              <Controller
                name='phone_number'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TccInput label='Phone Number' fullWidth
                    sx={{ mb: 4, mt: 4 }}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    type="number"
                    error={Boolean(errors.phone_number)} />
                )}

              />
              {errors.phone_number && <FormHelperText sx={{ color: 'error.main' }}>{errors.phone_number.message}</FormHelperText>}

            </FormControl>

            {!editId && <FormControl fullWidth>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TccInput label='Password' fullWidth
                    sx={{ mb: 4, mt: 4 }}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}

                    error={Boolean(errors.password)} />
                )}
              />
              {errors.password && <FormHelperText sx={{ color: 'error.main' }}>{errors.password.message}</FormHelperText>}

            </FormControl>}

            {!editId && <FormControl fullWidth>
              <Controller
                name='confirm_password'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TccInput label='Confirm Password' fullWidth
                    sx={{ mb: 4, mt: 4 }}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}

                    error={Boolean(errors.confirm_password)} />
                )}
              />
              {errors.confirm_password && <FormHelperText sx={{ color: 'error.main' }}>{errors.confirm_password.message}</FormHelperText>}

            </FormControl>}

            <FormControl fullWidth>
              <Controller
                name='id_role'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TccSelect
                    sx={{ mb: 8, mt: 4 }}
                    inputLabel="Select Role"
                    label='Select Role'
                    Options={roleOptions}
                    onChange={onChange}
                    onBlur={onBlur}
                    title="title"
                    fullWidth
                    value={value || ""}
                    error={Boolean(errors.id_role)}
                  />
                )}
              />
              {errors.id_role && <FormHelperText sx={{ marginTop: '-2px', color: 'error.main' }}>{errors.id_role.message}</FormHelperText>}

            </FormControl>

            <TccSingleFileUpload />

            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button variant='contained' sx={{ mr: 3 }} type='submit'>
                Submit
              </Button>
              <Button variant='outlined' color='secondary' onClick={toggleAddUserDrawer}>
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

export default UserList