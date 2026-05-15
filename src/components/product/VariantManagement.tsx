import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  Alert
} from '@mui/material'
import { Icon } from '@iconify/react'
import { toast } from 'react-hot-toast'
import { GET_BY_ID_PRODUCTS } from 'src/services/AdminServices'

interface ProductVariant {
  id: number
  name: string
  sku: string
  size: string
  other_charge: number
  making_charge: number
  finding_charge: number
  is_active: string
  is_featured: string
  is_trending: string
}

interface VariantManagementProps {
  productId: number
  onVariantsChange?: () => void
}

const VariantManagement: React.FC<VariantManagementProps> = ({ productId, onVariantsChange }) => {
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [parentProduct, setParentProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProductAndVariants = async () => {
      if (!productId) {
        return
      }

      setLoading(true)
      try {
        const response = await GET_BY_ID_PRODUCTS(productId)
        if (response.code === 200) {
          const product = response.data.findProduct
          setParentProduct(product)

          if (product.is_parent === '1') {
            setVariants(product.variants || [])
          } else {
            if (product.parent_product_id) {
              const parentResponse = await GET_BY_ID_PRODUCTS(product.parent_product_id)
              if (parentResponse.code === 200) {
                setParentProduct(parentResponse.data.findProduct)
                setVariants(parentResponse.data.findProduct.variants || [])
              }
            }
          }
        }
      } catch (error) {
        toast.error('Failed to fetch product variants')
      } finally {
        setLoading(false)
      }
    }

    fetchProductAndVariants()
  }, [productId])

  if (!parentProduct) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Loading product information...</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Variant Management</Typography>
      </Box>

      {parentProduct.is_parent !== '1' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This is a product variant. Variants can only be managed from the parent product.
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        Variant creation stays in the legacy product workspace for now. This screen is read-only while we consolidate the catalog flow.
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Parent Product: {parentProduct.name}
          </Typography>
          
          {variants.length === 0 ? (
            <Alert severity="info">
              No variants found for this product.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Variant Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Price (Other Charge)</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>{variant.name}</TableCell>
                      <TableCell>{variant.sku}</TableCell>
                      <TableCell>
                        <Chip label={variant.size} size="small" color="primary" />
                      </TableCell>
                      <TableCell>R {variant.other_charge?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={variant.is_active === '1' ? 'Active' : 'Inactive'}
                          size="small"
                          color={variant.is_active === '1' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Variant">
                            <IconButton size="small">
                              <Icon icon="tabler:edit" fontSize={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Variant">
                            <IconButton size="small" color="error">
                              <Icon icon="tabler:trash" fontSize={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

    </Box>
  )
}

export default VariantManagement
