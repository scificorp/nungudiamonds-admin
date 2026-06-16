// ** MUI Imports
import { Alert, Button, Card, CardContent, Divider, Drawer, FormControl, Grid, Stack, TextField, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import { useCallback, useEffect, useRef, useState } from 'react'
import AdminPageHeader from 'src/components/common/AdminPageHeader'
import TccDataTable from 'src/customComponents/data-table/table'
import Box from '@mui/material/Box'

import DrawerHeader from 'src/customComponents/components/drawer-header'
import { ICommonPagination } from 'src/data/interface'
import { createPagination } from 'src/utils/sharedFunction'
import { toast } from 'react-hot-toast'
import { SEARCH_DELAY_TIME, appErrors } from 'src/AppConstants'
import TccSelect from 'src/customComponents/Form-Elements/select'
import { GET_ALL_GENERAL_ENQUIRIES, UPDATE_GENERAL_ENQUIRIES } from 'src/services/AdminServices'

const GENERAL_LEAD_STATUSES = [
  { id: 0, name: 'Needs follow-up' },
  { id: 1, name: 'Contacted' },
  { id: 2, name: 'In progress' },
  { id: 3, name: 'Closed' }
]

type GeneralEnquiryRecord = {
  first_name: string
  last_name: string
  email: string
  phone_number: string | number
  message: string
  created_date?: string
  date?: string
  time?: string
  id?: number | string
  lead_status?: number
  lead_status_label?: string
  lead_notes?: string
  lead_handled_by?: string
  lead_handled_at?: string
}

const emptyEnquiry: GeneralEnquiryRecord = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  message: ''
}

const GeneralEnquirie = () => {


  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMountedSearch = useRef(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [pagination, setPagination] = useState({ ...createPagination(), search_text: "" })
  const [result, setResult] = useState([])
  const [enquiriedata, setEnquirieData] = useState<GeneralEnquiryRecord>(emptyEnquiry)
  const [viewDrawerAction, setViewDrawerAction] = useState(false)
  const [editorDrawerAction, setEditorDrawerAction] = useState(false)
  const [editorId, setEditorId] = useState<string | number>('')
  const [leadStatus, setLeadStatus] = useState('0')
  const [leadNotes, setLeadNotes] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const toggleViewDrawer = () => setViewDrawerAction(!viewDrawerAction)
  const toggleEditorDrawer = () => setEditorDrawerAction(!editorDrawerAction)

  const viewOnClickHandler = (data: any) => {
    toggleViewDrawer()
    setEnquirieData(data)
  }

  const editOnClickHandler = (data: any) => {
    setSaveError('')
    setEditorId(data.id)
    setLeadStatus(String(data.lead_status ?? 0))
    setLeadNotes(data.lead_notes || '')
    setEditorDrawerAction(true)
  }


  /////////////////////// GET API ///////////////////////

  const getAllApi = useCallback(async (mbPagination: ICommonPagination) => {
    setLoadError('')
    setIsLoading(true)
    try {
      const data = await GET_ALL_GENERAL_ENQUIRIES(mbPagination);
      if (data.code === 200 || data.code === "200") {
        setPagination(data.data.pagination || mbPagination)
        setResult(Array.isArray(data.data.result) ? data.data.result : [])
        setHasLoaded(true)
      } else {
        setLoadError(data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
        setHasLoaded(true)

        return toast.error(data.message);
      }
    } catch (e: any) {
      const message = e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
      setLoadError(message)
      setHasLoaded(true)
      toast.error(message);
    } finally {
      setIsLoading(false)
    }

    return false;
  }, [])

  useEffect(() => {
    getAllApi({ ...createPagination(), search_text: '' });
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
  useEffect(() => {
    if (!hasMountedSearch.current) {
      hasMountedSearch.current = true

      return
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      getAllApi({
        current_page: 1,
        per_page_rows: pagination.per_page_rows,
        sort_by: pagination.sort_by,
        order_by: pagination.order_by,
        search_text: searchFilter
      });
    }, SEARCH_DELAY_TIME);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [getAllApi, pagination.order_by, pagination.per_page_rows, pagination.sort_by, searchFilter]);

  const updateGeneralEnquiry = async () => {
    setSaveError('')
    setIsSaving(true)
    try {
      const data = await UPDATE_GENERAL_ENQUIRIES({
        id: editorId,
        status: leadStatus,
        notes: leadNotes
      })

      if (data.code === 200 || data.code === '200') {
        setEditorDrawerAction(false)
        setSaveError('')
        getAllApi(pagination)

        return toast.success(data.message)
      }

      const message = data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
      setSaveError(message)

      return toast.error(message)
    } catch (e: any) {
      const message = e?.data?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
      setSaveError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }

    return false
  }

  const column = [

    {
      flex: 1,
      value: 'first_name',
      headerName: 'First Name',
      field: 'first_name',
      text: 'text'
    },
    {
      flex: 1,
      value: 'last_name',
      headerName: 'Last Name',
      field: 'last_name',
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
      value: 'phone_number',
      headerName: 'Phone Number',
      field: 'phone_number',
      text: 'text'
    },
    {
      flex: 1,
      value: 'lead_status_label',
      headerName: 'Lead Status',
      field: 'lead_status_label',
      text: 'text'
    },
    {
      flex: 1,
      value: 'message',
      headerName: 'Inquiries',
      field: 'message',
      text: 'text'
    },
    {
      flex: 1,
      value: 'action',
      headerName: 'action',
      field: 'action',
      edit: 'edit',
      view: 'view',
      editTitle: 'Update Follow-Up',
      viewTitle: 'View Enquiry',
      editOnClick: editOnClickHandler,
      viewOnClick: viewOnClickHandler

    },
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ px: 6, pt: 6, pb: 4 }}>
            <AdminPageHeader
              title='General Enquiries'
              subtitle='Review customer enquiries and contact leads directly by email or phone.'
              searchValue={searchFilter}
              onSearchChange={setSearchFilter}
            />
          </Box>
          <Divider />
          <Box sx={{ px: 6, pt: 4 }}>
            <Alert severity='info'>
              Use the edit action to record lead status and follow-up notes. Email and phone actions remain available in the enquiry detail drawer.
            </Alert>
          </Box>
          {loadError && (
            <Box sx={{ px: 6, pt: 4 }}>
              <Alert severity='error'>
                General enquiries could not be loaded: {loadError}
              </Alert>
            </Box>
          )}
          {hasLoaded && !loadError && result.length === 0 && (
            <Box sx={{ px: 6, pt: 4 }}>
              <Alert severity='info'>No general enquiries match the current filters.</Alert>
            </Box>
          )}
          <TccDataTable
            column={column}
            rows={result}
            handleSortChanges={handleChangeSortBy}
            pageSize={parseInt(pagination.per_page_rows.toString())}
            onChangepage={handleChangePerPageRows}
            rowCount={pagination.total_items}
            page={pagination.current_page - 1}
            onPageChange={handleOnPageChange}
            emptyMessage='No general enquiries match the current filters'
            loading={isLoading}
          />
        </Card>
      </Grid>
      <Drawer
        open={viewDrawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleViewDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 520 } } }}
      >
        <DrawerHeader
          title='Enquiry Details'
          onClick={toggleViewDrawer}
        />

        <Box sx={{ p: 6 }}>
          <Stack spacing={4}>
            <Card>
              <CardContent sx={{ pb: 4 }}>
                <Typography variant='overline' sx={{ color: 'text.disabled' }}>
                  Customer
                </Typography>
                <Typography variant='h6' sx={{ mt: 1 }}>
                  {[enquiriedata.first_name, enquiriedata.last_name].filter(Boolean).join(' ') || 'Unknown customer'}
                </Typography>
                <Typography sx={{ color: 'text.secondary', mt: 1 }}>{enquiriedata.email || 'No email provided'}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{enquiriedata.phone_number || 'No phone number provided'}</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                  <Button
                    variant='contained'
                    href={enquiriedata.email ? `mailto:${enquiriedata.email}?subject=Nungu Diamonds enquiry` : undefined}
                    disabled={!enquiriedata.email}
                  >
                    Email Customer
                  </Button>
                  <Button
                    variant='outlined'
                    href={enquiriedata.phone_number ? `tel:${enquiriedata.phone_number}` : undefined}
                    disabled={!enquiriedata.phone_number}
                  >
                    Call Customer
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ pb: 4 }}>
                <Typography variant='overline' sx={{ color: 'text.disabled' }}>
                  Follow-Up
                </Typography>
                <Typography variant='h6' sx={{ mt: 1 }}>
                  {enquiriedata.lead_status_label || 'Needs follow-up'}
                </Typography>
                <Typography sx={{ color: 'text.secondary', mt: 1, whiteSpace: 'pre-wrap' }}>
                  {enquiriedata.lead_notes || 'No follow-up notes recorded yet.'}
                </Typography>
                {enquiriedata.lead_handled_at && (
                  <Typography variant='body2' sx={{ color: 'text.disabled', mt: 2 }}>
                    Last updated: {enquiriedata.lead_handled_at}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ pb: 4 }}>
                <Typography variant='overline' sx={{ color: 'text.disabled' }}>
                  Message
                </Typography>
                <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                  {enquiriedata.message || 'No enquiry message provided.'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Drawer>
      <Drawer
        open={editorDrawerAction}
        anchor='right'
        variant='temporary'
        onClose={toggleEditorDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 460 } } }}
      >
        <DrawerHeader
          title='Update Lead Follow-Up'
          onClick={toggleEditorDrawer}
        />

        <Box sx={{ p: theme => theme.spacing(0, 6, 6) }}>
          <Stack spacing={4}>
            <Alert severity='info'>
              Status and notes are saved against this enquiry id so sales staff can avoid duplicate follow-up.
            </Alert>
            {saveError && (
              <Alert severity='error'>
                Follow-up could not be saved: {saveError}
              </Alert>
            )}
            <TccSelect
              fullWidth
              inputLabel='Lead Status'
              label='Lead Status'
              value={leadStatus}
              id='general-enquiry-lead-status'
              onChange={(event: any) => setLeadStatus(String(event.target.value))}
              title='name'
              Options={GENERAL_LEAD_STATUSES}
              disabled={isSaving}
            />
            <FormControl fullWidth>
              <TextField
                autoFocus
                disabled={isSaving}
                multiline
                minRows={4}
                value={leadNotes}
                label='Follow-up notes'
                onChange={(event: any) => setLeadNotes(event.target.value)}
              />
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LoadingButton
                variant='contained'
                sx={{ mr: 3 }}
                loading={isSaving}
                disabled={!editorId}
                onClick={() => void updateGeneralEnquiry()}
              >
                Save Follow-Up
              </LoadingButton>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Grid>
  )
}

export default GeneralEnquirie
