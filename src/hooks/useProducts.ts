import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  GET_ALL_PRODUCT_LIST,
  GET_BY_ID_PRODUCTS,
  STATUS_UPDATE_PRODUCT,
  FEATURE_STATUS_UPDATE_PRODUCT,
  TRENDING_STATUS_UPDATE_PRODUCT,
  DELETE_PRODUCT_API,
  GET_COLLECTIONS_BY_PRODUCT,
  ADD_PRODUCT_DROPDOWN_LIST,
  GET_DIAMOND_GROUP_MASTER_WITH_DETAILS,
  ADD_PRODUCT_DETAILS,
  EDIT_PRODUCT_DETAILS
} from 'src/services/AdminServices'
import { ICommonPagination } from 'src/data/interface'
import { toast } from 'react-hot-toast'
import { appErrors } from 'src/AppConstants'
import { getDropdownLookupErrorMessage } from 'src/utils/permissionResilience'

const PRODUCT_LIST_KEY = 'productList'
const PRODUCT_DETAIL_KEY = 'productDetail'
const PRODUCT_DROPDOWNS_KEY = 'productDropdowns'

type ProductListFilters = {
  is_active?: ICommonPagination['is_active']
}

export const useProducts = (
  pagination: ICommonPagination,
  useEnhancedView = true,
  filters: ProductListFilters = {}
) => {
  return useQuery(
    [PRODUCT_LIST_KEY, { ...pagination, group_variants: useEnhancedView ? 'true' : 'false', ...filters }],
    async () => {
      const paginationWithGrouping = {
        ...pagination,
        group_variants: useEnhancedView ? 'true' : 'false',
        ...filters
      }
      const data = await GET_ALL_PRODUCT_LIST(paginationWithGrouping)
      if (data.code === 200 || data.code === '200') {
        const result = data.data.result.map((product: any) => ({
          ...product,
          collections: product.product_collections?.map((pc: any) => pc.collection).filter(Boolean) || []
        }))

        return { ...data.data, result }
      }
      throw new Error(data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    },
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )
}

export const useProductDetail = (productId: number | null) => {
  return useQuery(
    [PRODUCT_DETAIL_KEY, productId],
    async () => {
      if (!productId) return null
      const data = await GET_BY_ID_PRODUCTS(productId)
      if (data.code === 200 || data.code === '200') {
        return data.data
      }
      throw new Error(data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
      enabled: !!productId,
      refetchOnWindowFocus: false
    }
  )
}

export const useProductCollections = (productId: number) => {
  return useQuery(
    ['productCollections', productId],
    async () => {
      const data = await GET_COLLECTIONS_BY_PRODUCT(productId)
      if (data.code === 200) {
        return data.data?.collections || []
      }

      return []
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
      enabled: !!productId,
      refetchOnWindowFocus: false
    }
  )
}

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload: { id_product: number; is_active: string }) => {
      const data = await STATUS_UPDATE_PRODUCT(payload)
      if (data.code === 200 || data.code === '200') {
        return data
      }
      throw new Error(data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([PRODUCT_LIST_KEY])
        toast.success('Status updated successfully')
      },
      onError: (error: any) => {
        toast.error(error.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
      }
    }
  )
}

export const useUpdateProductFeature = () => {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload: { id_product: number; is_featured: string }) => {
      const data = await FEATURE_STATUS_UPDATE_PRODUCT(payload)
      if (data.code === 200 || data.code === '200') {
        return data
      }
      throw new Error(data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([PRODUCT_LIST_KEY])
        toast.success('Featured status updated successfully')
      },
      onError: (error: any) => {
        toast.error(error.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
      }
    }
  )
}

export const useUpdateProductTrending = () => {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload: { id_product: number; is_trending: string }) => {
      const data = await TRENDING_STATUS_UPDATE_PRODUCT(payload)
      if (data.code === 200 || data.code === '200') {
        return data
      }
      throw new Error(data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([PRODUCT_LIST_KEY])
        toast.success('Trending status updated successfully')
      },
      onError: (error: any) => {
        toast.error(error.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
      }
    }
  )
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload: { id: number }) => {
      const data = await DELETE_PRODUCT_API(payload)
      if (data.code === 200 || data.code === '200') {
        return data
      }
      throw new Error(data.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([PRODUCT_LIST_KEY])
        queryClient.invalidateQueries([PRODUCT_DETAIL_KEY])
        toast.success('Product deleted successfully')
      },
      onError: (error: any) => {
        toast.error(error.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
      }
    }
  )
}

export const useSaveProduct = () => {
  const queryClient = useQueryClient()

  return useMutation(
    async (payload: any) => {
      const { isEdit, data } = payload
      let response
      if (isEdit) {
        response = await EDIT_PRODUCT_DETAILS(data)
      } else {
        response = await ADD_PRODUCT_DETAILS(data)
      }
      if (response.code === 200 || response.code === '200') {
        return response
      }
      throw new Error(response.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([PRODUCT_LIST_KEY])
        if (variables.isEdit && variables.data.id) {
          queryClient.invalidateQueries([PRODUCT_DETAIL_KEY, variables.data.id])
        }
        toast.success(variables.isEdit ? 'Product updated successfully' : 'Product created successfully')
      },
      onError: (error: any) => {
        toast.error(error.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
      }
    }
  )
}

export const useProductDropdowns = () => {
  return useQuery(
    PRODUCT_DROPDOWNS_KEY,
    async () => {
      const [dropdownsResult, diamondGroupsResult] = await Promise.allSettled([
        ADD_PRODUCT_DROPDOWN_LIST(),
        GET_DIAMOND_GROUP_MASTER_WITH_DETAILS()
      ])

      if (dropdownsResult.status === 'rejected') {
        throw dropdownsResult.reason
      }

      const dropdownsData = dropdownsResult.value

      if (dropdownsData.code === 200 || dropdownsData.code === '200') {
        const diamondGroupsData = diamondGroupsResult.status === 'fulfilled' ? diamondGroupsResult.value : null
        const hasDiamondGroups = diamondGroupsData?.code === 200 || diamondGroupsData?.code === '200'

        return {
          ...dropdownsData.data,
          diamond_groups_with_details: hasDiamondGroups ? diamondGroupsData?.data : [],
          diamond_groups_with_details_error: hasDiamondGroups
            ? null
            : getDropdownLookupErrorMessage(
                diamondGroupsResult.status === 'rejected' ? diamondGroupsResult.reason : diamondGroupsData,
                'Diamond group details'
              )
        }
      }
      throw new Error(dropdownsData.message || appErrors.UNKNOWN_ERROR_TRY_AGAIN)
    },
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  )
}
