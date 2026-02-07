import { useRef, useState } from 'react';
import type { GearPhoto, GearPhotoType } from '../types';

interface PhotoCaptureProps {
  photos: GearPhoto[];
  onPhotosChange: (photos: GearPhoto[]) => void;
  disabled?: boolean;
}

const PHOTO_TYPES: { id: GearPhotoType; label: string; description: string }[] = [
  { id: 'fullView', label: 'Full View', description: 'Full photo of the gear' },
  { id: 'labelView', label: 'Label', description: 'Photo of the label/specs' },
  { id: 'other', label: 'Other', description: 'Additional photo' },
];

export function PhotoCapture({ photos, onPhotosChange, disabled }: PhotoCaptureProps) {
  const [activeType, setActiveType] = useState<GearPhotoType | null>(null);
  const [capturing, setCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getPhotoByType = (type: GearPhotoType): GearPhoto | undefined => {
    return photos.find((p) => p.type === type);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeType) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      addPhoto(dataUrl, activeType);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCapturing(true);
    } catch (err) {
      console.error('Failed to access camera:', err);
      // Fallback to file input
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !activeType) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      addPhoto(dataUrl, activeType);
    }

    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCapturing(false);
  };

  const addPhoto = (url: string, type: GearPhotoType) => {
    const newPhoto: GearPhoto = {
      id: `photo-${Date.now()}`,
      type,
      url,
      createdAt: new Date().toISOString(),
    };

    // Replace existing photo of same type, or add new
    const existingIndex = photos.findIndex((p) => p.type === type);
    if (existingIndex >= 0) {
      const updated = [...photos];
      updated[existingIndex] = newPhoto;
      onPhotosChange(updated);
    } else {
      onPhotosChange([...photos, newPhoto]);
    }
  };

  const removePhoto = (photoId: string) => {
    onPhotosChange(photos.filter((p) => p.id !== photoId));
  };

  const handleTypeClick = (type: GearPhotoType) => {
    // Toggle selection - clicking same slot again deselects it
    setActiveType(activeType === type ? null : type);
  };

  const handleUploadClick = (type: GearPhotoType) => {
    setActiveType(type);
    fileInputRef.current?.click();
  };

  const handleTakeClick = (type: GearPhotoType) => {
    setActiveType(type);
    startCamera();
  };

  if (capturing) {
    return (
      <div className="photo-capture-camera">
        <video ref={videoRef} autoPlay playsInline muted className="camera-preview" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className="camera-controls">
          <button type="button" className="btn btn-secondary" onClick={stopCamera}>
            Cancel
          </button>
          <button type="button" className="btn btn-capture" onClick={capturePhoto}>
            <span className="capture-icon" />
          </button>
          <div style={{ width: 80 }} />
        </div>
        <p className="camera-hint">
          Taking {PHOTO_TYPES.find((t) => t.id === activeType)?.label || 'Full View'} photo
        </p>
      </div>
    );
  }

  return (
    <div className="photo-capture">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div className="photo-slots">
        {PHOTO_TYPES.map((photoType) => {
          const photo = getPhotoByType(photoType.id);
          const isActive = activeType === photoType.id;

          return (
            <div
              key={photoType.id}
              className={`photo-slot ${isActive ? 'active' : ''} ${photo ? 'has-photo' : ''}`}
              onClick={() => !disabled && handleTypeClick(photoType.id)}
            >
              {photo ? (
                <>
                  <img src={photo.url} alt={photoType.label} className="photo-preview" />
                  <div className="photo-overlay">
                    <span className="photo-type-badge">{photoType.label}</span>
                    {!disabled && (
                      <button
                        type="button"
                        className="photo-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(photo.id);
                        }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                  {isActive && !disabled && (
                    <div className="photo-slot-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn btn-small"
                        onClick={() => handleUploadClick(photoType.id)}
                      >
                        Replace
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="photo-placeholder">
                    <span className="placeholder-icon">+</span>
                    <span className="placeholder-label">{photoType.label}</span>
                    {!isActive && (
                      <span className="placeholder-desc">{photoType.description}</span>
                    )}
                  </div>
                  {isActive && !disabled && (
                    <div className="photo-slot-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn btn-small"
                        onClick={() => handleUploadClick(photoType.id)}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        className="btn btn-small"
                        onClick={() => handleTakeClick(photoType.id)}
                      >
                        Take
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional photos */}
      {photos.filter((p) => p.type === 'other').length > 0 && (
        <div className="additional-photos">
          <h4>Additional Photos</h4>
          <div className="additional-photos-grid">
            {photos
              .filter((p) => p.type === 'other')
              .map((photo) => (
                <div key={photo.id} className="additional-photo">
                  <img src={photo.url} alt="Additional" />
                  {!disabled && (
                    <button
                      type="button"
                      className="photo-remove"
                      onClick={() => removePhoto(photo.id)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
