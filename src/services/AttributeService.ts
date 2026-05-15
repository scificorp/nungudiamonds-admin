// ** Attribute Service for Inline Creation
// ** Provides API methods for creating attributes from within product forms

import { serviceMaker, httpMethods } from '../services/ServiceWarpper'
import { apiEndPoints } from 'src/AppConstants'

/**
 * Create a new category inline
 */
export const createCategoryInline = async (data: {
  name: string
  parent_id?: number
  description?: string
  image_path?: string
}) => {
  return serviceMaker(
    apiEndPoints.ADD_CATEGORY,
    httpMethods.POST,
    data
  )
}

/**
 * Create a new subcategory inline
 */
export const createSubCategoryInline = async (data: {
  name: string
  parent_id: number
  description?: string
  image_path?: string
}) => {
  return serviceMaker(
    apiEndPoints.ADD_CATEGORY,
    httpMethods.POST,
    data
  )
}

/**
 * Create a new tag inline
 */
export const createTagInline = async (name: string) => {
  return serviceMaker(
    apiEndPoints.TAG_ADD,
    httpMethods.POST,
    { name }
  )
}

/**
 * Create a new gemstone inline
 */
export const createGemstoneInline = async (name: string) => {
  return serviceMaker(
    apiEndPoints.GEMSTONES_ADD,
    httpMethods.POST,
    { name }
  )
}

/**
 * Create a new diamond shape inline
 */
export const createDiamondShapeInline = async (name: string) => {
  return serviceMaker(
    apiEndPoints.DIAMOND_SHAPE_ADD,
    httpMethods.POST,
    { name }
  )
}

/**
 * Create a new color inline
 */
export const createColorInline = async (name: string) => {
  return serviceMaker(
    apiEndPoints.ADD_COLOR,
    httpMethods.POST,
    { name }
  )
}

/**
 * Create a new clarity inline
 */
export const createClarityInline = async (name: string) => {
  return serviceMaker(
    apiEndPoints.CLARITY_ADD,
    httpMethods.POST,
    { name }
  )
}

/**
 * Create a new cut inline
 */
export const createCutInline = async (name: string) => {
  return serviceMaker(
    apiEndPoints.CUT_ADD,
    httpMethods.POST,
    { name }
  )
}

/**
 * Create a new MM size inline
 */
export const createMmSizeInline = async (data: {
  size: number
  description?: string
}) => {
  return serviceMaker(
    apiEndPoints.ADD_MM_SIZE,
    httpMethods.POST,
    data
  )
}

/**
 * Create a new carat size inline
 */
export const createCaratSizeInline = async (data: {
  carat: number
  description?: string
}) => {
  return serviceMaker(
    apiEndPoints.CARAT_SIZE_ADD,
    httpMethods.POST,
    data
  )
}

/**
 * Generic attribute creator based on type
 */
export const createAttributeInline = async (
  attributeType: string,
  data: Record<string, unknown>
) => {
  const methods: Record<string, () => Promise<unknown>> = {
    category: () => createCategoryInline(data as any),
    tag: () => createTagInline(data.name as string),
    gemstone: () => createGemstoneInline(data.name as string),
    'diamond-shape': () => createDiamondShapeInline(data.name as string),
    color: () => createColorInline(data.name as string),
    clarity: () => createClarityInline(data.name as string),
    cut: () => createCutInline(data.name as string),
    'mm-size': () => createMmSizeInline(data as any),
    'carat-size': () => createCaratSizeInline(data as any)
  }

  const creator = methods[attributeType]
  if (!creator) {
    throw new Error(`Unknown attribute type: ${attributeType}`)
  }

  return creator()
}
