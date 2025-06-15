import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import Icon from 'src/@core/components/icon';

interface URLInputSectionProps {
  onURLAdded: (url: string, type: 'video' | 'image', device: 'desktop' | 'mobile') => void;
  onPreview: (urls: { desktop: string; mobile: string; type: 'video' | 'image' }) => void;
}

interface URLEntry {
  id: string;
  url: string;
  type: 'video' | 'image';
  device: 'desktop' | 'mobile';
  isValid: boolean;
  isLoading: boolean;
}

const URLInputSection: React.FC<URLInputSectionProps> = ({ onURLAdded, onPreview }) => {
  const [desktopURL, setDesktopURL] = useState('');
  const [mobileURL, setMobileURL] = useState('');
  const [contentType, setContentType] = useState<'video' | 'image'>('video');
  const [urlEntries, setUrlEntries] = useState<URLEntry[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateURL = async (url: string): Promise<{ isValid: boolean; type: 'video' | 'image' | null }> => {
    try {
      // Basic URL validation
      new URL(url);

      // Check if it's a valid media URL by trying to load it
      return new Promise((resolve) => {
        const video = document.createElement('video');
        const image = document.createElement('img');

        let resolved = false;

        // Try video first
        video.onloadedmetadata = () => {
          if (!resolved) {
            resolved = true;
            resolve({ isValid: true, type: 'video' });
          }
        };

        video.onerror = () => {
          // Try image if video fails
          image.onload = () => {
            if (!resolved) {
              resolved = true;
              resolve({ isValid: true, type: 'image' });
            }
          };

          image.onerror = () => {
            if (!resolved) {
              resolved = true;
              resolve({ isValid: false, type: null });
            }
          };

          image.src = url;
        };

        video.src = url;

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve({ isValid: false, type: null });
          }
        }, 5000);
      });
    } catch {
      return { isValid: false, type: null };
    }
  };

  const handleAddURL = async () => {
    if (!desktopURL.trim()) {
      setValidationError('Desktop URL is required');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      // Validate desktop URL
      const desktopValidation = await validateURL(desktopURL);
      if (!desktopValidation.isValid) {
        setValidationError('Invalid desktop URL or unsupported media format');
        setIsValidating(false);
        return;
      }

      // Validate mobile URL if provided
      let mobileValidation = { isValid: true, type: desktopValidation.type };
      if (mobileURL.trim()) {
        mobileValidation = await validateURL(mobileURL);
        if (!mobileValidation.isValid) {
          setValidationError('Invalid mobile URL or unsupported media format');
          setIsValidating(false);
          return;
        }
      }

      // Check if types match
      if (mobileURL.trim() && desktopValidation.type !== mobileValidation.type) {
        setValidationError('Desktop and mobile URLs must be the same media type (both video or both image)');
        setIsValidating(false);
        return;
      }

      const detectedType = desktopValidation.type!;

      // Add URLs to entries
      const newEntries: URLEntry[] = [
        {
          id: `desktop-${Date.now()}`,
          url: desktopURL,
          type: detectedType,
          device: 'desktop',
          isValid: true,
          isLoading: false
        }
      ];

      if (mobileURL.trim()) {
        newEntries.push({
          id: `mobile-${Date.now()}`,
          url: mobileURL,
          type: detectedType,
          device: 'mobile',
          isValid: true,
          isLoading: false
        });
      }

      setUrlEntries(prev => [...prev, ...newEntries]);

      // Notify parent components
      onURLAdded(desktopURL, detectedType, 'desktop');
      if (mobileURL.trim()) {
        onURLAdded(mobileURL, detectedType, 'mobile');
      }

      // Clear inputs
      setDesktopURL('');
      setMobileURL('');
      setContentType(detectedType);

    } catch (error) {
      setValidationError('Failed to validate URLs. Please check the URLs and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handlePreview = () => {
    if (urlEntries.length === 0) {
      setValidationError('Please add URLs before previewing');
      return;
    }

    const desktopEntry = urlEntries.find(entry => entry.device === 'desktop');
    const mobileEntry = urlEntries.find(entry => entry.device === 'mobile');

    if (!desktopEntry) {
      setValidationError('Desktop URL is required for preview');
      return;
    }

    onPreview({
      desktop: desktopEntry.url,
      mobile: mobileEntry?.url || desktopEntry.url,
      type: desktopEntry.type
    });
  };

  const handleRemoveEntry = (id: string) => {
    setUrlEntries(prev => prev.filter(entry => entry.id !== id));
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon icon='tabler:cloud-upload' style={{ color: '#c6a55a' }} />
          Add Content URLs (Backwards Compatibility)
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter URLs for existing content hosted elsewhere. The system will automatically detect if it's a video or image.
        </Typography>

        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Desktop URL"
              value={desktopURL}
              onChange={(e) => setDesktopURL(e.target.value)}
              placeholder="https://example.com/desktop-video.mp4"
              disabled={isValidating}
              helperText="Required: URL for desktop version"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mobile URL (Optional)"
              value={mobileURL}
              onChange={(e) => setMobileURL(e.target.value)}
              placeholder="https://example.com/mobile-video.mp4"
              disabled={isValidating}
              helperText="Optional: Will use desktop URL if not provided"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleAddURL}
            disabled={isValidating || !desktopURL.trim()}
            startIcon={isValidating ? <CircularProgress size={20} /> : <Icon icon='tabler:plus' />}
            sx={{
              backgroundColor: '#c6a55a',
              '&:hover': { backgroundColor: '#b8944d' }
            }}
          >
            {isValidating ? 'Validating...' : 'Add URLs'}
          </Button>

          <Button
            variant="outlined"
            onClick={handlePreview}
            disabled={urlEntries.length === 0}
            startIcon={<Icon icon='tabler:eye' />}
            sx={{
              borderColor: '#c6a55a',
              color: '#c6a55a',
              '&:hover': { borderColor: '#b8944d', backgroundColor: '#f9f7f4' }
            }}
          >
            Preview
          </Button>
        </Box>

        {/* Display added URLs */}
        {urlEntries.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Added URLs:
            </Typography>
            <Grid container spacing={1}>
              {urlEntries.map((entry) => (
                <Grid item xs={12} key={entry.id}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    backgroundColor: '#f9f9f9',
                    borderRadius: 1
                  }}>
                    <Chip
                      label={entry.device}
                      size="small"
                      sx={{
                        backgroundColor: entry.device === 'desktop' ? '#e3f2fd' : '#f3e5f5',
                        color: entry.device === 'desktop' ? '#1976d2' : '#7b1fa2'
                      }}
                    />
                    <Chip
                      label={entry.type}
                      size="small"
                      sx={{
                        backgroundColor: entry.type === 'video' ? '#e8f5e8' : '#fff3e0',
                        color: entry.type === 'video' ? '#2e7d32' : '#f57c00'
                      }}
                    />
                    <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '0.875rem' }}>
                      {entry.url.length > 50 ? `${entry.url.substring(0, 50)}...` : entry.url}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveEntry(entry.id)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <Icon icon='tabler:trash' fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default URLInputSection;
