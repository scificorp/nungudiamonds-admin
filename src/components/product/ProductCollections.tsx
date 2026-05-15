import { Box, Chip, Tooltip, Typography } from '@mui/material'

interface Collection {
  id: number
  name: string
  collection_name?: string
  slug: string
  is_inherited?: boolean
  inherited_from_parent?: boolean
}

interface ProductCollectionsProps {
  collections?: Collection[]
  isInherited?: boolean
}

const ProductCollections: React.FC<ProductCollectionsProps> = ({ collections = [], isInherited = false }) => {
  if (!collections || collections.length === 0) {
    return <Typography variant="body2" color="text.secondary">No collections</Typography>
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {collections.slice(0, 2).map((collection, index) => {
        const isCollectionInherited = collection.is_inherited || collection.inherited_from_parent || isInherited;

        return (
          <Chip
            key={index}
            label={collection.name || collection.collection_name}
            size="small"
            variant={isCollectionInherited ? "outlined" : "filled"}
            color={isCollectionInherited ? "default" : "primary"}
            sx={{
              ...(isCollectionInherited && {
                borderStyle: 'dashed',
                color: 'text.secondary',
                borderColor: 'text.secondary'
              })
            }}
          />
        );
      })}
      {collections.length > 2 && (
        <Chip
          label={`+${collections.length - 2} more`}
          size="small"
          variant="outlined"
          color="default"
        />
      )}
      {isInherited && (
        <Tooltip title="Collections inherited from parent product">
          <Chip
            label="Inherited"
            size="small"
            variant="outlined"
            color="info"
            sx={{ fontSize: '0.7rem' }}
          />
        </Tooltip>
      )}
    </Box>
  )
}

export default ProductCollections
