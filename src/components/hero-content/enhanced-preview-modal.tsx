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
  AppBar,
  Toolbar,
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
  content_type: 'video' | 'image';
}

interface EnhancedPreviewModalProps {
  open: boolean;
  onClose: () => void;
  previewData: PreviewData | null;
  onConfirm?: () => void;
  showConfirmButton?: boolean;
  isLoading?: boolean;
  uploadStatus?: string;
}

const EnhancedPreviewModal: React.FC<EnhancedPreviewModalProps> = ({
  open,
  onClose,
  previewData,
  onConfirm,
  showConfirmButton = false,
  isLoading = false,
  uploadStatus
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    console.log('👀 Preview modal received data:', previewData)
    if (previewData?.content_type === 'video' && videoRef.current) {
      videoRef.current.load();
    }
  }, [previewData]);

  if (!previewData) {
    console.log('👀 Preview modal: no preview data, returning null')
    return null;
  }

  const MockNavbar = ({ isMobileView }: { isMobileView: boolean }) => (
    <Box
      sx={{
        backgroundColor: '#000000',
        borderBottom: '1px solid #c6a55a',
        minHeight: isMobileView ? 56 : 64,
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

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
        <Typography
          variant={isMobileView ? "subtitle1" : "h6"}
          component="div"
          sx={{
            color: '#c6a55a',
            fontFamily: 'Karla, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.1em',
            fontSize: isMobileView ? '1rem' : '1.25rem'
          }}
        >
          NUNGU DIAMONDS
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
      {previewData.content_type === 'video' ? (
        <video
          ref={videoRef}
          src={url}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          controls
          muted
          loop
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
                <MockNavbar isMobileView={false} />
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
                  <MockNavbar isMobileView={true} />
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
              {isLoading ? 'Publishing...' : 'Publish Changes'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EnhancedPreviewModal;
