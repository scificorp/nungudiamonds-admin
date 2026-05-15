// ** React Imports
import { useState, useCallback, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import {
  Button,
  CardContent,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,

  Chip,
  LinearProgress,
  Alert
} from '@mui/material'

// Using text buttons instead of icons since @mui/icons-material is not available

// ** Custom Components
import TccFileUpload from 'src/customComponents/Form-Elements/file-upload/xml-file-upload'
import AdminPageHeader from 'src/components/common/AdminPageHeader'

// ** Services
import { BULK_UPLOAD_ADD_PRODUCT, VALIDATE_BULK_UPLOAD_PRODUCT } from 'src/services/AdminServices'

// ** Utils
import { toast } from 'react-hot-toast'
import { appErrors } from 'src/AppConstants'
import Router from 'next/router'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ProductRow {
  id: string;
  product_name: string;
  product_sku: string;
  category?: string;
  price?: number;
  description?: string;
  error_message?: string;
  isValid: boolean;
  isEditing: boolean;
  originalData: any;
}

interface BulkUploadSession {
  fileName: string | null
  tabValue: number
  validRows: ProductRow[]
  errorRows: ProductRow[]
  debugData: any
  updatedAt: string
}

interface EnhancedBulkUploadProps {
  onSuccess?: () => void;
}

const PRODUCT_BULK_TEMPLATE_HEADERS = [
  'is_parent',
  'category',
  'sub_category',
  'sub_sub_category',
  'name',
  'sku',
  'tag',
  'short_description',
  'long_description',
  'labour_charge',
  'finding_charge',
  'other_charge',
  'setting_style_type',
  'size',
  'length',
  'metal',
  'karat',
  'metal_tone',
  'metal_weight',
  'stone',
  'shape',
  'mm_size',
  'color',
  'clarity',
  'cut',
  'stone_type',
  'stone_setting',
  'stone_weight',
  'stone_count',
  'gender',
  'image_tone',
  'video_file',
  'featured_image',
  'image_visualization',
  'other_Images'
]

const PRODUCT_BULK_TEMPLATE_ROWS = [
  [
    '1',
    'Rings',
    '',
    '',
    'Sample Ring',
    'SAMPLE-RING-001',
    'Wedding|Love',
    'Short storefront summary',
    'Long product description',
    '0',
    '0',
    '0',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Female',
    '',
    '',
    '',
    '',
    ''
  ]
]

const escapeCsvValue = (value: string | number | null | undefined) => {
  const stringValue = String(value ?? '')

  return `"${stringValue.replace(/"/g, '""')}"`
}

const downloadCsvFile = (fileName: string, rows: string[][]) => {
  const csvContent = rows
    .map(row => row.map(escapeCsvValue).join(','))
    .join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  window.URL.revokeObjectURL(url)
}

const EnhancedBulkUpload = ({ onSuccess }: EnhancedBulkUploadProps) => {
  const SESSION_STORAGE_KEY = 'nungu-product-bulk-upload-session'

  // ** States
  const [file, setFile] = useState<File>()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tabValue, setTabValue] = useState(0)
  const [validRows, setValidRows] = useState<ProductRow[]>([])
  const [errorRows, setErrorRows] = useState<ProductRow[]>([])
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [rowDrafts, setRowDrafts] = useState<Record<string, { product_name: string; product_sku: string; category?: string; price?: number | string; description?: string }>>({})
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'parsing' | 'validating' | 'uploading' | 'complete'>('idle')
  const [debugData, setDebugData] = useState<any>(null)
  const [restoredSession, setRestoredSession] = useState(false)
  const [savedFileName, setSavedFileName] = useState<string | null>(null)

  useEffect(() => {
    if (file) {
      setSavedFileName(file.name)
    }
  }, [file])

  // ** Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const savedSession = window.localStorage.getItem(SESSION_STORAGE_KEY)
      if (!savedSession) {
        setRestoredSession(true)

        return
      }

      const parsedSession = JSON.parse(savedSession) as BulkUploadSession
      setSavedFileName(parsedSession.fileName)
      setTabValue(parsedSession.tabValue ?? 0)
      setValidRows(parsedSession.validRows || [])
      setErrorRows(parsedSession.errorRows || [])
      setDebugData(parsedSession.debugData || null)
      setRestoredSession(true)
    } catch (error) {
      console.error('Failed to restore bulk upload session', error)
      setRestoredSession(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !restoredSession) {
      return
    }

    const session: BulkUploadSession = {
      fileName: savedFileName,
      tabValue,
      validRows,
      errorRows,
      debugData,
      updatedAt: new Date().toISOString()
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }, [debugData, errorRows, restoredSession, savedFileName, tabValue, validRows])

  const downloadSampleFile = useCallback(() => {
    downloadCsvFile('nungu-product-import-template.csv', [
      PRODUCT_BULK_TEMPLATE_HEADERS,
      ...PRODUCT_BULK_TEMPLATE_ROWS
    ])
  }, [])

  const downloadErrorReport = useCallback(() => {
    if (errorRows.length === 0) {
      toast.error('No error rows to export')

      return
    }

    downloadCsvFile('bulk-upload-error-report.csv', [
      ['product_name', 'product_sku', 'error_message'],
      ...errorRows.map(row => [
        row.product_name,
        row.product_sku,
        row.error_message || ''
      ])
    ])
  }, [errorRows])

  const clearSavedSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_STORAGE_KEY)
    }
    setSavedFileName(null)
    setValidRows([])
    setErrorRows([])
    setDebugData(null)
    setTabValue(0)
    setRowDrafts({})
    setEditingRow(null)
    toast.success('Saved bulk-upload session cleared')
  }, [])

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
      'text/plain',
      'application/octet-stream',
      ''
    ];
    const allowedExtensions = ['.csv', '.xlsx', '.xls']
    const fileName = file.name.toLowerCase()
    const hasAllowedExtension = allowedExtensions.some(extension => fileName.endsWith(extension))
    const hasAllowedType = allowedTypes.includes(file.type)

    if (!hasAllowedExtension || !hasAllowedType) {
      toast.error('Please upload a valid CSV or Excel file with a .csv, .xlsx, or .xls extension')
      
return false
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      
return false
    }

    return true
  }

  const processValidationResponse = (data: any) => {
    // Store debug data for inspection
    setDebugData(data)

    if (data.code === 200 || data.code === "200") {
      // All products are valid
      const validProducts = data.data.products.map((product: any, index: number) => ({
        id: `valid-${index}`,
        product_name: product.name,
        product_sku: product.sku,
        category: product.category,
        price: product.price,
        isValid: true,
        isEditing: false,
        originalData: product
      }))

      setValidRows(validProducts)
      setErrorRows([])
      setTabValue(0) // Switch to valid rows tab
      setProcessingStatus('idle')
      toast.success(`Validation successful! ${validProducts.length} products are ready for upload.`)

    } else if (data.code === 422) {
      // Validation failed with errors
      setProcessingStatus('idle')

      if (data.data && Array.isArray(data.data.errors)) {
        const errors = data.data.errors.map((error: any, index: number) => ({
          id: `error-${index}`,
          product_name: error.product_name || 'Unknown',
          product_sku: error.product_sku || 'Unknown',
          error_message: error.error_message,
          isValid: false,
          isEditing: false,
          originalData: error
        }))

        setErrorRows(errors)
        setValidRows([])
        setTabValue(1) // Switch to errors tab
        toast.error(`Validation failed with ${errors.length} errors. Please review and fix them.`)
      } else {
        toast.error(data.message || 'Validation failed')
      }
    } else {
      setProcessingStatus('idle')
      toast.error(data.message || 'Validation failed')
    }
  }

  const processUploadResponse = (data: any) => {
    if (data.code === 200 || data.code === "200") {
      // Success case
      setValidRows([])
      setErrorRows([])
      setDebugData(null)
      setSavedFileName(null)
      setProcessingStatus('complete')
      toast.success(data.message || 'Products uploaded successfully')
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(SESSION_STORAGE_KEY)
      }

      if (onSuccess) {
        onSuccess()
      } else {
        Router.push({ pathname: "/product/all-products" })
      }
    } else {
      // Error case - parse the response
      setProcessingStatus('idle')

      if (Array.isArray(data.data)) {
        const errors = data.data.map((error: any, index: number) => ({
          id: `error-${index}`,
          product_name: error.product_name || 'Unknown',
          product_sku: error.product_sku || 'Unknown',
          error_message: error.error_message,
          isValid: false,
          isEditing: false,
          originalData: error
        }))

        setErrorRows(errors)
        setTabValue(1) // Switch to errors tab
        toast.error(`Upload failed with ${errors.length} errors. Please review and fix them.`)
      } else {
        toast.error(data.message || 'Upload failed')
      }
    }
  }

  const validateAndPreviewApi = async () => {
    if (!file) {
      return toast.error('Please select a file to upload')
    }

    if (!validateFile(file)) {
      return
    }

    setIsLoading(true)
    setProcessingStatus('parsing')
    setUploadProgress(10)

    const formData = new FormData()
    formData.append("product_csv", file)

    try {
      setProcessingStatus('validating')
      setUploadProgress(50)

      const data = await VALIDATE_BULK_UPLOAD_PRODUCT(formData)
      setUploadProgress(100)

      processValidationResponse(data)

    } catch (e: any) {
      console.error('Validation error:', e)
      setProcessingStatus('idle')
      setUploadProgress(0)

      const errorMessage = e?.data?.message || e?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
      toast.error(errorMessage)

      if (e?.data?.data && Array.isArray(e.data.data)) {
        const errors = e.data.data.map((error: any, index: number) => ({
          id: `error-${index}`,
          product_name: error.product_name || 'Unknown',
          product_sku: error.product_sku || 'Unknown',
          error_message: error.error_message,
          isValid: false,
          isEditing: false,
          originalData: error
        }))

        setErrorRows(errors)
        setTabValue(1) // Switch to errors tab
      }
    } finally {
      setIsLoading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const bulkUploadApi = async () => {
    if (!file) {
      return toast.error('Please select a file to upload')
    }

    if (!validateFile(file)) {
      return
    }

    setIsLoading(true)
    setProcessingStatus('uploading')
    setUploadProgress(10)

    const formData = new FormData()
    formData.append("product_csv", file)

    try {
      setUploadProgress(50)

      const data = await BULK_UPLOAD_ADD_PRODUCT(formData)
      setUploadProgress(100)

      processUploadResponse(data)

    } catch (e: any) {
      console.error('Bulk upload error:', e)
      setProcessingStatus('idle')
      setUploadProgress(0)

      const errorMessage = e?.data?.message || e?.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN
      toast.error(errorMessage)

      if (e?.data?.data && Array.isArray(e.data.data)) {
        const errors = e.data.data.map((error: any, index: number) => ({
          id: `error-${index}`,
          product_name: error.product_name || 'Unknown',
          product_sku: error.product_sku || 'Unknown',
          error_message: error.error_message,
          isValid: false,
          isEditing: false,
          originalData: error
        }))

        setErrorRows(errors)
        setTabValue(1) // Switch to errors tab
      }
    } finally {
      setIsLoading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const handleEditRow = (rowId: string) => {
    const row = errorRows.find(item => item.id === rowId)
    if (row) {
      setRowDrafts(prev => ({
        ...prev,
        [rowId]: {
          product_name: row.product_name,
          product_sku: row.product_sku,
          category: row.category,
          price: row.price,
          description: row.description
        }
      }))
    }
    setEditingRow(rowId)
  }

  const handleSaveRow = (rowId: string, updatedData: Partial<ProductRow>) => {
    setErrorRows(prev => prev.map(row => {
      if (row.id !== rowId) {
        return row
      }

      const draft = rowDrafts[rowId] || {}

      return {
        ...row,
        ...updatedData,
        product_name: draft.product_name || row.product_name,
        product_sku: draft.product_sku || row.product_sku,
        category: draft.category || row.category,
        price: draft.price !== undefined ? Number(draft.price) : row.price,
        description: draft.description || row.description,
        isEditing: false
      }
    }))
    setEditingRow(null)

    setRowDrafts(prev => {
      const next = { ...prev }
      delete next[rowId]

      return next
    })
    toast.success('Row updated successfully')
  }

  const handleCancelEdit = () => {
    setEditingRow(null)
  }

  const batchSize = validRows.length + errorRows.length
  const hasValidationResults = validRows.length > 0 || errorRows.length > 0
  const validationState = errorRows.length > 0
    ? 'Needs fixes'
    : validRows.length > 0
      ? 'Ready to upload'
      : 'Awaiting validation'
  const validationSeverity = errorRows.length > 0 ? 'warning' : validRows.length > 0 ? 'success' : 'info'
  const validationMessage = errorRows.length > 0
    ? `Validation found ${errorRows.length} row${errorRows.length === 1 ? '' : 's'} that need attention before upload.`
    : validRows.length > 0
      ? `Validation passed. ${validRows.length} row${validRows.length === 1 ? '' : 's'} are ready to upload.`
      : 'Run validation to see how many rows are ready and how many need fixes.'

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Box sx={{ px: 6, pt: 6, pb: 4 }}>
            <AdminPageHeader
              title='Bulk Product Upload'
              subtitle='Validate product imports before upload, recover saved validation sessions, and fix failed rows without starting over.'
              actions={
                <Button
                  variant='outlined'
                  onClick={downloadSampleFile}
                  size='small'
                >
                  Download Template
                </Button>
              }
            />
          </Box>
          <Divider />
          <CardContent>
            {restoredSession && (validRows.length > 0 || errorRows.length > 0 || debugData) && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Restored a saved bulk upload session{savedFileName ? ` for ${savedFileName}` : ''}. You can continue reviewing errors or clear the session when finished.
              </Alert>
            )}

            <Alert severity='info' sx={{ mb: 3 }}>
              The template is generated from the backend parser order. `name` and `category` are required;
              other columns can be left blank. For Excel files, keep the columns in the same order because
              the import service reads cells by position.
            </Alert>

            <Typography variant='h6' sx={{ mb: 2 }}>Upload Instructions:</Typography>
            <Typography sx={{ mb: 1 }}>• Upload CSV (.csv) or Excel (.xlsx, .xls) files with product data</Typography>
            <Typography sx={{ mb: 1 }}>• Required fields: category and product name</Typography>
            <Typography sx={{ mb: 1 }}>• Keep the template column order intact for Excel imports</Typography>
            <Typography sx={{ mb: 1 }}>• Maximum file size: 10MB</Typography>
            <Typography sx={{ mb: 1 }}>• Sub-categories, pricing, attributes, images, and videos are optional</Typography>
            <Typography sx={{ mb: 4 }}>• Validation results are saved locally so you can continue reviewing later</Typography>

            <TccFileUpload onDrop={setFile} />

            {(file || hasValidationResults || savedFileName) && (
              <Card variant='outlined' sx={{ mt: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant='caption' color='text.secondary'>
                        File
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {file?.name || savedFileName || 'No file selected'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant='caption' color='text.secondary'>
                        Batch size
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {batchSize}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant='caption' color='text.secondary'>
                        Ready to upload
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {validRows.length}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant='caption' color='text.secondary'>
                        Needs fixes
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {errorRows.length}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Alert severity={validationSeverity} sx={{ mt: 2 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {validationState}
                    </Typography>
                    <Typography variant='body2'>
                      {validationMessage}
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {processingStatus === 'parsing' && 'Parsing file...'}
                  {processingStatus === 'validating' && 'Validating data...'}
                  {processingStatus === 'uploading' && 'Uploading products...'}
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant='outlined'
                onClick={validateAndPreviewApi}
                disabled={isLoading || !file}
                size="large"
              >
                {isLoading && processingStatus === 'validating' ? 'Validating...' : 'Validate & Preview'}
              </Button>

              {validRows.length > 0 && (
                <Button
                  variant='contained'
                  onClick={bulkUploadApi}
                  disabled={isLoading}
                  size="large"
                >
                  {isLoading && processingStatus === 'uploading' ? 'Uploading...' : `Upload ${validRows.length} Products`}
                </Button>
              )}

              {(validRows.length > 0 || errorRows.length > 0) && (
                <Button
                  variant='text'
                  onClick={clearSavedSession}
                >
                  Clear Session
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {(validRows.length > 0 || errorRows.length > 0) && (
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Upload Results' />
            <Divider />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Valid Rows
                      {validRows.length > 0 && (
                        <Chip size="small" label={validRows.length} color="success" />
                      )}
                    </Box>
                  }
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      Errors
                      {errorRows.length > 0 && (
                        <Chip size="small" label={errorRows.length} color="error" />
                      )}
                    </Box>
                  }
                />
                <Tab
                  label="Debug Data"
                />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {validRows.length > 0 ? (
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {validRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.product_name}</TableCell>
                          <TableCell>{row.product_sku}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.price}</TableCell>
                          <TableCell>
                            <Chip label="Valid" color="success" size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No valid rows to display</Alert>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {errorRows.length > 0 ? (
                <>
                  <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={downloadErrorReport}
                    >
                      Download Error Report
                    </Button>
                    <Alert severity="warning" sx={{ flex: 1 }}>
                      Fix the source file, or use the rows below as a reference for correction. The session is saved locally until you clear it.
                    </Alert>
                  </Box>

                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product Name</TableCell>
                          <TableCell>SKU</TableCell>
                          <TableCell>Error Message</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {errorRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              {editingRow === row.id ? (
                                <TextField
                                  size="small"
                                  value={rowDrafts[row.id]?.product_name ?? row.product_name}
                                  onChange={(e) => {
                                    setRowDrafts(prev => ({
                                      ...prev,
                                      [row.id]: {
                                        ...(prev[row.id] || {}),
                                        product_name: e.target.value
                                      }
                                    }))
                                  }}
                                />
                              ) : (
                                row.product_name
                              )}
                            </TableCell>
                            <TableCell>
                              {editingRow === row.id ? (
                                <TextField
                                  size="small"
                                  value={rowDrafts[row.id]?.product_sku ?? row.product_sku}
                                  onChange={(e) => {
                                    setRowDrafts(prev => ({
                                      ...prev,
                                      [row.id]: {
                                        ...(prev[row.id] || {}),
                                        product_sku: e.target.value
                                      }
                                    }))
                                  }}
                                />
                              ) : (
                                row.product_sku
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="error">
                                {row.error_message}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.isValid ? "Fixed" : "Error"}
                                color={row.isValid ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {editingRow === row.id ? (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    color="primary"
                                    variant="contained"
                                    onClick={() => handleSaveRow(row.id, { isValid: true })}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </Button>
                                </Box>
                              ) : (
                                <Button
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  onClick={() => handleEditRow(row.id)}
                                >
                                  Edit
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Alert severity="success">No errors found!</Alert>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Debug Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This shows the raw parsed data from your CSV file to help debug any issues.
                </Typography>
              </Box>

              {debugData ? (
                <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      API Response:
                    </Typography>
                    <pre style={{
                      fontSize: '12px',
                      lineHeight: '1.4',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {JSON.stringify(debugData, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              ) : (
                <Alert severity="info">
                  No debug data available. Upload and validate a file to see parsed data.
                </Alert>
              )}
            </TabPanel>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default EnhancedBulkUpload
