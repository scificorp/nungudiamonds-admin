import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import Icon from 'src/@core/components/icon';

interface PreviewData {
  desktop_url: string;
  mobile_url: string;
  desktop_content_type: 'video' | 'image';
  mobile_content_type: 'video' | 'image';
  content_type: 'video' | 'image';
  headline?: string;
  supporting_text?: string;
  cta_label?: string;
  headline_font_family?: 'display-serif' | 'body-sans';
  supporting_text_font_family?: 'display-serif' | 'body-sans';
  cta_font_family?: 'display-serif' | 'body-sans';
  headline_color?: 'white' | 'soft-white' | 'gold';
  supporting_text_color?: 'white' | 'soft-white' | 'gold';
  cta_text_color?: 'white' | 'charcoal' | 'gold';
  cta_background_color?: 'gold' | 'charcoal' | 'white';
  overlay_alignment?: 'left' | 'center' | 'right';
  overlay_width?: 'compact' | 'regular' | 'wide';
  overlay_scale?: number;
  desktop_overlay_x?: number;
  desktop_overlay_y?: number;
  mobile_overlay_x?: number;
  mobile_overlay_y?: number;
  overlay_grouped?: boolean;
  desktop_group_width?: number;
  mobile_group_width?: number;
  headline_scale?: number;
  supporting_text_scale?: number;
  cta_scale?: number;
  desktop_headline_x?: number;
  desktop_headline_y?: number;
  desktop_headline_width?: number;
  desktop_supporting_text_x?: number;
  desktop_supporting_text_y?: number;
  desktop_supporting_text_width?: number;
  desktop_cta_x?: number;
  desktop_cta_y?: number;
  desktop_cta_width?: number;
  mobile_headline_x?: number;
  mobile_headline_y?: number;
  mobile_headline_width?: number;
  mobile_supporting_text_x?: number;
  mobile_supporting_text_y?: number;
  mobile_supporting_text_width?: number;
  mobile_cta_x?: number;
  mobile_cta_y?: number;
  mobile_cta_width?: number;
}

interface EnhancedPreviewModalProps {
  open: boolean;
  onClose: () => void;
  previewData: PreviewData | null;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
  isLoading?: boolean;
  uploadStatus?: string;
  confirmLabel?: string;
}

const debugLog = (..._args: unknown[]) => {
  if (process.env.NEXT_PUBLIC_DEBUG_HERO_CONTENT === 'true') {
    console.info(..._args)
  }
}

const STOREFRONT_HEADING_FONT = `'Canela Text Trial', 'Playfair Display', 'Canela Text Trial Fallback', Georgia, 'Times New Roman', serif`
const STOREFRONT_BODY_FONT = `'Karla', sans-serif`
const HERO_FONT_STACKS = {
  'display-serif': STOREFRONT_HEADING_FONT,
  'body-sans': STOREFRONT_BODY_FONT
} as const
const HERO_TEXT_COLORS = {
  white: '#ffffff',
  'soft-white': 'rgba(255,255,255,0.88)',
  gold: '#c6a55a'
} as const
const HERO_CTA_TEXT_COLORS = {
  white: '#ffffff',
  charcoal: '#111827',
  gold: '#c6a55a'
} as const
const HERO_CTA_BACKGROUND_COLORS = {
  gold: '#c6a55a',
  charcoal: '#111827',
  white: '#ffffff'
} as const
const PREVIEW_NAVBAR_HEIGHT = {
  desktop: 96,
  mobile: 64
}

const EnhancedPreviewModal: React.FC<EnhancedPreviewModalProps> = ({
  open,
  onClose,
  previewData,
  onConfirm,
  showConfirmButton = false,
  isLoading = false,
  uploadStatus,
  confirmLabel = 'Publish Changes'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    debugLog('👀 Preview modal received data:', previewData)
    if (previewData?.desktop_content_type === 'video' && videoRef.current) {
      videoRef.current.load();
    }
  }, [previewData]);

  if (!previewData) {
    debugLog('👀 Preview modal: no preview data, returning null')

    return null;
  }

  const MockNavbar = ({ isMobileView }: { isMobileView: boolean }) => (
    <Box
      sx={{
        backgroundColor: '#000000',
        borderBottom: '1px solid #c6a55a',
        minHeight: isMobileView ? PREVIEW_NAVBAR_HEIGHT.mobile : PREVIEW_NAVBAR_HEIGHT.desktop,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        width: '100%'
      }}
    >
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2, color: '#c6a55a' }}
        size={isMobileView ? 'small' : 'medium'}
      >
        <Icon icon='tabler:menu-2' />
      </IconButton>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography
          variant={isMobileView ? "subtitle1" : "h6"}
          component="div"
          sx={{
            color: '#c6a55a',
            fontFamily: STOREFRONT_HEADING_FONT,
            fontWeight: 500,
            letterSpacing: '0.1em',
            fontSize: isMobileView ? '1.9rem' : '2.4rem',
            lineHeight: 1
          }}
        >
          NUNGU
        </Typography>
        <Typography sx={{ color: '#c6a55a', fontFamily: STOREFRONT_BODY_FONT, fontSize: isMobileView ? '0.7rem' : '0.85rem', letterSpacing: '0.18em', lineHeight: 1 }}>
          DIAMONDS
        </Typography>
      </Box>

      <IconButton
        edge="end"
        color="inherit"
        aria-label="search"
        sx={{ color: '#c6a55a' }}
        size={isMobileView ? 'small' : 'medium'}
      >
        <Icon icon='tabler:search' />
      </IconButton>
    </Box>
  );

  const PreviewContent = ({ url, isMobileView }: { url: string; isMobileView: boolean }) => (
    <Box
      sx={{
        width: '100%',
        height: isMobileView ? 300 : 400,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1,
        backgroundColor: '#f5f5f5'
      }}
    >
      {(isMobileView ? previewData.mobile_content_type : previewData.desktop_content_type) === 'video' ? (
        <video
          ref={videoRef}
          src={url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          muted
          autoPlay
          loop
          playsInline
        />
      ) : (
        <img
          ref={imageRef}
          src={url}
          alt={`${isMobileView ? 'Mobile' : 'Desktop'} Preview`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, pointerEvents: 'none' }}>
        <MockNavbar isMobileView={isMobileView} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.64) 100%)',
          p: isMobileView ? 2 : 4
        }}
      >
        {(() => {
          const overlayScale = (previewData.overlay_scale || 100) / 100
          const groupWidth = isMobileView
            ? previewData.mobile_group_width || (previewData.overlay_width === 'compact' ? 220 : previewData.overlay_width === 'wide' ? 340 : 300)
            : previewData.desktop_group_width || (previewData.overlay_width === 'compact' ? 320 : previewData.overlay_width === 'wide' ? 620 : 460)
          const textAlign =
            previewData.overlay_alignment === 'center'
              ? 'center'
              : previewData.overlay_alignment === 'right'
                ? 'right'
                : 'left'
          const alignItems =
            previewData.overlay_alignment === 'center'
              ? 'center'
              : previewData.overlay_alignment === 'right'
                ? 'flex-end'
                : 'flex-start'
          const layerPosition = (layer: 'group' | 'headline' | 'supporting_text' | 'cta') => {
            const map = isMobileView
              ? {
                  group: { x: previewData.mobile_overlay_x || 50, y: previewData.mobile_overlay_y || 72 },
                  headline: { x: previewData.mobile_headline_x || 50, y: previewData.mobile_headline_y || 62 },
                  supporting_text: { x: previewData.mobile_supporting_text_x || 50, y: previewData.mobile_supporting_text_y || 72 },
                  cta: { x: previewData.mobile_cta_x || 50, y: previewData.mobile_cta_y || 83 }
                }
              : {
                  group: { x: previewData.desktop_overlay_x || 28, y: previewData.desktop_overlay_y || 68 },
                  headline: { x: previewData.desktop_headline_x || 28, y: previewData.desktop_headline_y || 60 },
                  supporting_text: { x: previewData.desktop_supporting_text_x || 28, y: previewData.desktop_supporting_text_y || 70 },
                  cta: { x: previewData.desktop_cta_x || 28, y: previewData.desktop_cta_y || 81 }
                }

            return map[layer]
          }
          const layerWidth = (layer: 'group' | 'headline' | 'supporting_text' | 'cta') => {
            if (isMobileView) {
              return {
                group: groupWidth,
                headline: previewData.mobile_headline_width || 280,
                supporting_text: previewData.mobile_supporting_text_width || 280,
                cta: previewData.mobile_cta_width || 260
              }[layer]
            }

            return {
              group: groupWidth,
              headline: previewData.desktop_headline_width || 460,
              supporting_text: previewData.desktop_supporting_text_width || 460,
              cta: previewData.desktop_cta_width || 320
            }[layer]
          }
          const layerScale = (layer: 'group' | 'headline' | 'supporting_text' | 'cta') =>
            ((layer === 'headline'
              ? previewData.headline_scale
              : layer === 'supporting_text'
                ? previewData.supporting_text_scale
                : layer === 'cta'
                  ? previewData.cta_scale
                  : previewData.overlay_scale) || 100) / 100

          const wrapperSx = (layer: 'group' | 'headline' | 'supporting_text' | 'cta') => ({
            position: 'absolute',
            left: `${layerPosition(layer).x}%`,
            top: `${layerPosition(layer).y}%`,
            transform: 'translate(-50%, -50%)',
            width: `${layerWidth(layer)}px`,
            maxWidth: 'calc(100% - 24px)',
            textAlign,
            display: 'flex',
            flexDirection: 'column',
            alignItems
          })

          const headlineNode = previewData.headline ? (
            <Typography
              variant={isMobileView ? 'h5' : 'h3'}
              sx={{
                color: HERO_TEXT_COLORS[previewData.headline_color || 'white'],
                fontFamily: HERO_FONT_STACKS[previewData.headline_font_family || 'display-serif'],
                fontWeight: 600,
                lineHeight: 1.04,
                fontSize: isMobileView
                  ? `${2.2 * ((previewData.overlay_grouped ?? true) ? overlayScale : layerScale('headline'))}rem`
                  : `${3.2 * ((previewData.overlay_grouped ?? true) ? overlayScale : layerScale('headline'))}rem`
              }}
            >
              {previewData.headline}
            </Typography>
          ) : null

          const supportingNode = previewData.supporting_text ? (
            <Typography
              sx={{
                color: HERO_TEXT_COLORS[previewData.supporting_text_color || 'soft-white'],
                fontFamily: HERO_FONT_STACKS[previewData.supporting_text_font_family || 'body-sans'],
                fontSize: `${(isMobileView ? 0.95 : 1) * ((previewData.overlay_grouped ?? true) ? overlayScale : layerScale('supporting_text'))}rem`,
                lineHeight: 1.6
              }}
            >
              {previewData.supporting_text}
            </Typography>
          ) : null

          const ctaNode = previewData.cta_label ? (
            <Button
              variant='contained'
              sx={{
                backgroundColor: HERO_CTA_BACKGROUND_COLORS[previewData.cta_background_color || 'gold'],
                color: HERO_CTA_TEXT_COLORS[previewData.cta_text_color || 'white'],
                px: isMobileView ? 2.5 : 3,
                py: 1.2,
                minWidth: isMobileView ? 180 : 220,
                textTransform: 'none',
                fontFamily: HERO_FONT_STACKS[previewData.cta_font_family || 'body-sans'],
                fontSize: `${0.95 * ((previewData.overlay_grouped ?? true) ? overlayScale : layerScale('cta'))}rem`,
                '&:hover': { backgroundColor: '#b8944d' }
              }}
            >
              {previewData.cta_label}
            </Button>
          ) : null

          if (previewData.overlay_grouped ?? true) {
            return (
              <Box
                sx={{
                  position: 'absolute',
                  top: `${isMobileView ? PREVIEW_NAVBAR_HEIGHT.mobile : PREVIEW_NAVBAR_HEIGHT.desktop}px`,
                  right: 0,
                  bottom: 0,
                  left: 0
                }}
              >
                <Box sx={wrapperSx('group')}>
                  {headlineNode}
                  {supportingNode ? <Box sx={{ mt: 1.5 }}>{supportingNode}</Box> : null}
                  {ctaNode ? <Box sx={{ mt: 2.5 }}>{ctaNode}</Box> : null}
                </Box>
              </Box>
            )
          }

          return (
            <Box
              sx={{
                position: 'absolute',
                top: `${isMobileView ? PREVIEW_NAVBAR_HEIGHT.mobile : PREVIEW_NAVBAR_HEIGHT.desktop}px`,
                right: 0,
                bottom: 0,
                left: 0
              }}
            >
              {headlineNode ? <Box sx={wrapperSx('headline')}>{headlineNode}</Box> : null}
              {supportingNode ? <Box sx={wrapperSx('supporting_text')}>{supportingNode}</Box> : null}
              {ctaNode ? <Box sx={wrapperSx('cta')}>{ctaNode}</Box> : null}
            </Box>
          )
        })()}
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          minHeight: isMobile ? '100vh' : '80vh',
          backgroundColor: '#fafafa'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" sx={{ fontFamily: 'Karla', fontWeight: 600 }}>
          Hero Content Preview
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="Desktop"
            variant={activeView === 'desktop' ? 'filled' : 'outlined'}
            onClick={() => setActiveView('desktop')}
            sx={{
              backgroundColor: activeView === 'desktop' ? '#c6a55a' : 'transparent',
              color: activeView === 'desktop' ? '#ffffff' : '#c6a55a',
              borderColor: '#c6a55a'
            }}
          />
          <Chip
            label="Mobile"
            variant={activeView === 'mobile' ? 'filled' : 'outlined'}
            onClick={() => setActiveView('mobile')}
            sx={{
              backgroundColor: activeView === 'mobile' ? '#c6a55a' : 'transparent',
              color: activeView === 'mobile' ? '#ffffff' : '#c6a55a',
              borderColor: '#c6a55a'
            }}
          />
          <IconButton onClick={onClose} size="small">
            <Icon icon='tabler:x' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#fafafa' }}>
        <Grid container spacing={0} sx={{ height: '100%' }}>
          {/* Desktop Preview */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: activeView === 'desktop' || !isMobile ? 'block' : 'none',
              borderRight: !isMobile ? '1px solid #e0e0e0' : 'none'
            }}
          >
            <Paper elevation={0} sx={{ height: '100%', borderRadius: 0 }}>
              <Box sx={{ p: 2, backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Karla', fontWeight: 600 }}>
                  Desktop View
                </Typography>
              </Box>
              <Box sx={{ backgroundColor: '#ffffff' }}>
                <PreviewContent url={previewData.desktop_url} isMobileView={false} />
              </Box>
            </Paper>
          </Grid>

          {/* Mobile Preview */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: activeView === 'mobile' || !isMobile ? 'block' : 'none'
            }}
          >
            <Paper elevation={0} sx={{ height: '100%', borderRadius: 0 }}>
              <Box sx={{ p: 2, backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Karla', fontWeight: 600 }}>
                  Mobile View
                </Typography>
              </Box>
              <Box sx={{
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'center',
                p: 2
              }}>
                <Box sx={{
                  width: '100%',
                  maxWidth: 375,
                  border: '2px solid #e0e0e0',
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: '#ffffff'
                }}>
                  <PreviewContent url={previewData.mobile_url} isMobileView={true} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        p: 2,
        flexDirection: 'column',
        alignItems: 'stretch'
      }}>
        {/* Upload Status */}
        {isLoading && uploadStatus && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Typography variant="body2" sx={{ mb: 1, textAlign: 'center' }}>
              {uploadStatus}
            </Typography>
            <LinearProgress sx={{ borderRadius: 1 }} />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={onClose}
            disabled={isLoading}
            sx={{
              color: '#666666',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            {isLoading ? 'Cancel' : 'Close'}
          </Button>
          {showConfirmButton && onConfirm && (
            <Button
              onClick={onConfirm}
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
              sx={{
                backgroundColor: '#c6a55a',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#b8944d' },
                '&:disabled': { backgroundColor: '#e0e0e0' }
              }}
            >
              {isLoading ? 'Saving...' : confirmLabel}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedPreviewModal;
