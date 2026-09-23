import React, { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Switch,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material'
import { Icon } from '@iconify/react'
import CustomChip from 'src/@core/components/mui/chip'
import ProductCollections from './ProductCollections'

interface ProductVariant {
  id: number
  name: string
  sku: string
  slug: string
  sort_description: string
  is_featured: string
  is_active: string
  is_trending: string
  is_parent: string
  parent_product_id: number | null
  size: string
  other_charge: number
}

interface ProductWithVariants {
  id: number
  name: string
  sku: string
  slug: string
  sort_description: string
  long_description: string
  is_featured: string
  is_active: string
  is_trending: string
  is_parent: string
  parent_product_id: number | null
  gender: number[]
  category_name: string
  child_variants: ProductVariant[]
  variant_count: number
  collections?: any[]
}

interface EnhancedProductTableProps {
  products: ProductWithVariants[]
  onEdit: (productId: number) => void
  onView: (productId: number) => void
  onDelete: (product: ProductWithVariants | ProductVariant) => void
  onImageUpload: (productId: number) => void
  onStatusChange: (checked: boolean, product: ProductWithVariants) => void
  onFeaturedChange: (checked: boolean, product: ProductWithVariants) => void
  onTrendingChange: (checked: boolean, product: ProductWithVariants) => void
  isLoading?: boolean
}

const EnhancedProductTable: React.FC<EnhancedProductTableProps> = ({
  products,
  onEdit,
  onView,
  onDelete,
  onImageUpload,
  onStatusChange,
  onFeaturedChange,
  onTrendingChange,
  isLoading = false
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRowExpansion = (productId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedRows(newExpanded)
  }

  const renderVariantRow = (variant: ProductVariant, parentCollections: any[] = []) => (
    <TableRow key={`variant-${variant.id}`} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
      <TableCell sx={{ pl: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon icon="tabler:corner-down-right" style={{ marginRight: 8, color: '#666' }} />
          <Typography variant="body2" color="text.secondary">
            {variant.name}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {variant.sku}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          Inherited from parent
        </Typography>
      </TableCell>
      <TableCell>
        <ProductCollections collections={parentCollections} isInherited={true} />
      </TableCell>
      <TableCell>
        <CustomChip
          rounded
          skin='light'
          size='small'
          label={variant.is_active === '1' ? "Active" : "Inactive"}
          color={variant.is_active === '1' ? "success" : "error"}
          sx={{ textTransform: 'capitalize' }}
        />
      </TableCell>
      <TableCell>
        <Tooltip title='Enable/Disable'>
          <Switch
            checked={variant.is_active === "1"}
            onChange={(event, checked) => onStatusChange(checked, variant as any)}
            size="small"
          />
        </Tooltip>
      </TableCell>
      <TableCell>
        <Tooltip title='Featured'>
          <Switch
            checked={variant.is_featured === "1"}
            onChange={(event, checked) => onFeaturedChange(checked, variant as any)}
            size="small"
          />
        </Tooltip>
      </TableCell>
      <TableCell>
        <Tooltip title='Trending'>
          <Switch
            checked={variant.is_trending === "1"}
            onChange={(event, checked) => onTrendingChange(checked, variant as any)}
            size="small"
          />
        </Tooltip>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => onView(variant.id)}>
              <Icon icon="tabler:eye" fontSize={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(variant.id)}>
              <Icon icon="tabler:edit" fontSize={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Images">
            <IconButton size="small" onClick={() => onImageUpload(variant.id)}>
              <Icon icon="tabler:photo" fontSize={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(variant)} color="error">
              <Icon icon="tabler:trash" fontSize={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  )

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product Name</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Collections</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Featured</TableCell>
            <TableCell>Trending</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && products.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={32} />
                  <Typography color="text.secondary">Loading products...</Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          {!isLoading && products.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No products found</Typography>
              </TableCell>
            </TableRow>
          )}
          {products.map((product) => (
            <React.Fragment key={product.id}>
              {/* Parent Product Row */}
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {product.variant_count > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(product.id)}
                        sx={{ mr: 1 }}
                      >
                        <Icon
                          icon={expandedRows.has(product.id) ? "tabler:chevron-down" : "tabler:chevron-right"}
                          fontSize={16}
                        />
                      </IconButton>
                    )}
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {product.name}
                      </Typography>
                      {product.variant_count > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {product.variant_count} variant{product.variant_count !== 1 ? 's' : ''}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category_name || 'No category'}</TableCell>
                <TableCell>
                  <ProductCollections collections={product.collections} />
                </TableCell>
                <TableCell>
                  <CustomChip
                    rounded
                    skin='light'
                    size='small'
                    label={product.is_active === '1' ? "Active" : "Inactive"}
                    color={product.is_active === '1' ? "success" : "error"}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title='Enable/Disable'>
                    <Switch
                      checked={product.is_active === "1"}
                      onChange={(event, checked) => onStatusChange(checked, product)}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title='Featured'>
                    <Switch
                      checked={product.is_featured === "1"}
                      onChange={(event, checked) => onFeaturedChange(checked, product)}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title='Trending'>
                    <Switch
                      checked={product.is_trending === "1"}
                      onChange={(event, checked) => onTrendingChange(checked, product)}
                    />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => onView(product.id)}>
                        <Icon icon="tabler:eye" fontSize={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(product.id)}>
                        <Icon icon="tabler:edit" fontSize={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Images">
                      <IconButton size="small" onClick={() => onImageUpload(product.id)}>
                        <Icon icon="tabler:photo" fontSize={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => onDelete(product)} color="error">
                        <Icon icon="tabler:trash" fontSize={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>

              {/* Child Variants */}
              {product.variant_count > 0 && expandedRows.has(product.id) && (
                <>
                  {product.child_variants.map((variant) =>
                    renderVariantRow(variant, product.collections || [])
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default EnhancedProductTable
