// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import { Avatar, AvatarGroup, Box, Button, CardContent, Drawer, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import DrawerHeader from 'src/customComponents/components/drawer-header'
import { useEffect, useState } from 'react'
import TccInput from 'src/customComponents/Form-Elements/inputField'
import TccCheckBox from 'src/customComponents/Form-Elements/check-box'
import { GET_ALL_ROLES, GET_ALL_MENU_ITEMS, GET_ALL_ACTIONS, ADD_ROLE_CONFIGURATION, GET_ROLE_CONFIGURATION, UPDATE_ROLE_CONFIGRATION } from 'src/services/AppServices'
import { DEFAULT_STATUS_CODE_SUCCESS } from 'src/AppConstants'
import { toast } from 'react-hot-toast'
import { access } from 'fs'
import { IAction, IMenuItem, IRole, IRoleConfiguration, IRolePermissionAccess } from 'src/data/interface'
import { DateSchema } from 'yup'

interface CardDataType {
  title: string
  avatars: string[]
  totalUsers: number
}

const cardData: CardDataType[] = [
  { totalUsers: 4, title: 'Administrator', avatars: ['https://bit.ly/dan-abramov', 'https://bit.ly/kent-c-dodds', 'https://bit.ly/ryan-florence', 'https://bit.ly/prosper-baba'] },
  { totalUsers: 7, title: 'Manager', avatars: ['https://bit.ly/dan-abramov', 'https://bit.ly/kent-c-dodds', 'https://bit.ly/ryan-florence', 'https://bit.ly/prosper-baba', 'https://bit.ly/code-beast', '2.png', '3.png'] },
  { totalUsers: 5, title: 'Users', avatars: ['https://bit.ly/dan-abramov', 'https://bit.ly/kent-c-dodds', 'https://bit.ly/ryan-florence', 'https://bit.ly/prosper-baba', 'https://bit.ly/code-beast'] },
  { totalUsers: 3, title: 'Support', avatars: ['https://bit.ly/dan-abramov', 'https://bit.ly/kent-c-dodds', 'https://bit.ly/ryan-florence'] },
  { totalUsers: 2, title: 'Restricted User', avatars: ['https://bit.ly/dan-abramov', 'https://bit.ly/kent-c-dodds'] }
]

const rolesArr: string[] = [
  'User Management',
  'Content Management',
  'Disputes Management',
  'Database Management',
  'Financial Management',
  'Reporting',
  'API Control',
  'Repository Management',
  'Payroll'
]

const avatars = ['https://bit.ly/dan-abramov', 'https://bit.ly/kent-c-dodds', 'https://bit.ly/ryan-florence', 'https://bit.ly/prosper-baba', 'https://bit.ly/code-beast']

const Roles = () => {

  const [open, setOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState<'Add' | 'Edit'>('Add')
  const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>([])
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState<boolean>(false)
  const [roleList, setRoleList] = useState<IRole[]>([]);
  const [menuItemList, setMenuItemList] = useState<IMenuItem[]>([]);
  const [actionList, setActionList] = useState<IAction[]>([]);
  const [roleName, setRoleName] = useState<string>("");
  const [isRNTouched, setIsRNTouched] = useState<boolean>(false);
  const [editRoleId, setEditRoleId] = useState<number>();

  useEffect(() => {
    fetchData()
  }, []);

  const fetchData = async () => {
    try {
      const allPromise = Promise.all([GET_ALL_ROLES(), GET_ALL_MENU_ITEMS(), GET_ALL_ACTIONS()])
      const values = await allPromise;
      for (const item of values) {
        if (item.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          toast.error(item?.message);

          return;
        }
      }

      setRoleList(values[0].data);
      setMenuItemList(values[1].data);
      setActionList(values[2].data);

    } catch (e: any) {
      toast.error(e?.data?.message)
    }
  }

  const getAllRoles = async () => {
    try {
      const data = await GET_ALL_ROLES();
      if (data.code === DEFAULT_STATUS_CODE_SUCCESS) {
        setRoleList(data.data);
      }
    } catch (e) { }
  }

  const saveRoleConfiguration = async () => {
    try {
      if (!roleName) {
        setIsRNTouched(true);

        return;
      }
      const rolePermissionAccessList: IRolePermissionAccess[] = [];

      let currentMenu = "";
      let actionList: number[] = [];
      for (const checkBox of selectedCheckbox.sort()) {
        const menuAction = checkBox.split('-');
        if (currentMenu !== menuAction[0]) {
          if (actionList.length > 0) {
            rolePermissionAccessList.push({ id_menu_item: parseInt(currentMenu), access: actionList })
          }
          actionList = [];
          currentMenu = menuAction[0];
          actionList.push(parseInt(menuAction[1]));
        } else {
          actionList.push(parseInt(menuAction[1]));
        }
      }
      if (actionList.length > 0) {
        rolePermissionAccessList.push({ id_menu_item: parseInt(currentMenu), access: actionList })
      }

      const paylaod: IRoleConfiguration = {
        role_name: roleName,
        role_permission_access: rolePermissionAccessList
      }

      if (editRoleId && dialogTitle === "Edit") {
        const data = await UPDATE_ROLE_CONFIGRATION(paylaod, editRoleId);
        if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          toast.error(data?.message)
        } else {
          toast.success(data?.message)
          handleClose();
          getAllRoles()
        }
      } else {
        const data = await ADD_ROLE_CONFIGURATION(paylaod);
        if (data.code !== DEFAULT_STATUS_CODE_SUCCESS) {
          toast.error(data?.message)
        } else {
          toast.success(data?.message)
          handleClose();
          getAllRoles()
        }
      }
    } catch (e: any) {
      toast.error(e?.data?.message)
    }

  }

  useEffect(() => {
    if (editRoleId) {
      fethRoleConfiguration(editRoleId);
    }
  }, [editRoleId]);

  const fethRoleConfiguration = async (id: number) => {
    try {
      const data = await GET_ROLE_CONFIGURATION(id);
      if (data.code === DEFAULT_STATUS_CODE_SUCCESS) {
        const tempSelectedCheckBox = [];
        for (const item of data.data.role_permission_access) {
          const findMenuItem = menuItemList.find((obj) => obj.id === item.id_menu_item);
          if (findMenuItem) {
            for (const action of item.access) {
              tempSelectedCheckBox.push(`${item.id_menu_item}-${action}`)
            }
          }
        }
        setSelectedCheckbox(tempSelectedCheckBox);
      } else {
        toast.error(data?.message)
      }
    } catch (e) { }
  }

  const handleClickOpen = () => {
    setSelectedCheckbox([])
    setIsIndeterminateCheckbox(false)
    setEditRoleId(undefined);
    setRoleName(""); setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedCheckbox([])
    setIsIndeterminateCheckbox(false)
    setEditRoleId(undefined);
    setRoleName("");
  }

  const togglePermission = (id: string) => {
    const arr = selectedCheckbox
    if (selectedCheckbox.includes(id)) {
      arr.splice(arr.indexOf(id), 1)
      setSelectedCheckbox([...arr])
    } else {
      arr.push(id)
      setSelectedCheckbox([...arr])
    }
  }

  const handleSelectAllCheckbox = () => {
    if (isIndeterminateCheckbox) {
      setSelectedCheckbox([])
    } else {

      menuItemList.forEach(row => {
        const id = row.id.toString();
        for (const action of actionList) {
          togglePermission(`${id}-${action.id}`)
        }

      })
    }
  }
  useEffect(() => {
    if (selectedCheckbox.length > 0 && selectedCheckbox.length < menuItemList.length * actionList.length) {
      setIsIndeterminateCheckbox(true)
    } else {
      setIsIndeterminateCheckbox(false)
    }
  }, [selectedCheckbox, actionList, menuItemList])

  const renderCards = () =>
    roleList.map((item, index: number) => (
      <Grid item xs={12} sm={6} lg={4} key={index}>
        <Card>
          <CardContent>
            <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ color: 'text.secondary' }}>{`Total ${item.user_count} users`}</Typography>
              {/* <AvatarGroup
                max={4}
                className='pull-up'
                sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem' } }}
              >
                {avatars.map((img: any, index: number) => (
                  <Avatar key={index} alt={item.role_name} src={img} />
                ))}
              </AvatarGroup> */}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <Typography variant='h5' sx={{ mb: 1 }}>
                  {item.role_name}
                </Typography>
                <Typography
                  href='/'
                  component={Link}
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                  onClick={e => {
                    e.preventDefault()
                    handleClickOpen()
                    setEditRoleId(item.id);
                    setRoleName(item.role_name);
                    setSelectedCheckbox([]);
                    setDialogTitle('Edit')
                  }}
                >
                  Edit Role
                </Typography>
              </Box>

            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));

  return (
    <>
      <Card sx={{ mb: 4 }}>
        <CardHeader title='Rols' />
      </Card>
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12} sm={6} lg={4}>
          <Card
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              handleClickOpen()
              setEditRoleId(undefined);
              setRoleName("");
              setSelectedCheckbox([]);
              setDialogTitle('Add')
            }}
          >
            <Grid container sx={{ height: '100%' }}>
              <Grid item xs={5}>
                <Box
                  sx={{
                    height: '100%',
                    minHeight: 140,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                  }}
                >
                  <img height={122} alt='add-role' src='/images/pages/add-new-role-illustration.png' />
                </Box>
              </Grid>
              <Grid item xs={7}>
                <CardContent sx={{ pl: 0, height: '100%' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Button
                      variant='contained'
                      sx={{ mb: 3, whiteSpace: 'nowrap' }}

                    // onClick={() => {
                    //   handleClickOpen()
                    //   setDialogTitle('Add')
                    // }}
                    >
                      Add New Role
                    </Button>
                    <Typography sx={{ color: 'text.secondary' }}>Add role, if it doesn't exist.</Typography>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        {renderCards()}
      </Grid>
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleClickOpen}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: 900, sm: 900 } } }}
      >
        <DrawerHeader
          title={`${dialogTitle} Role`}
          onClick={handleClickOpen}

        />
        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <Box sx={{ my: 4 }}>
            <TccInput fullWidth label='Role Name' value={roleName} onChange={(event: any) => { setRoleName(event.target.value); setIsRNTouched(true) }} />
            {isRNTouched && !roleName && <Typography variant='body2'>Role name is required</Typography>}
          </Box>
          <Typography variant='h6'>Role Permissions</Typography>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: '0 !important' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                        alignItems: 'center',
                        textTransform: 'capitalize',
                        '& svg': { ml: 1, cursor: 'pointer' }
                      }}
                    >
                      Administrator Access
                      <Tooltip placement='top' title='Allows a full access to the system'>
                        <Box sx={{ display: 'flex' }}>
                          <Icon icon='tabler:info-circle' fontSize='1.25rem' />
                        </Box>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell colSpan={3}>
                    <TccCheckBox
                      label='Select All'
                      sx={{ '& .MuiTypography-root': { textTransform: 'capitalize' } }}
                      size='small'
                      onChange={handleSelectAllCheckbox}
                      indeterminate={isIndeterminateCheckbox}
                      checked={selectedCheckbox.length === menuItemList.length * actionList.length}
                    />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menuItemList.map((item, index) => {
                  const id = item.id.toString()

                  return (
                    <TableRow key={index} sx={{ '& .MuiTableCell-root:first-of-type': { pl: '0 !important' } }}>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          color: theme => `${theme.palette.text.primary} !important`
                        }}
                      >
                        {item.name}
                      </TableCell>
                      {actionList.map((action) => <TableCell key={action.id}>
                        <TccCheckBox
                          label={action.action_name}
                          size='small'
                          id={`${id}-${action.action_name}`}
                          onChange={() => togglePermission(`${id}-${action.id}`)}
                          checked={selectedCheckbox.includes(`${id}-${action.id}`)}
                        />
                      </TableCell>)}

                    </TableRow>
                  )
                })}

              </TableBody>

            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 6, justifyContent: 'center' }}>
            <Button variant='contained' sx={{ mr: 3 }} onClick={saveRoleConfiguration}>
              Submit
            </Button>
            <Button variant='outlined' color='secondary' onClick={handleClose}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}

export default Roles