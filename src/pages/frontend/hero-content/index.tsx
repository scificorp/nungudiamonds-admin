import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useRouter } from 'next/router'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardHeader from '@mui/material/CardHeader'
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import EnhancedPreviewModal from '../../../components/hero-content/enhanced-preview-modal'
import URLInputSection from '../../../components/hero-content/url-input-section'
import { API_ENDPOINT, LOCAL_ADMIN_AUTHORIZATION_TOKEN } from 'src/AppConfig'
import LoadingButton from 'src/components/common/LoadingButton'

type HeroContentType = 'video' | 'image'
type HeroFontFamilyToken = 'display-serif' | 'body-sans'
type HeroTextColorToken = 'white' | 'soft-white' | 'gold'
type HeroCtaTextColorToken = 'white' | 'charcoal' | 'gold'
type HeroCtaBackgroundColorToken = 'gold' | 'charcoal' | 'white'
type HeroCtaAction = 'cms_page' | 'route' | 'booking_modal' | 'external_url'
type HeroPublicationStatus = 'draft' | 'published' | 'scheduled'
type HeroSaveMode = 'draft' | 'publish' | 'schedule'
type OverlayAlignment = 'left' | 'center' | 'right'
type OverlayWidth = 'compact' | 'regular' | 'wide'
type PreviewDevice = 'desktop' | 'mobile'
type PreviewWorkspaceMode = 'view' | 'edit'
type MediaPanelMode = 'gallery' | 'upload'
type GalleryDensity = 'compact' | 'comfortable'
type OverlayLayer = 'group' | 'headline' | 'supporting_text' | 'cta'
type ResizeHandle = 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const DRAG_ACTIVATION_THRESHOLD = 8
const HERO_API_BASE_URL = API_ENDPOINT.replace(/\/$/, '')
const loginDisabled = process.env.NEXT_PUBLIC_DISABLE_ADMIN_LOGIN === 'true' && process.env.NODE_ENV !== 'production'

const getHeroAdminAccessToken = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  if (loginDisabled && LOCAL_ADMIN_AUTHORIZATION_TOKEN) {
    return LOCAL_ADMIN_AUTHORIZATION_TOKEN
  }

  const storedToken = localStorage.getItem('accessToken')

  return storedToken || ''
}

const getReadableApiError = (raw: string) => {
  try {
    const parsed = JSON.parse(raw)
    const nestedMessage =
      Array.isArray(parsed?.data) && parsed.data.length > 0 && parsed.data[0]?.msg ? parsed.data[0].msg : null

    return nestedMessage || parsed?.message || 'Failed to save hero configuration'
  } catch {
    return raw || 'Failed to save hero configuration'
  }
}

const HERO_NUMERIC_FALLBACKS: Array<[keyof HeroContentData, number]> = [
  ['overlay_scale', 100],
  ['desktop_overlay_x', 28],
  ['desktop_overlay_y', 68],
  ['mobile_overlay_x', 50],
  ['mobile_overlay_y', 72],
  ['desktop_group_width', 460],
  ['mobile_group_width', 300],
  ['headline_scale', 100],
  ['supporting_text_scale', 100],
  ['cta_scale', 100],
  ['desktop_headline_x', 28],
  ['desktop_headline_y', 60],
  ['desktop_headline_width', 460],
  ['desktop_supporting_text_x', 28],
  ['desktop_supporting_text_y', 70],
  ['desktop_supporting_text_width', 460],
  ['desktop_cta_x', 28],
  ['desktop_cta_y', 81],
  ['desktop_cta_width', 320],
  ['mobile_headline_x', 50],
  ['mobile_headline_y', 62],
  ['mobile_headline_width', 280],
  ['mobile_supporting_text_x', 50],
  ['mobile_supporting_text_y', 72],
  ['mobile_supporting_text_width', 280],
  ['mobile_cta_x', 50],
  ['mobile_cta_y', 83],
  ['mobile_cta_width', 260]
]

const sanitizeHeroPayloadForSave = (payload: HeroContentData): HeroContentData => {
  const nextPayload = { ...payload }

  HERO_NUMERIC_FALLBACKS.forEach(([field, fallback]) => {
    const currentValue = nextPayload[field]

    if (currentValue === '' || currentValue === null || currentValue === undefined || Number.isNaN(Number(currentValue))) {
      ;(nextPayload[field] as unknown as number) = fallback

      return
    }

    ;(nextPayload[field] as unknown as number) = Number(currentValue)
  })

  return nextPayload
}

const PREVIEW_NAVBAR_HEIGHT: Record<PreviewDevice, number> = {
  desktop: 96,
  mobile: 64
}

const MIN_LAYER_WIDTH: Record<PreviewDevice, number> = {
  desktop: 160,
  mobile: 120
}

const MAX_LAYER_WIDTH: Record<PreviewDevice, number> = {
  desktop: 900,
  mobile: 360
}

interface HeroContentData {
  id?: number
  desktop_video_url: string
  mobile_video_url: string
  desktop_image_url: string
  mobile_image_url: string
  desktop_content_type: HeroContentType
  mobile_content_type: HeroContentType
  content_type: HeroContentType
  headline: string
  supporting_text: string
  cta_label: string
  cta_action_type: HeroCtaAction
  cta_target_slug: string
  cta_target_url: string
  headline_font_family: HeroFontFamilyToken
  supporting_text_font_family: HeroFontFamilyToken
  cta_font_family: HeroFontFamilyToken
  headline_color: HeroTextColorToken
  supporting_text_color: HeroTextColorToken
  cta_text_color: HeroCtaTextColorToken
  cta_background_color: HeroCtaBackgroundColorToken
  publication_status: HeroPublicationStatus
  go_live_at: string
  published_at?: string | null
  overlay_alignment: OverlayAlignment
  overlay_width: OverlayWidth
  overlay_scale: number
  desktop_overlay_x: number
  desktop_overlay_y: number
  mobile_overlay_x: number
  mobile_overlay_y: number
  overlay_grouped: boolean
  desktop_group_width: number
  mobile_group_width: number
  headline_scale: number
  supporting_text_scale: number
  cta_scale: number
  desktop_headline_x: number
  desktop_headline_y: number
  desktop_headline_width: number
  desktop_supporting_text_x: number
  desktop_supporting_text_y: number
  desktop_supporting_text_width: number
  desktop_cta_x: number
  desktop_cta_y: number
  desktop_cta_width: number
  mobile_headline_x: number
  mobile_headline_y: number
  mobile_headline_width: number
  mobile_supporting_text_x: number
  mobile_supporting_text_y: number
  mobile_supporting_text_width: number
  mobile_cta_x: number
  mobile_cta_y: number
  mobile_cta_width: number
  is_active: boolean
}

interface UploadedFile {
  id: string | number
  name: string
  url: string
  type: HeroContentType
  size: number
  uploadedAt?: string | Date
  preview?: string
  file?: File
  isUploaded: boolean
  source: 'cdn' | 'local'
}

interface PreviewData {
  desktop_url: string
  mobile_url: string
  desktop_content_type: HeroContentType
  mobile_content_type: HeroContentType
  content_type: HeroContentType
  headline?: string
  supporting_text?: string
  cta_label?: string
  headline_font_family?: HeroFontFamilyToken
  supporting_text_font_family?: HeroFontFamilyToken
  cta_font_family?: HeroFontFamilyToken
  headline_color?: HeroTextColorToken
  supporting_text_color?: HeroTextColorToken
  cta_text_color?: HeroCtaTextColorToken
  cta_background_color?: HeroCtaBackgroundColorToken
  overlay_alignment?: OverlayAlignment
  overlay_width?: OverlayWidth
  overlay_scale?: number
  desktop_overlay_x?: number
  desktop_overlay_y?: number
  mobile_overlay_x?: number
  mobile_overlay_y?: number
  overlay_grouped?: boolean
  desktop_group_width?: number
  mobile_group_width?: number
  headline_scale?: number
  supporting_text_scale?: number
  cta_scale?: number
  desktop_headline_x?: number
  desktop_headline_y?: number
  desktop_headline_width?: number
  desktop_supporting_text_x?: number
  desktop_supporting_text_y?: number
  desktop_supporting_text_width?: number
  desktop_cta_x?: number
  desktop_cta_y?: number
  desktop_cta_width?: number
  mobile_headline_x?: number
  mobile_headline_y?: number
  mobile_headline_width?: number
  mobile_supporting_text_x?: number
  mobile_supporting_text_y?: number
  mobile_supporting_text_width?: number
  mobile_cta_x?: number
  mobile_cta_y?: number
  mobile_cta_width?: number
}

interface HeroAdminConfigResponse {
  active_content: HeroContentData
  editable_content: HeroContentData
  draft_content?: HeroContentData | null
  scheduled_content?: HeroContentData | null
}

interface InteractionState {
  device: PreviewDevice
  layer: OverlayLayer
  mode: 'move' | 'resize'
  hasMoved?: boolean
  handle?: ResizeHandle
  startX: number
  startY: number
  startWidth: number
  startScale: number
}

const defaultHeroContent: HeroContentData = {
  desktop_video_url: '',
  mobile_video_url: '',
  desktop_image_url: '',
  mobile_image_url: '',
  desktop_content_type: 'video',
  mobile_content_type: 'video',
  content_type: 'video',
  headline: '',
  supporting_text: '',
  cta_label: '',
  cta_action_type: 'booking_modal',
  cta_target_slug: '',
  cta_target_url: '',
  headline_font_family: 'display-serif',
  supporting_text_font_family: 'body-sans',
  cta_font_family: 'body-sans',
  headline_color: 'white',
  supporting_text_color: 'soft-white',
  cta_text_color: 'white',
  cta_background_color: 'gold',
  publication_status: 'published',
  go_live_at: '',
  published_at: null,
  overlay_alignment: 'left',
  overlay_width: 'regular',
  overlay_scale: 100,
  desktop_overlay_x: 28,
  desktop_overlay_y: 68,
  mobile_overlay_x: 50,
  mobile_overlay_y: 72,
  overlay_grouped: true,
  desktop_group_width: 460,
  mobile_group_width: 300,
  headline_scale: 100,
  supporting_text_scale: 100,
  cta_scale: 100,
  desktop_headline_x: 28,
  desktop_headline_y: 60,
  desktop_headline_width: 460,
  desktop_supporting_text_x: 28,
  desktop_supporting_text_y: 70,
  desktop_supporting_text_width: 460,
  desktop_cta_x: 28,
  desktop_cta_y: 81,
  desktop_cta_width: 320,
  mobile_headline_x: 50,
  mobile_headline_y: 62,
  mobile_headline_width: 280,
  mobile_supporting_text_x: 50,
  mobile_supporting_text_y: 72,
  mobile_supporting_text_width: 280,
  mobile_cta_x: 50,
  mobile_cta_y: 83,
  mobile_cta_width: 260,
  is_active: true
}

const debugLog = (...args: unknown[]) => {
  if (process.env.NEXT_PUBLIC_DEBUG_HERO_CONTENT === 'true') {
    console.info(...args)
  }
}

const normalizeHeroContent = (content?: Partial<HeroContentData> | null): HeroContentData => {
  const compactContent = Object.entries(content || {}).reduce<Partial<HeroContentData>>((accumulator, [key, value]) => {
    if (value !== null && value !== undefined) {
      accumulator[key as keyof HeroContentData] = value as never
    }

    return accumulator
  }, {})

  const inferDeviceContentType = (device: PreviewDevice): HeroContentType => {
    const explicitType = device === 'desktop' ? compactContent.desktop_content_type : compactContent.mobile_content_type
    const imageUrl = device === 'desktop' ? compactContent.desktop_image_url : compactContent.mobile_image_url
    const videoUrl = device === 'desktop' ? compactContent.desktop_video_url : compactContent.mobile_video_url

    if (imageUrl && !videoUrl) {
      return 'image'
    }

    if (videoUrl && !imageUrl) {
      return 'video'
    }

    return (explicitType || compactContent.content_type || defaultHeroContent.content_type) as HeroContentType
  }

  const desktopContentType = inferDeviceContentType('desktop')
  const mobileContentType = inferDeviceContentType('mobile')
  const fallbackContentType = (compactContent.content_type || desktopContentType || defaultHeroContent.content_type) as HeroContentType

  return {
    ...defaultHeroContent,
    ...compactContent,
    desktop_content_type: desktopContentType,
    mobile_content_type: mobileContentType,
    content_type: fallbackContentType,
    go_live_at: compactContent.go_live_at ? formatDateTimeLocal(compactContent.go_live_at) : ''
  }
}

function formatDateTimeLocal(value?: string | Date | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) {
    return ''
  }

  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const statusChipColor = (status?: HeroPublicationStatus) => {
  if (status === 'scheduled') {
    return { backgroundColor: '#e3f2fd', color: '#1565c0' }
  }

  if (status === 'draft') {
    return { backgroundColor: '#fff3e0', color: '#ef6c00' }
  }

  return { backgroundColor: '#e8f5e8', color: '#2e7d32' }
}

const getContentTypeForDevice = (content: Partial<HeroContentData>, device: PreviewDevice): HeroContentType => {
  const explicitType = device === 'desktop' ? content.desktop_content_type : content.mobile_content_type

  if (explicitType) {
    return explicitType
  }

  return content.content_type || 'video'
}

const getMediaUrl = (content: Partial<HeroContentData>, device: PreviewDevice) => {
  if (getContentTypeForDevice(content, device) === 'image') {
    return device === 'desktop'
      ? content.desktop_image_url || ''
      : content.mobile_image_url || (getContentTypeForDevice(content, 'desktop') === 'image' ? content.desktop_image_url || '' : '')
  }

  return device === 'desktop'
    ? content.desktop_video_url || ''
    : content.mobile_video_url || (getContentTypeForDevice(content, 'desktop') === 'video' ? content.desktop_video_url || '' : '')
}

const OVERLAY_POSITION_FIELDS: Record<PreviewDevice, Record<OverlayLayer, { x: keyof HeroContentData; y: keyof HeroContentData }>> = {
  desktop: {
    group: { x: 'desktop_overlay_x', y: 'desktop_overlay_y' },
    headline: { x: 'desktop_headline_x', y: 'desktop_headline_y' },
    supporting_text: { x: 'desktop_supporting_text_x', y: 'desktop_supporting_text_y' },
    cta: { x: 'desktop_cta_x', y: 'desktop_cta_y' }
  },
  mobile: {
    group: { x: 'mobile_overlay_x', y: 'mobile_overlay_y' },
    headline: { x: 'mobile_headline_x', y: 'mobile_headline_y' },
    supporting_text: { x: 'mobile_supporting_text_x', y: 'mobile_supporting_text_y' },
    cta: { x: 'mobile_cta_x', y: 'mobile_cta_y' }
  }
}

const OVERLAY_WIDTH_FIELDS: Record<PreviewDevice, Record<OverlayLayer, keyof HeroContentData>> = {
  desktop: {
    group: 'desktop_group_width',
    headline: 'desktop_headline_width',
    supporting_text: 'desktop_supporting_text_width',
    cta: 'desktop_cta_width'
  },
  mobile: {
    group: 'mobile_group_width',
    headline: 'mobile_headline_width',
    supporting_text: 'mobile_supporting_text_width',
    cta: 'mobile_cta_width'
  }
}

const OVERLAY_SCALE_FIELDS: Record<OverlayLayer, keyof HeroContentData> = {
  group: 'overlay_scale',
  headline: 'headline_scale',
  supporting_text: 'supporting_text_scale',
  cta: 'cta_scale'
}

const STOREFRONT_HEADING_FONT = `'Canela Text Trial', 'Playfair Display', 'Canela Text Trial Fallback', Georgia, 'Times New Roman', serif`
const STOREFRONT_BODY_FONT = `'Karla', 'Public Sans', sans-serif`
const HERO_FONT_LABELS: Record<HeroFontFamilyToken, string> = {
  'display-serif': 'Display serif',
  'body-sans': 'Body sans'
}
const HERO_FONT_STACKS: Record<HeroFontFamilyToken, string> = {
  'display-serif': STOREFRONT_HEADING_FONT,
  'body-sans': STOREFRONT_BODY_FONT
}
const HERO_TEXT_COLORS: Record<HeroTextColorToken, string> = {
  white: '#ffffff',
  'soft-white': 'rgba(255,255,255,0.88)',
  gold: '#c6a55a'
}
const HERO_CTA_TEXT_COLORS: Record<HeroCtaTextColorToken, string> = {
  white: '#ffffff',
  charcoal: '#111827',
  gold: '#c6a55a'
}
const HERO_CTA_BACKGROUND_COLORS: Record<HeroCtaBackgroundColorToken, string> = {
  gold: '#c6a55a',
  charcoal: '#111827',
  white: '#ffffff'
}

interface HeroGalleryPagination {
  current_page: number
  per_page_rows: number
  total_items: number
  total_pages: number
}

const getLayerCoordinates = (content: HeroContentData, device: PreviewDevice, layer: OverlayLayer) => {
  const fields = OVERLAY_POSITION_FIELDS[device][layer]

  return {
    x: Number(content[fields.x] ?? defaultHeroContent[fields.x]),
    y: Number(content[fields.y] ?? defaultHeroContent[fields.y])
  }
}

const getLayerWidth = (content: HeroContentData, device: PreviewDevice, layer: OverlayLayer) =>
  Number(content[OVERLAY_WIDTH_FIELDS[device][layer]] ?? defaultHeroContent[OVERLAY_WIDTH_FIELDS[device][layer]])

const getLayerScale = (content: HeroContentData, layer: OverlayLayer) =>
  Number(content[OVERLAY_SCALE_FIELDS[layer]] ?? defaultHeroContent[OVERLAY_SCALE_FIELDS[layer]])

const inferMediaTypeForDevice = (content: HeroContentData, device: PreviewDevice): HeroContentType | null => {
  const videoUrl = device === 'desktop'
    ? content.desktop_video_url
    : content.mobile_video_url || content.desktop_video_url
  const imageUrl = device === 'desktop'
    ? content.desktop_image_url
    : content.mobile_image_url || content.desktop_image_url

  if (videoUrl && !imageUrl) {
    return 'video'
  }

  if (imageUrl && !videoUrl) {
    return 'image'
  }

  if (videoUrl && imageUrl) {
    return getContentTypeForDevice(content, device)
  }

  return null
}

const HeroContentManagement = () => {
  const router = useRouter()
  const [liveHeroContent, setLiveHeroContent] = useState<HeroContentData>(defaultHeroContent)
  const [heroAdminConfig, setHeroAdminConfig] = useState<HeroAdminConfigResponse | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [selectedFiles, setSelectedFiles] = useState<{ desktop?: UploadedFile; mobile?: UploadedFile }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [pendingData, setPendingData] = useState<HeroContentData | null>(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saveIntent, setSaveIntent] = useState<HeroSaveMode>('publish')
  const [activeSaveIntent, setActiveSaveIntent] = useState<HeroSaveMode | null>(null)
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false)
  const [workspaceMode, setWorkspaceMode] = useState<PreviewWorkspaceMode>('view')
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop')
  const [selectedLayer, setSelectedLayer] = useState<OverlayLayer | null>('group')
  const [interactionState, setInteractionState] = useState<InteractionState | null>(null)
  const [showGuides, setShowGuides] = useState(false)
  const [mediaPanelMode, setMediaPanelMode] = useState<MediaPanelMode>('gallery')
  const [galleryDensity, setGalleryDensity] = useState<GalleryDensity>('comfortable')
  const [galleryPagination, setGalleryPagination] = useState<HeroGalleryPagination>({
    current_page: 1,
    per_page_rows: 12,
    total_items: 0,
    total_pages: 1
  })

  const previewSurfaceRef = useRef<HTMLDivElement | null>(null)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty }
  } = useForm<HeroContentData>({
    defaultValues: defaultHeroContent
  })

  const watchedValues = watch()
  const workingContent = normalizeHeroContent(watchedValues)
  const activePreviewContent = workspaceMode === 'view' ? liveHeroContent : workingContent
  const isSavingHero = isLoading || isUploading || activeSaveIntent !== null

  useEffect(() => {
    void loadHeroContent()
  }, [])

  useEffect(() => {
    void loadUploadedFiles(galleryPagination.current_page, galleryPagination.per_page_rows)
  }, [galleryPagination.current_page, galleryPagination.per_page_rows])

  useEffect(() => {
    if (!interactionState) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      const surface = previewSurfaceRef.current
      if (!surface) {
        return
      }

      const rect = surface.getBoundingClientRect()
      if (!rect.width || !rect.height) {
        return
      }

      if (interactionState.mode === 'move') {
        const dx = event.clientX - interactionState.startX
        const dy = event.clientY - interactionState.startY
        const dragDistance = Math.sqrt(dx * dx + dy * dy)

        if (!interactionState.hasMoved && dragDistance < DRAG_ACTIVATION_THRESHOLD) {
          return
        }

        if (!interactionState.hasMoved) {
          setInteractionState(prev => (prev ? { ...prev, hasMoved: true } : prev))
        }

        const rawX = ((event.clientX - rect.left) / rect.width) * 100
        const rawY = ((event.clientY - rect.top) / rect.height) * 100
        const snappedX = Math.max(5, Math.min(95, Math.round(rawX / 5) * 5))
        const snappedY = Math.max(10, Math.min(90, Math.round(rawY / 5) * 5))

        const fields = OVERLAY_POSITION_FIELDS[interactionState.device][interactionState.layer]
        setValue(fields.x, snappedX, { shouldDirty: true })
        setValue(fields.y, snappedY, { shouldDirty: true })

        return
      }

      const dx = event.clientX - interactionState.startX
      const dy = event.clientY - interactionState.startY
      const widthField = OVERLAY_WIDTH_FIELDS[interactionState.device][interactionState.layer]
      const scaleField = OVERLAY_SCALE_FIELDS[interactionState.layer]
      const horizontalDirection = interactionState.handle?.includes('w') ? -1 : 1
      const nextWidth = Math.max(
        MIN_LAYER_WIDTH[interactionState.device],
        Math.min(MAX_LAYER_WIDTH[interactionState.device], Math.round(interactionState.startWidth + dx * horizontalDirection))
      )
      setValue(widthField, nextWidth, { shouldDirty: true })

      if (interactionState.handle && ['ne', 'nw', 'se', 'sw'].includes(interactionState.handle)) {
        const scaleDelta = Math.round(-dy / 4)
        const nextScale = Math.max(70, Math.min(160, interactionState.startScale + scaleDelta))
        setValue(scaleField, nextScale, { shouldDirty: true })
      }
    }

    const handleMouseUp = () => setInteractionState(null)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [interactionState, setValue])

  useEffect(() => {
    if (workingContent.overlay_grouped) {
      if (selectedLayer && selectedLayer !== 'group') {
        setSelectedLayer(null)
      }

      return
    }

    if (selectedLayer === 'group') {
      setSelectedLayer(null)
    }
  }, [workingContent.overlay_grouped, selectedLayer])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return
      }

      event.preventDefault()
      event.returnValue = ''
    }

    const handleRouteChangeStart = () => {
      if (!isDirty) {
        return
      }

      const confirmed = window.confirm('You have unsaved hero changes. Leave without saving?')
      if (!confirmed) {
        router.events.emit('routeChangeError')
        throw new Error('Route change aborted by unsaved changes guard.')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    router.events.on('routeChangeStart', handleRouteChangeStart)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.events.off('routeChangeStart', handleRouteChangeStart)
    }
  }, [isDirty, router.events])

  async function loadHeroContent() {
    try {
      setIsLoading(true)
      const response = await fetch(`${HERO_API_BASE_URL}/hero-content/admin-config`, {
        headers: {
          Authorization: getHeroAdminAccessToken()
        }
      })

      if (response.status === 404) {
        const fallbackResponse = await fetch(`${HERO_API_BASE_URL}/hero-content/config`)

        if (!fallbackResponse.ok) {
          throw new Error('Failed to load hero content settings')
        }

        const fallbackResult = await fallbackResponse.json()
        const fallbackContent = normalizeHeroContent(fallbackResult.data as HeroContentData)

        setHeroAdminConfig({
          active_content: fallbackContent,
          editable_content: fallbackContent,
          draft_content: null,
          scheduled_content: null
        })
        setLiveHeroContent(fallbackContent)
        reset(fallbackContent)
        setSaveIntent('publish')

        return
      }

      if (!response.ok) {
        throw new Error('Failed to load hero admin config')
      }

      const result = await response.json()
      const data = result.data as HeroAdminConfigResponse
      const liveContent = normalizeHeroContent(data?.active_content)
      const editableContent = normalizeHeroContent(data?.editable_content)

      setHeroAdminConfig({
        active_content: liveContent,
        editable_content: editableContent,
        draft_content: data?.draft_content ? normalizeHeroContent(data.draft_content) : null,
        scheduled_content: data?.scheduled_content ? normalizeHeroContent(data.scheduled_content) : null
      })
      setLiveHeroContent(liveContent)
      reset(editableContent)
      setSaveIntent(
        editableContent.publication_status === 'draft'
          ? 'draft'
          : editableContent.publication_status === 'scheduled'
            ? 'schedule'
            : 'publish'
      )
    } catch (error) {
      toast.error('Failed to load hero content settings')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadUploadedFiles(currentPage = 1, perPageRows = galleryPagination.per_page_rows) {
    try {
      const response = await fetch(
        `${HERO_API_BASE_URL}/hero-content/files?current_page=${currentPage}&per_page_rows=${perPageRows}`,
        {
        headers: {
          Authorization: getHeroAdminAccessToken()
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load hero files')
      }

      const result = await response.json()
      const payload = result.data || {}
      const resultFiles = Array.isArray(payload) ? payload : payload.result || []
      const pagination = Array.isArray(payload)
        ? {
            current_page: 1,
            per_page_rows: resultFiles.length || perPageRows,
            total_items: resultFiles.length,
            total_pages: 1
          }
        : payload.pagination
      const cdnFiles = ((resultFiles as UploadedFile[]) || []).map(file => ({
        ...file,
        preview: file.url,
        isUploaded: true,
        source: 'cdn' as const
      }))

      setUploadedFiles(prev => {
        const localFiles = prev.filter(file => file.source === 'local')

        return [...localFiles, ...cdnFiles]
      })
      if (pagination) {
        setGalleryPagination(prev => ({
          ...prev,
          current_page: pagination.current_page || currentPage,
          per_page_rows: pagination.per_page_rows || perPageRows,
          total_items: pagination.total_items || cdnFiles.length,
          total_pages: pagination.total_pages || 1
        }))
      }
    } catch (error) {
      toast.error('Failed to load hero CDN gallery')
    }
  }

  function buildPreviewData(data: Partial<HeroContentData>): PreviewData {
    return {
      desktop_url: getMediaUrl(data, 'desktop'),
      mobile_url: getMediaUrl(data, 'mobile'),
      desktop_content_type: getContentTypeForDevice(data, 'desktop'),
      mobile_content_type: getContentTypeForDevice(data, 'mobile'),
      content_type: (data.content_type || 'video') as HeroContentType,
      headline: data.headline || '',
      supporting_text: data.supporting_text || '',
      cta_label: data.cta_label || '',
      headline_font_family: (data.headline_font_family || 'display-serif') as HeroFontFamilyToken,
      supporting_text_font_family: (data.supporting_text_font_family || 'body-sans') as HeroFontFamilyToken,
      cta_font_family: (data.cta_font_family || 'body-sans') as HeroFontFamilyToken,
      headline_color: (data.headline_color || 'white') as HeroTextColorToken,
      supporting_text_color: (data.supporting_text_color || 'soft-white') as HeroTextColorToken,
      cta_text_color: (data.cta_text_color || 'white') as HeroCtaTextColorToken,
      cta_background_color: (data.cta_background_color || 'gold') as HeroCtaBackgroundColorToken,
      overlay_alignment: (data.overlay_alignment || 'left') as OverlayAlignment,
      overlay_width: (data.overlay_width || 'regular') as OverlayWidth,
      overlay_scale: data.overlay_scale || 100,
      desktop_overlay_x: data.desktop_overlay_x || 28,
      desktop_overlay_y: data.desktop_overlay_y || 68,
      mobile_overlay_x: data.mobile_overlay_x || 50,
      mobile_overlay_y: data.mobile_overlay_y || 72,
      overlay_grouped: data.overlay_grouped ?? true,
      desktop_group_width: data.desktop_group_width || 460,
      mobile_group_width: data.mobile_group_width || 300,
      headline_scale: data.headline_scale || 100,
      supporting_text_scale: data.supporting_text_scale || 100,
      cta_scale: data.cta_scale || 100,
      desktop_headline_x: data.desktop_headline_x || 28,
      desktop_headline_y: data.desktop_headline_y || 60,
      desktop_headline_width: data.desktop_headline_width || 460,
      desktop_supporting_text_x: data.desktop_supporting_text_x || 28,
      desktop_supporting_text_y: data.desktop_supporting_text_y || 70,
      desktop_supporting_text_width: data.desktop_supporting_text_width || 460,
      desktop_cta_x: data.desktop_cta_x || 28,
      desktop_cta_y: data.desktop_cta_y || 81,
      desktop_cta_width: data.desktop_cta_width || 320,
      mobile_headline_x: data.mobile_headline_x || 50,
      mobile_headline_y: data.mobile_headline_y || 62,
      mobile_headline_width: data.mobile_headline_width || 280,
      mobile_supporting_text_x: data.mobile_supporting_text_x || 50,
      mobile_supporting_text_y: data.mobile_supporting_text_y || 72,
      mobile_supporting_text_width: data.mobile_supporting_text_width || 280,
      mobile_cta_x: data.mobile_cta_x || 50,
      mobile_cta_y: data.mobile_cta_y || 83,
      mobile_cta_width: data.mobile_cta_width || 260
    }
  }

  async function uploadFileToS3(file: File, fileId: string): Promise<UploadedFile> {
    const formData = new FormData()
    formData.append('heroFile', file)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
        }
      })

      xhr.addEventListener('load', () => {
        let result: { code?: number | string; data?: any; message?: string } | null = null

        try {
          result = JSON.parse(xhr.responseText)
        } catch {
          result = null
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          if (result?.code === 200 && result.data) {
            resolve({
              id: result.data.id,
              name: result.data.name,
              url: result.data.url,
              preview: result.data.url,
              type: result.data.type,
              size: result.data.size,
              uploadedAt: result.data.uploadedAt,
              isUploaded: true,
              source: 'cdn'
            })

            return
          }
        }

        reject(new Error(result?.message || 'Failed to upload hero asset'))
      })

      xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
      xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')))

      xhr.timeout = 5 * 60 * 1000
      xhr.open('POST', `${HERO_API_BASE_URL}/hero-content/upload`)

      const token = getHeroAdminAccessToken()
      if (token) {
        xhr.setRequestHeader('Authorization', `${token}`)
      }

      xhr.send(formData)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.webm', '.mov'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    maxSize: 50 * 1024 * 1024,
    onDrop: files => {
      const localFiles: UploadedFile[] = files.map((file, index) => {
        const objectUrl = URL.createObjectURL(file)

        return {
          id: `local-${Date.now()}-${index}-${file.name}`,
          name: file.name,
          url: objectUrl,
          preview: objectUrl,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          size: file.size,
          uploadedAt: new Date(),
          file,
          isUploaded: false,
          source: 'local'
        }
      })

      setUploadedFiles(prev => [...localFiles, ...prev])
      const firstFile = localFiles[0]
      if (firstFile) {
        handleFileSelect(firstFile, previewDevice)
      }
      setMediaPanelMode('gallery')
      toast.success(`Added ${files.length} file(s) for preview`)
    },
    onDropRejected: rejectedFiles => {
      rejectedFiles.forEach(rejection => {
        toast.error(`File ${rejection.file.name} was rejected: ${rejection.errors[0]?.message}`)
      })
    }
  })

  const handleFileSelect = (file: UploadedFile, device: PreviewDevice) => {
    setSelectedFiles(prev => ({ ...prev, [device]: file }))

    if (file.type === 'video') {
      setValue(device === 'desktop' ? 'desktop_video_url' : 'mobile_video_url', file.url, { shouldDirty: true })
      setValue(device === 'desktop' ? 'desktop_content_type' : 'mobile_content_type', 'video', { shouldDirty: true })
      if (device === 'desktop') {
        setValue('content_type', 'video', { shouldDirty: true })
      }
    } else {
      setValue(device === 'desktop' ? 'desktop_image_url' : 'mobile_image_url', file.url, { shouldDirty: true })
      setValue(device === 'desktop' ? 'desktop_content_type' : 'mobile_content_type', 'image', { shouldDirty: true })
      if (device === 'desktop') {
        setValue('content_type', 'image', { shouldDirty: true })
      }
    }
  }

  const handleURLAdded = (url: string, type: HeroContentType, device: PreviewDevice) => {
    if (type === 'video') {
      setValue(device === 'desktop' ? 'desktop_video_url' : 'mobile_video_url', url, { shouldDirty: true })
      setValue(device === 'desktop' ? 'desktop_content_type' : 'mobile_content_type', 'video', { shouldDirty: true })
      if (device === 'desktop') {
        setValue('content_type', 'video', { shouldDirty: true })
      }
    } else {
      setValue(device === 'desktop' ? 'desktop_image_url' : 'mobile_image_url', url, { shouldDirty: true })
      setValue(device === 'desktop' ? 'desktop_content_type' : 'mobile_content_type', 'image', { shouldDirty: true })
      if (device === 'desktop') {
        setValue('content_type', 'image', { shouldDirty: true })
      }
    }
  }

  const handleURLPreview = (urls: { desktop: string; mobile: string; type: HeroContentType }) => {
    setPreviewData({
      ...buildPreviewData(workingContent),
      desktop_url: urls.desktop,
      mobile_url: urls.mobile,
      desktop_content_type: urls.type,
      mobile_content_type: urls.type,
      content_type: urls.type
    })
    setPreviewOpen(true)
  }

  const prepareSave = (data: HeroContentData, intent: HeroSaveMode) => {
    if (intent === 'schedule' && !data.go_live_at) {
      setSaveError('Choose a go-live date before scheduling this hero')
      toast.error('Choose a go-live date before scheduling this hero')

      return
    }

    if (intent === 'publish') {
      setSaveError('')
      setSaveIntent(intent)
      setPendingData(data)
      setPublishConfirmOpen(true)

      return
    }

    setSaveError('')
    setSaveIntent(intent)
    setPendingData(data)
    void handleConfirmSave(data, intent)
  }

  const submitForIntent = (intent: HeroSaveMode) =>
    handleSubmit(data => {
      debugLog('Hero content form submitted', intent, data)
      prepareSave(data, intent)
    })()

  const handleConfirmSave = async (submittedData?: HeroContentData, submittedIntent?: HeroSaveMode) => {
    const dataToSave = submittedData || pendingData
    const intentToSave = submittedIntent || saveIntent

    if (!dataToSave) {
      return
    }

    setIsLoading(true)
    setIsUploading(true)
    setActiveSaveIntent(intentToSave)
    setPublishConfirmOpen(false)
    setSaveError('')

    try {
      const payload: HeroContentData & { save_mode: HeroSaveMode } = {
        ...sanitizeHeroPayloadForSave(dataToSave),
        save_mode: intentToSave
      }

      const filesToUpload: Array<{ file: File; field: keyof HeroContentData; localId: string | number }> = []
      const urlFields: Array<keyof HeroContentData> = [
        'desktop_video_url',
        'mobile_video_url',
        'desktop_image_url',
        'mobile_image_url'
      ]

      urlFields.forEach(field => {
        const value = payload[field]
        if (typeof value === 'string' && value.startsWith('blob:')) {
          const device = field.startsWith('desktop_') ? 'desktop' : 'mobile'
          const selectedFile = selectedFiles[device]
          const match =
            uploadedFiles.find(file => (file.preview || file.url) === value && file.file) ||
            (selectedFile && (selectedFile.preview === value || selectedFile.url === value) && selectedFile.file
              ? selectedFile
              : null)
          if (match?.file) {
            filesToUpload.push({ file: match.file, field, localId: match.id })

            return
          }

          throw new Error('This hero media is only available as a local browser preview. Re-add the file before saving.')
        }
      })

      if (filesToUpload.length > 0) {
        for (let index = 0; index < filesToUpload.length; index += 1) {
          const { file, field, localId } = filesToUpload[index]
          const localAsset =
            uploadedFiles.find(existing => existing.id === localId) ||
            (selectedFiles.desktop?.id === localId
              ? selectedFiles.desktop
              : selectedFiles.mobile?.id === localId
                ? selectedFiles.mobile
                : null)
          const localUrl = localAsset?.preview || localAsset?.url || ''
          setUploadStatus(`Uploading ${file.name} (${index + 1}/${filesToUpload.length})...`)
          const uploadedAsset = await uploadFileToS3(file, `${localId}`)
          ;((payload as unknown) as Record<string, unknown>)[field] = uploadedAsset.url

          setUploadedFiles(prev => prev.map(existing => (existing.id === localId ? uploadedAsset : existing)))
          setSelectedFiles(prev => {
            const nextSelectedFiles = { ...prev }

            ;(['desktop', 'mobile'] as PreviewDevice[]).forEach(device => {
              const selectedFile = nextSelectedFiles[device]
              if (selectedFile?.id === localId || (localUrl && (selectedFile?.preview === localUrl || selectedFile?.url === localUrl))) {
                nextSelectedFiles[device] = uploadedAsset
              }
            })

            return nextSelectedFiles
          })
          setValue(field, uploadedAsset.url, { shouldDirty: false })

          if (localUrl.startsWith('blob:')) {
            URL.revokeObjectURL(localUrl)
          }
        }
      }

      setUploadStatus(intentToSave === 'draft' ? 'Saving draft...' : intentToSave === 'schedule' ? 'Scheduling hero...' : 'Publishing hero...')

      const response = await fetch(`${HERO_API_BASE_URL}/hero-content/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getHeroAdminAccessToken()
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(getReadableApiError(errorText))
      }

      const result = await response.json()
      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to save hero configuration')
      }

      toast.success(
        intentToSave === 'draft'
          ? 'Hero draft saved'
          : intentToSave === 'schedule'
            ? 'Hero content scheduled'
            : 'Hero published'
      )

      setPreviewOpen(false)
      setPendingData(null)
      setWorkspaceMode('view')
      await Promise.all([
        loadHeroContent(),
        loadUploadedFiles(galleryPagination.current_page, galleryPagination.per_page_rows)
      ])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save hero configuration'
      setSaveError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
      setIsUploading(false)
      setActiveSaveIntent(null)
      setUploadStatus('')
    }
  }

  const handleReset = () => {
    if (heroAdminConfig?.editable_content) {
      reset(heroAdminConfig.editable_content)
    } else {
      reset(defaultHeroContent)
    }
    setSelectedFiles({})
    setSelectedLayer(workingContent.overlay_grouped ? 'group' : null)
  }

  const handleDeleteFile = async (file: UploadedFile) => {
    if (file.source === 'local') {
      setUploadedFiles(prev => prev.filter(existing => existing.id !== file.id))
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }

      return
    }

    try {
      const response = await fetch(`${HERO_API_BASE_URL}/hero-content/file`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getHeroAdminAccessToken()
        },
        body: JSON.stringify({ fileId: file.id })
      })

      if (!response.ok) {
        throw new Error('Failed to delete hero asset')
      }

      setUploadedFiles(prev => prev.filter(existing => existing.id !== file.id))
      toast.success('Hero asset removed from gallery')
    } catch (error) {
      toast.error('Failed to delete hero asset')
    }
  }

  const beginOverlayDrag = (event: ReactMouseEvent, device: PreviewDevice, layer: OverlayLayer) => {
    if (workspaceMode !== 'edit') {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedLayer(layer)
    setInteractionState({
      device,
      layer,
      mode: 'move',
      hasMoved: false,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: getLayerWidth(workingContent, device, layer),
      startScale: getLayerScale(workingContent, layer)
    })
  }

  const beginOverlayResize = (event: ReactMouseEvent, device: PreviewDevice, layer: OverlayLayer, handle: ResizeHandle) => {
    if (workspaceMode !== 'edit') {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedLayer(layer)
    setInteractionState({
      device,
      layer,
      mode: 'resize',
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: getLayerWidth(workingContent, device, layer),
      startScale: getLayerScale(workingContent, layer)
    })
  }

  const renderHeroSurface = (content: HeroContentData, device: PreviewDevice, editable: boolean) => {
    const mediaUrl = getMediaUrl(content, device)
    const contentType = getContentTypeForDevice(content, device)
    const isMobile = device === 'mobile'
    const groupedScale = getLayerScale(content, 'group') / 100
    const groupCoordinates = getLayerCoordinates(content, device, 'group')
    const textAlign =
      content.overlay_alignment === 'center' ? 'center' : content.overlay_alignment === 'right' ? 'right' : 'left'
    const alignItems =
      content.overlay_alignment === 'center' ? 'center' : content.overlay_alignment === 'right' ? 'flex-end' : 'flex-start'
    const centerLineColor = '#5ab3ff'
    const activeGuideLayer =
      editable &&
      interactionState?.mode === 'move' &&
      interactionState.device === device &&
      interactionState.hasMoved
        ? interactionState.layer
        : null
    const activeGuidePosition = activeGuideLayer ? getLayerCoordinates(content, device, activeGuideLayer) : null
    const showCenterX = Boolean(activeGuidePosition && activeGuidePosition.x >= 47.5 && activeGuidePosition.x <= 52.5)
    const showCenterY = Boolean(activeGuidePosition && activeGuidePosition.y >= 47.5 && activeGuidePosition.y <= 52.5)
    const navbarHeight = PREVIEW_NAVBAR_HEIGHT[device]
    const isLayerSelected = (layer: OverlayLayer) => selectedLayer === layer
    const selectLayer = (event: ReactMouseEvent, layer: OverlayLayer) => {
      event.stopPropagation()
      setSelectedLayer(layer)
    }

    const layerBoxSx = (layer: OverlayLayer, x: number, y: number) => ({
      position: 'absolute' as const,
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      width: `${getLayerWidth(content, device, layer)}px`,
      maxWidth: `calc(100% - 24px)`,
      textAlign,
      cursor: editable ? 'grab' : 'default',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      outline: editable && isLayerSelected(layer) ? '1px dashed rgba(255,255,255,0.55)' : 'none',
      borderRadius: 1.5,
      px: editable ? 1.5 : 0,
      py: editable ? 1 : 0,
      transition: interactionState ? 'none' : 'left 120ms ease, top 120ms ease',
      zIndex: layer === 'cta' ? 3 : 2
    })

    const renderResizeHandles = (layer: OverlayLayer) => {
      if (!editable || !isLayerSelected(layer)) {
        return null
      }

      const handleBase = {
        position: 'absolute' as const,
        width: 12,
        height: 12,
        borderRadius: '999px',
        backgroundColor: '#fff',
        border: '2px solid #5ab3ff',
        zIndex: 4
      }

      return (
        <>
          <Box onMouseDown={event => beginOverlayResize(event, device, layer, 'w')} sx={{ ...handleBase, left: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }} />
          <Box onMouseDown={event => beginOverlayResize(event, device, layer, 'e')} sx={{ ...handleBase, right: -6, top: '50%', transform: 'translateY(-50%)', cursor: 'ew-resize' }} />
          <Box onMouseDown={event => beginOverlayResize(event, device, layer, 'nw')} sx={{ ...handleBase, left: -6, top: -6, cursor: 'nwse-resize' }} />
          <Box onMouseDown={event => beginOverlayResize(event, device, layer, 'ne')} sx={{ ...handleBase, right: -6, top: -6, cursor: 'nesw-resize' }} />
          <Box onMouseDown={event => beginOverlayResize(event, device, layer, 'sw')} sx={{ ...handleBase, left: -6, bottom: -6, cursor: 'nesw-resize' }} />
          <Box onMouseDown={event => beginOverlayResize(event, device, layer, 'se')} sx={{ ...handleBase, right: -6, bottom: -6, cursor: 'nwse-resize' }} />
        </>
      )
    }

    const headlineNode = content.headline ? (
      <Typography
        sx={{
          color: HERO_TEXT_COLORS[content.headline_color || 'white'],
          fontFamily: HERO_FONT_STACKS[content.headline_font_family || 'display-serif'],
          fontWeight: 600,
          fontSize: isMobile ? `${2.2 * (content.overlay_grouped ? groupedScale : getLayerScale(content, 'headline') / 100)}rem` : `${3.2 * (content.overlay_grouped ? groupedScale : getLayerScale(content, 'headline') / 100)}rem`,
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          maxWidth: '100%'
        }}
      >
        {content.headline}
      </Typography>
    ) : null

    const supportingNode = content.supporting_text ? (
      <Typography
        sx={{
          color: HERO_TEXT_COLORS[content.supporting_text_color || 'soft-white'],
          maxWidth: '100%',
          fontFamily: HERO_FONT_STACKS[content.supporting_text_font_family || 'body-sans'],
          fontSize: `${1 * (content.overlay_grouped ? groupedScale : getLayerScale(content, 'supporting_text') / 100)}rem`,
          lineHeight: 1.6
        }}
      >
        {content.supporting_text}
      </Typography>
    ) : null

    const ctaNode = content.cta_label ? (
      <Button
        variant='contained'
        sx={{
          minWidth: '100%',
          backgroundColor: HERO_CTA_BACKGROUND_COLORS[content.cta_background_color || 'gold'],
          color: HERO_CTA_TEXT_COLORS[content.cta_text_color || 'white'],
          fontFamily: HERO_FONT_STACKS[content.cta_font_family || 'body-sans'],
          fontSize: `${0.95 * (content.overlay_grouped ? groupedScale : getLayerScale(content, 'cta') / 100)}rem`,
          textTransform: 'none',
          '&:hover': { backgroundColor: HERO_CTA_BACKGROUND_COLORS[content.cta_background_color || 'gold'] }
        }}
      >
        {content.cta_label}
      </Button>
    ) : null

    const groupedOverlayContent = (
      <Box
        onMouseDown={event => beginOverlayDrag(event, device, 'group')}
        onClick={event => selectLayer(event, 'group')}
        sx={{
          ...layerBoxSx('group', groupCoordinates.x, groupCoordinates.y),
          display: 'flex',
          flexDirection: 'column',
          alignItems,
          pr: editable ? 2 : 0
        }}
      >
        {headlineNode}
        {supportingNode ? <Box sx={{ mt: 1.5 }}>{supportingNode}</Box> : null}
        {ctaNode ? <Box sx={{ mt: 2.5 }}>{ctaNode}</Box> : null}
        {renderResizeHandles('group')}
      </Box>
    )

    const detachedOverlayContent = (
      <>
        {headlineNode ? (
          <Box
            onMouseDown={event => beginOverlayDrag(event, device, 'headline')}
            onClick={event => selectLayer(event, 'headline')}
            sx={layerBoxSx('headline', getLayerCoordinates(content, device, 'headline').x, getLayerCoordinates(content, device, 'headline').y)}
          >
            {headlineNode}
            {renderResizeHandles('headline')}
          </Box>
        ) : null}
        {supportingNode ? (
          <Box
            onMouseDown={event => beginOverlayDrag(event, device, 'supporting_text')}
            onClick={event => selectLayer(event, 'supporting_text')}
            sx={layerBoxSx(
              'supporting_text',
              getLayerCoordinates(content, device, 'supporting_text').x,
              getLayerCoordinates(content, device, 'supporting_text').y
            )}
          >
            {supportingNode}
            {renderResizeHandles('supporting_text')}
          </Box>
        ) : null}
        {ctaNode ? (
          <Box
            onMouseDown={event => beginOverlayDrag(event, device, 'cta')}
            onClick={event => selectLayer(event, 'cta')}
            sx={layerBoxSx('cta', getLayerCoordinates(content, device, 'cta').x, getLayerCoordinates(content, device, 'cta').y)}
          >
            {ctaNode}
            {renderResizeHandles('cta')}
          </Box>
        ) : null}
      </>
    )

    const overlayCanvas = (
      <Box
        ref={previewSurfaceRef}
        onMouseDown={() => {
          if (editable) {
            setSelectedLayer(null)
          }
        }}
        sx={{
          position: 'absolute',
          top: `${navbarHeight}px`,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'hidden'
        }}
      >
        {showGuides && editable ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '5% 5%',
              pointerEvents: 'none'
            }}
          />
        ) : null}
        {showCenterX ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: '1px',
              transform: 'translateX(-50%)',
              backgroundColor: centerLineColor,
              boxShadow: `0 0 0 1px ${centerLineColor}33`,
              pointerEvents: 'none'
            }}
          />
        ) : null}
        {showCenterY ? (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: '1px',
              transform: 'translateY(-50%)',
              backgroundColor: centerLineColor,
              boxShadow: `0 0 0 1px ${centerLineColor}33`,
              pointerEvents: 'none'
            }}
          />
        ) : null}
        {content.overlay_grouped
          ? content.headline || content.supporting_text || content.cta_label
            ? groupedOverlayContent
            : null
          : detachedOverlayContent}
      </Box>
    )

    const innerSurface = (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: isMobile ? '100%' : 420,
          overflow: 'hidden',
          borderRadius: isMobile ? '32px' : 2,
          background:
            mediaUrl || content.headline || content.supporting_text || content.cta_label
              ? '#111'
              : 'linear-gradient(180deg, #16263d 0%, #111827 100%)'
        }}
      >
        {mediaUrl ? (
          contentType === 'video' ? (
            <video
              src={mediaUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              muted
              autoPlay
              loop
              playsInline
            />
          ) : (
            <img
              src={mediaUrl}
              alt={`${device} hero preview`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )
        ) : null}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.72) 100%)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${navbarHeight}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: isMobile ? 2.5 : 4,
            background: 'rgba(0,0,0,0.92)',
            borderBottom: '1px solid rgba(198,165,90,0.28)',
            zIndex: 3,
            pointerEvents: 'none'
          }}
        >
          <Icon icon='tabler:menu-2' color='#c6a55a' />
          <Box sx={{ textAlign: 'center', color: '#c6a55a', lineHeight: 1 }}>
            <Typography sx={{ fontFamily: STOREFRONT_HEADING_FONT, fontSize: isMobile ? '1.65rem' : '2.4rem', letterSpacing: '0.08em' }}>
              NUNGU
            </Typography>
            <Typography sx={{ fontFamily: STOREFRONT_BODY_FONT, fontSize: isMobile ? '0.7rem' : '0.85rem', letterSpacing: '0.18em' }}>
              DIAMONDS
            </Typography>
          </Box>
          <Icon icon='tabler:search' color='#c6a55a' />
        </Box>
        {!mediaUrl && !content.headline && !content.supporting_text && !content.cta_label ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography color='rgba(255,255,255,0.72)'>
              {workspaceMode === 'view' ? 'No live hero media is published yet.' : 'Select media to preview the hero.'}
            </Typography>
          </Box>
        ) : null}
        {overlayCanvas}
      </Box>
    )

    if (!isMobile) {
      return innerSurface
    }

    return (
      <Box
        sx={{
          width: 320,
          maxWidth: '100%',
          mx: 'auto',
          p: 1.25,
          borderRadius: '40px',
          bgcolor: '#0b1119',
          boxShadow: theme => theme.shadows[8],
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 90,
            height: 8,
            borderRadius: 999,
            bgcolor: 'rgba(255,255,255,0.18)',
            zIndex: 2
          }}
        />
        <Box sx={{ aspectRatio: '393 / 852' }}>{innerSurface}</Box>
      </Box>
    )
  }

  const draftOrScheduledNotice =
    heroAdminConfig?.scheduled_content
      ? `A scheduled hero is queued for ${new Date(heroAdminConfig.scheduled_content.go_live_at).toLocaleString()}.`
      : heroAdminConfig?.draft_content
        ? 'A hero draft is saved and ready for review.'
        : null

  const isEditMode = workspaceMode === 'edit'
  const desktopMediaType =
    selectedFiles.desktop?.type ||
    inferMediaTypeForDevice(workingContent, 'desktop') ||
    workingContent.desktop_content_type ||
    workingContent.content_type ||
    null
  const mobileMediaType =
    selectedFiles.mobile?.type ||
    inferMediaTypeForDevice(workingContent, 'mobile') ||
    workingContent.mobile_content_type ||
    workingContent.desktop_content_type ||
    workingContent.content_type ||
    null
  const visibleDetachedLayers: OverlayLayer[] = ['headline', 'supporting_text', 'cta']
  const selectedEditableLayer = workingContent.overlay_grouped
    ? selectedLayer === 'group'
      ? 'group'
      : null
    : selectedLayer && selectedLayer !== 'group'
      ? selectedLayer
      : null
  const currentSelectedScale = selectedEditableLayer ? getLayerScale(workingContent, selectedEditableLayer) : 100
  const currentSelectedWidth = selectedEditableLayer ? getLayerWidth(workingContent, previewDevice, selectedEditableLayer) : MIN_LAYER_WIDTH[previewDevice]
  const layerLabelMap: Record<OverlayLayer, string> = {
    group: 'Group',
    headline: 'Headline',
    supporting_text: 'Supporting text',
    cta: 'CTA button'
  }

  const ensureElementVisible = (layer: 'headline' | 'supporting_text' | 'cta') => {
    if (layer === 'headline' && !workingContent.headline) {
      setValue('headline', 'New headline', { shouldDirty: true })
    }

    if (layer === 'supporting_text' && !workingContent.supporting_text) {
      setValue('supporting_text', 'Add supporting copy here.', { shouldDirty: true })
    }

    if (layer === 'cta' && !workingContent.cta_label) {
      setValue('cta_label', 'Reserve Consultation', { shouldDirty: true })
    }

    if (workingContent.overlay_grouped) {
      setSelectedLayer('group')

      return
    }

    setSelectedLayer(layer)
  }

  const removeElement = (layer: 'headline' | 'supporting_text' | 'cta') => {
    if (layer === 'headline') {
      setValue('headline', '', { shouldDirty: true })
    }

    if (layer === 'supporting_text') {
      setValue('supporting_text', '', { shouldDirty: true })
    }

    if (layer === 'cta') {
      setValue('cta_label', '', { shouldDirty: true })
    }

    if (selectedLayer === layer) {
      setSelectedLayer(null)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Enhanced Hero Content Management' />
          <Divider />
          <CardContent>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Manage Homepage Hero Content
            </Typography>
            <Typography sx={{ mb: 4, color: 'text.secondary' }}>
              Configure the homepage hero, preview the overlay copy and CTA, then save as a draft, schedule it, or publish it.
            </Typography>

            {draftOrScheduledNotice ? (
              <Alert severity='info' sx={{ mb: 3 }}>
                {draftOrScheduledNotice}
              </Alert>
            ) : null}

            {saveError ? (
              <Alert severity='error' sx={{ mb: 3 }}>
                {saveError}
              </Alert>
            ) : null}

            {isLoading ? (
              <Box sx={{ mb: 3 }}>
                <LinearProgress />
              </Box>
            ) : null}

            <Box sx={{ mb: 4, p: 3, borderRadius: 2, bgcolor: 'background.default', '& .MuiButton-root': { textTransform: 'none' } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Box>
                  <Typography variant='h6'>Hero Preview Workspace</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Edit mode is now canvas-first. Left rail manages elements and media, the center shows the real composition area, and the right rail holds properties and publishing actions.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={workspaceMode === 'view' ? 'Viewing Live' : 'Editing Draft'}
                    size='small'
                    sx={workspaceMode === 'view' ? statusChipColor('published') : statusChipColor('draft')}
                  />
                  <Chip
                    label={activePreviewContent.publication_status === 'published' ? 'Live' : activePreviewContent.publication_status}
                    size='small'
                    sx={statusChipColor(activePreviewContent.publication_status)}
                  />
                  {isDirty ? <Chip label='Unsaved changes' size='small' sx={statusChipColor('draft')} /> : null}
                </Box>
              </Box>

      <Tabs
        value={workspaceMode}
        onChange={(_, value) => setWorkspaceMode(value)}
        sx={{ mb: 1, '& .MuiTab-root': { textTransform: 'none' } }}
      >
        <Tab value='view' label='View Mode' />
        <Tab value='edit' label='Edit Mode' />
      </Tabs>

              <Box
                sx={{
                  minHeight: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                  mb: 2
                }}
              >
                <Tabs
                  value={previewDevice}
                  onChange={(_, value) => setPreviewDevice(value)}
                  sx={{ '& .MuiTab-root': { textTransform: 'none', minWidth: 0 } }}
                >
                  <Tab value='desktop' icon={<Icon icon='tabler:device-desktop' fontSize='1.1rem' />} aria-label='Desktop preview' />
                  <Tab value='mobile' icon={<Icon icon='tabler:device-mobile' fontSize='1.1rem' />} aria-label='Mobile preview' />
                </Tabs>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ minHeight: 40 }}>
                  {isEditMode ? (
                    <>
                      <FormControlLabel
                        control={<Switch checked={showGuides} onChange={event => setShowGuides(event.target.checked)} />}
                        label='Grid'
                      />
                      <Chip size='small' label='Center lines only appear while dragging the selected element' sx={{ backgroundColor: '#f7f2e8', color: '#7a6429' }} />
                    </>
                  ) : (
                    <Box sx={{ height: 40 }} />
                  )}
                </Stack>
              </Box>

              <Grid container spacing={3} alignItems='flex-start'>
                <Grid item xs={12} lg={3} sx={{ order: { xs: 3, lg: 1 } }}>
                  <Paper variant='outlined' sx={{ p: 2.5, borderRadius: 2, position: 'sticky', top: 24 }}>
                    {isEditMode ? (
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant='subtitle1' sx={{ mb: 0.5 }}>
                            Canvas
                          </Typography>
                          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                            Set the media type, grouping, alignment, and reusable gallery assets before placing elements on the canvas.
                          </Typography>
                          <Stack spacing={2}>
                            <Alert severity='info'>
                              Device media is now independent. Desktop is {desktopMediaType || 'not set'} and mobile is {mobileMediaType || 'not set'}.
                            </Alert>
                            <Controller
                              name='overlay_alignment'
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth size='small'>
                                  <InputLabel>Overlay Alignment</InputLabel>
                                  <Select {...field} label='Overlay Alignment'>
                                    <MenuItem value='left'>Left</MenuItem>
                                    <MenuItem value='center'>Center</MenuItem>
                                    <MenuItem value='right'>Right</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            />
                            <Controller
                              name='overlay_grouped'
                              control={control}
                              render={({ field }) => (
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={field.value}
                                      onChange={event => {
                                        field.onChange(event.target.checked)
                                        setSelectedLayer(event.target.checked ? 'group' : null)
                                      }}
                                    />
                                  }
                                  label='Move as a single group'
                                />
                              )}
                            />
                            <Controller
                              name='overlay_width'
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth size='small'>
                                  <InputLabel>Grouped Width Preset</InputLabel>
                                  <Select
                                    {...field}
                                    label='Grouped Width Preset'
                                    disabled={!workingContent.overlay_grouped}
                                    onChange={event => {
                                      field.onChange(event.target.value)
                                      const preset = event.target.value as OverlayWidth
                                      const desktopWidth = preset === 'compact' ? 320 : preset === 'wide' ? 620 : 460
                                      const mobileWidth = preset === 'compact' ? 220 : preset === 'wide' ? 340 : 300
                                      setValue('desktop_group_width', desktopWidth, { shouldDirty: true })
                                      setValue('mobile_group_width', mobileWidth, { shouldDirty: true })
                                    }}
                                  >
                                    <MenuItem value='compact'>Compact</MenuItem>
                                    <MenuItem value='regular'>Regular</MenuItem>
                                    <MenuItem value='wide'>Wide</MenuItem>
                                  </Select>
                                </FormControl>
                              )}
                            />
                          </Stack>
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant='subtitle1' sx={{ mb: 1 }}>
                            Elements
                          </Typography>
                          <Stack spacing={1.25}>
                            {visibleDetachedLayers.map(layer => {
                              const hasValue =
                                layer === 'headline'
                                  ? Boolean(workingContent.headline)
                                  : layer === 'supporting_text'
                                    ? Boolean(workingContent.supporting_text)
                                    : Boolean(workingContent.cta_label)

                              return (
                                <Paper
                                  key={layer}
                                  variant='outlined'
                                  sx={{
                                    p: 1.5,
                                    borderColor: selectedLayer === layer || (workingContent.overlay_grouped && selectedLayer === 'group') ? '#c6a55a' : 'divider'
                                  }}
                                >
                                  <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={1}>
                                    <Box>
                                      <Typography variant='subtitle2'>{layerLabelMap[layer]}</Typography>
                                      <Typography variant='caption' color='text.secondary'>
                                        {hasValue ? 'Visible on canvas' : 'Hidden until added'}
                                      </Typography>
                                    </Box>
                                    <Stack direction='row' spacing={1}>
                                      <Button size='small' variant='outlined' sx={{ textTransform: 'none' }} onClick={() => ensureElementVisible(layer as 'headline' | 'supporting_text' | 'cta')}>
                                        {hasValue ? 'Select' : 'Add'}
                                      </Button>
                                      {hasValue ? (
                                        <Button size='small' color='inherit' sx={{ textTransform: 'none' }} onClick={() => removeElement(layer as 'headline' | 'supporting_text' | 'cta')}>
                                          Hide
                                        </Button>
                                      ) : null}
                                    </Stack>
                                  </Stack>
                                </Paper>
                              )
                            })}
                          </Stack>
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant='subtitle1'>Media assignments</Typography>
                          <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
                            The gallery now lives below the canvas so you can browse more assets at once. Use these badges to confirm what each breakpoint will render.
                          </Typography>
                          <Stack spacing={1}>
                            <Chip
                              label={`Desktop: ${desktopMediaType || 'Not set'}`}
                              variant='outlined'
                              sx={{ justifyContent: 'flex-start' }}
                            />
                            <Chip
                              label={`Mobile: ${mobileMediaType || 'Not set'}`}
                              variant='outlined'
                              sx={{ justifyContent: 'flex-start' }}
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        <Typography variant='subtitle1'>Live hero summary</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          View mode keeps the same canvas size but removes editing controls so the composition stays stable.
                        </Typography>
                        <Chip label={`Desktop: ${getContentTypeForDevice(liveHeroContent, 'desktop')}`} variant='outlined' />
                        <Chip label={`Mobile: ${getContentTypeForDevice(liveHeroContent, 'mobile')}`} variant='outlined' />
                        <Chip label={`CTA: ${liveHeroContent.cta_label || 'Not set'}`} variant='outlined' />
                        <Chip label={`Alignment: ${liveHeroContent.overlay_alignment}`} variant='outlined' />
                        <Chip label={`Status: ${liveHeroContent.publication_status}`} sx={statusChipColor(liveHeroContent.publication_status)} />
                      </Stack>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12} lg={6} sx={{ order: { xs: 1, lg: 2 } }}>
                  <Box
                    sx={{
                      minHeight: previewDevice === 'mobile' ? { xs: 620, md: 760 } : { xs: 420, md: 540 },
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center'
                    }}
                  >
                    <Box sx={{ width: '100%', maxWidth: previewDevice === 'mobile' ? 390 : '100%' }}>
                      {renderHeroSurface(activePreviewContent, previewDevice, isEditMode)}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} lg={3} sx={{ order: { xs: 2, lg: 3 } }}>
                  <Paper variant='outlined' sx={{ p: 2.5, borderRadius: 2, position: 'sticky', top: 24 }}>
                    {isEditMode ? (
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant='subtitle1' sx={{ mb: 0.5 }}>
                            Properties
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            Click an element on the canvas to edit it. Clicking outside the selection clears the active layer.
                          </Typography>
                        </Box>

                        {selectedEditableLayer ? (
                          <>
                            <Chip label={`${layerLabelMap[selectedEditableLayer]} selected`} sx={statusChipColor('scheduled')} />
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                Scale
                              </Typography>
                              <Slider
                                value={currentSelectedScale}
                                min={70}
                                max={160}
                                step={5}
                                valueLabelDisplay='auto'
                                valueLabelFormat={value => `${value}%`}
                                onChange={(_, value) => setValue(OVERLAY_SCALE_FIELDS[selectedEditableLayer], value as number, { shouldDirty: true })}
                              />
                            </Box>
                            <Box>
                              <Typography variant='caption' color='text.secondary'>
                                Width
                              </Typography>
                              <Slider
                                value={currentSelectedWidth}
                                min={MIN_LAYER_WIDTH[previewDevice]}
                                max={MAX_LAYER_WIDTH[previewDevice]}
                                step={10}
                                valueLabelDisplay='auto'
                                valueLabelFormat={value => `${value}px`}
                                onChange={(_, value) => setValue(OVERLAY_WIDTH_FIELDS[previewDevice][selectedEditableLayer], value as number, { shouldDirty: true })}
                              />
                            </Box>

                            {selectedEditableLayer === 'group' || selectedEditableLayer === 'headline' ? (
                              <Stack spacing={2}>
                                <Controller
                                  name='headline'
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      fullWidth
                                      size='small'
                                      label='Headline'
                                      placeholder='Discover The Bespoke Experience'
                                      helperText='Leave blank to hide the headline.'
                                    />
                                  )}
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                  <Controller
                                    name='headline_font_family'
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl fullWidth size='small'>
                                        <InputLabel>Headline font</InputLabel>
                                        <Select {...field} label='Headline font'>
                                          {Object.entries(HERO_FONT_LABELS).map(([value, label]) => (
                                            <MenuItem key={value} value={value}>
                                              {label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    )}
                                  />
                                  <Controller
                                    name='headline_color'
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl fullWidth size='small'>
                                        <InputLabel>Headline color</InputLabel>
                                        <Select {...field} label='Headline color'>
                                          <MenuItem value='white'>White</MenuItem>
                                          <MenuItem value='soft-white'>Soft white</MenuItem>
                                          <MenuItem value='gold'>Gold</MenuItem>
                                        </Select>
                                      </FormControl>
                                    )}
                                  />
                                </Stack>
                              </Stack>
                            ) : null}

                            {selectedEditableLayer === 'group' || selectedEditableLayer === 'supporting_text' ? (
                              <Stack spacing={2}>
                                <Controller
                                  name='supporting_text'
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      fullWidth
                                      size='small'
                                      multiline
                                      minRows={3}
                                      label='Supporting text'
                                      placeholder='Explain what the client should expect before booking.'
                                      helperText='Leave blank to hide supporting copy.'
                                    />
                                  )}
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                  <Controller
                                    name='supporting_text_font_family'
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl fullWidth size='small'>
                                        <InputLabel>Supporting font</InputLabel>
                                        <Select {...field} label='Supporting font'>
                                          {Object.entries(HERO_FONT_LABELS).map(([value, label]) => (
                                            <MenuItem key={value} value={value}>
                                              {label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    )}
                                  />
                                  <Controller
                                    name='supporting_text_color'
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl fullWidth size='small'>
                                        <InputLabel>Supporting color</InputLabel>
                                        <Select {...field} label='Supporting color'>
                                          <MenuItem value='white'>White</MenuItem>
                                          <MenuItem value='soft-white'>Soft white</MenuItem>
                                          <MenuItem value='gold'>Gold</MenuItem>
                                        </Select>
                                      </FormControl>
                                    )}
                                  />
                                </Stack>
                              </Stack>
                            ) : null}

                            {selectedEditableLayer === 'group' || selectedEditableLayer === 'cta' ? (
                              <>
                                <Controller
                                  name='cta_label'
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      fullWidth
                                      size='small'
                                      label='CTA Label'
                                      placeholder='Reserve Consultation'
                                      helperText='Casing is preserved exactly as entered.'
                                    />
                                  )}
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                  <Controller
                                    name='cta_font_family'
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl fullWidth size='small'>
                                        <InputLabel>Button font</InputLabel>
                                        <Select {...field} label='Button font'>
                                          {Object.entries(HERO_FONT_LABELS).map(([value, label]) => (
                                            <MenuItem key={value} value={value}>
                                              {label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    )}
                                  />
                                  <Controller
                                    name='cta_text_color'
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl fullWidth size='small'>
                                        <InputLabel>Button text color</InputLabel>
                                        <Select {...field} label='Button text color'>
                                          <MenuItem value='white'>White</MenuItem>
                                          <MenuItem value='charcoal'>Charcoal</MenuItem>
                                          <MenuItem value='gold'>Gold</MenuItem>
                                        </Select>
                                      </FormControl>
                                    )}
                                  />
                                  <Controller
                                    name='cta_background_color'
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl fullWidth size='small'>
                                        <InputLabel>Button fill</InputLabel>
                                        <Select {...field} label='Button fill'>
                                          <MenuItem value='gold'>Gold</MenuItem>
                                          <MenuItem value='charcoal'>Charcoal</MenuItem>
                                          <MenuItem value='white'>White</MenuItem>
                                        </Select>
                                      </FormControl>
                                    )}
                                  />
                                </Stack>
                                <Controller
                                  name='cta_action_type'
                                  control={control}
                                  render={({ field }) => (
                                    <FormControl fullWidth size='small'>
                                      <InputLabel>CTA Action</InputLabel>
                                      <Select {...field} label='CTA Action'>
                                        <MenuItem value='cms_page'>CMS Page</MenuItem>
                                        <MenuItem value='route'>Internal Route</MenuItem>
                                        <MenuItem value='booking_modal'>Booking Modal</MenuItem>
                                        <MenuItem value='external_url'>External URL</MenuItem>
                                      </Select>
                                    </FormControl>
                                  )}
                                />
                                <Controller
                                  name='cta_target_slug'
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      fullWidth
                                      size='small'
                                      label='CTA Target Slug'
                                      placeholder='bespoke-experience'
                                      helperText='Used when CTA action is CMS Page.'
                                    />
                                  )}
                                />
                                <Controller
                                  name='cta_target_url'
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      fullWidth
                                      size='small'
                                      label='CTA Target URL'
                                      placeholder='/special-projects/wre-medals or https://...'
                                      helperText='Used for route or external URL actions.'
                                    />
                                  )}
                                />
                              </>
                            ) : null}
                          </>
                        ) : (
                          <Alert severity='info'>No element selected. Click headline, supporting text, CTA, or the grouped block on the canvas.</Alert>
                        )}

                        <Divider />

                        <Box>
                          <Typography variant='subtitle1' sx={{ mb: 1 }}>
                            Publish
                          </Typography>
                          <Stack spacing={2}>
                            {saveError ? (
                              <Alert severity='error'>
                                {saveError}
                              </Alert>
                            ) : null}
                            {uploadStatus ? (
                              <Alert severity='info'>
                                {uploadStatus}
                              </Alert>
                            ) : null}
                            <Controller
                              name='go_live_at'
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  size='small'
                                  type='datetime-local'
                                  label='Schedule Go Live'
                                  InputLabelProps={{ shrink: true }}
                                  helperText='Used only when scheduling.'
                                />
                              )}
                            />
                            <Stack spacing={1.25}>
                              <LoadingButton
                                variant='outlined'
                                sx={{ textTransform: 'none' }}
                                onClick={() => void submitForIntent('draft')}
                                disabled={isSavingHero}
                                loading={activeSaveIntent === 'draft'}
                              >
                                Save Draft
                              </LoadingButton>
                              <LoadingButton
                                variant='outlined'
                                sx={{ textTransform: 'none' }}
                                onClick={() => void submitForIntent('schedule')}
                                disabled={isSavingHero}
                                loading={activeSaveIntent === 'schedule'}
                              >
                                Schedule Hero
                              </LoadingButton>
                              <LoadingButton
                                variant='contained'
                                onClick={() => void submitForIntent('publish')}
                                disabled={isSavingHero}
                                loading={activeSaveIntent === 'publish'}
                                sx={{ textTransform: 'none' }}
                              >
                                Publish Now
                              </LoadingButton>
                              <Button variant='text' sx={{ textTransform: 'none' }} onClick={handleReset} disabled={!isDirty || isSavingHero}>
                                Reset Unsaved Changes
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        <Typography variant='subtitle1'>Mode notes</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          View mode uses the same canvas footprint as edit mode so the hero does not jump when you switch contexts.
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Switch to edit mode to change media, copy, element sizing, draft state, or scheduling.
                        </Typography>
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {isEditMode ? (
                <Paper variant='outlined' sx={{ mt: 3, p: 2.5, borderRadius: 2 }}>
                  <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    justifyContent='space-between'
                    alignItems={{ xs: 'flex-start', lg: 'center' }}
                    spacing={2}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant='subtitle1'>Media library</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Browse reusable CDN assets, assign them per breakpoint, and switch to upload when you need new media.
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                      <Tabs value={mediaPanelMode} onChange={(_, value) => setMediaPanelMode(value)} sx={{ minHeight: 38, '& .MuiTab-root': { minHeight: 38, textTransform: 'none' } }}>
                        <Tab value='gallery' label='Gallery' />
                        <Tab value='upload' label='Upload' />
                      </Tabs>
                      <FormControl size='small' sx={{ minWidth: 180 }}>
                        <InputLabel>Thumbnail density</InputLabel>
                        <Select
                          value={galleryDensity}
                          label='Thumbnail density'
                          onChange={event => setGalleryDensity(event.target.value as GalleryDensity)}
                        >
                          <MenuItem value='compact'>Compact thumbnails</MenuItem>
                          <MenuItem value='comfortable'>Comfortable thumbnails</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size='small' sx={{ minWidth: 140 }}>
                        <InputLabel>Per page</InputLabel>
                        <Select
                          value={galleryPagination.per_page_rows}
                          label='Per page'
                          onChange={event =>
                            setGalleryPagination(prev => ({
                              ...prev,
                              current_page: 1,
                              per_page_rows: Number(event.target.value)
                            }))
                          }
                        >
                          <MenuItem value={8}>8</MenuItem>
                          <MenuItem value={12}>12</MenuItem>
                          <MenuItem value={24}>24</MenuItem>
                          <MenuItem value={36}>36</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Stack>

                  {mediaPanelMode === 'gallery' ? (
                    uploadedFiles.length > 0 ? (
                      <>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns:
                              galleryDensity === 'compact'
                                ? { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }
                                : { xs: 'repeat(1, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
                            gap: 2
                          }}
                        >
                          {uploadedFiles.map(file => (
                            <Paper key={file.id} variant='outlined' sx={{ p: 1.5 }}>
                              <Box
                                sx={{
                                  position: 'relative',
                                  borderRadius: 1.5,
                                  overflow: 'hidden',
                                  mb: 1.25,
                                  bgcolor: '#111',
                                  aspectRatio: galleryDensity === 'compact' ? '1 / 1' : '16 / 9'
                                }}
                              >
                                {file.type === 'video' ? (
                                  <video src={file.preview || file.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                ) : (
                                  <img src={file.preview || file.url} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                              </Box>
                              <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
                                <Typography variant='body2' noWrap sx={{ flexGrow: 1 }} title={file.name}>
                                  {file.name}
                                </Typography>
                                <Chip size='small' label={file.source === 'cdn' ? 'CDN' : 'Local'} sx={file.source === 'cdn' ? statusChipColor('published') : statusChipColor('draft')} />
                              </Stack>
                              <Typography variant='caption' color='text.secondary'>
                                {(file.size / 1024 / 1024).toFixed(1)} MB · {file.type}
                              </Typography>
                              <Stack direction='row' spacing={1} sx={{ mt: 1.25 }}>
                                <Button size='small' variant='outlined' sx={{ textTransform: 'none' }} onClick={() => handleFileSelect(file, 'desktop')}>
                                  Desktop
                                </Button>
                                <Button size='small' variant='outlined' sx={{ textTransform: 'none' }} onClick={() => handleFileSelect(file, 'mobile')}>
                                  Mobile
                                </Button>
                                <IconButton size='small' onClick={() => void handleDeleteFile(file)} sx={{ ml: 'auto', color: 'error.main' }}>
                                  <Icon icon='tabler:trash' fontSize='1rem' />
                                </IconButton>
                              </Stack>
                            </Paper>
                          ))}
                        </Box>

                        <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mt: 2 }}>
                          <Typography variant='body2' color='text.secondary'>
                            Page {galleryPagination.current_page} of {galleryPagination.total_pages} · {galleryPagination.total_items} assets
                          </Typography>
                          <Stack direction='row' spacing={1}>
                            <Button
                              variant='outlined'
                              size='small'
                              sx={{ textTransform: 'none' }}
                              disabled={galleryPagination.current_page <= 1}
                              onClick={() =>
                                setGalleryPagination(prev => ({
                                  ...prev,
                                  current_page: Math.max(1, prev.current_page - 1)
                                }))
                              }
                            >
                              Previous
                            </Button>
                            <Button
                              variant='outlined'
                              size='small'
                              sx={{ textTransform: 'none' }}
                              disabled={galleryPagination.current_page >= galleryPagination.total_pages}
                              onClick={() =>
                                setGalleryPagination(prev => ({
                                  ...prev,
                                  current_page: Math.min(prev.total_pages, prev.current_page + 1)
                                }))
                              }
                            >
                              Next
                            </Button>
                          </Stack>
                        </Stack>
                      </>
                    ) : (
                      <Alert severity='info'>No gallery assets yet. Upload the first asset to build the reusable library.</Alert>
                    )
                  ) : (
                    <Stack spacing={2}>
                      <Paper
                        {...getRootProps()}
                        sx={{
                          p: 4,
                          border: '2px dashed',
                          borderColor: isDragActive ? 'primary.main' : 'grey.300',
                          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                        }}
                      >
                        <input {...getInputProps()} />
                        <Icon icon='tabler:cloud-upload' fontSize='2rem' color='primary' />
                        <Typography variant='subtitle1' sx={{ mt: 1.5, mb: 0.5 }}>
                          {isDragActive ? 'Drop files here...' : 'Drop media onto the canvas library'}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          MP4, WebM, MOV, JPG, PNG, WebP up to 50MB. New uploads are added to the gallery and can be assigned immediately.
                        </Typography>
                      </Paper>
                      <URLInputSection onURLAdded={handleURLAdded} onPreview={handleURLPreview} />
                    </Stack>
                  )}
                </Paper>
              ) : null}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <EnhancedPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        previewData={previewData}
      />
      <Dialog
        open={publishConfirmOpen}
        onClose={() => {
          if (!isSavingHero) {
            setPublishConfirmOpen(false)
          }
        }}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>Publish hero now?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will replace the live homepage hero immediately. Save as a draft or schedule it instead if the content is not ready for visitors.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 5 }}>
          <Button
            variant='outlined'
            color='secondary'
            onClick={() => setPublishConfirmOpen(false)}
            disabled={isSavingHero}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant='contained'
            onClick={() => void handleConfirmSave()}
            loading={activeSaveIntent === 'publish'}
            disabled={isSavingHero}
            sx={{ textTransform: 'none' }}
          >
            Publish Hero
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default HeroContentManagement
