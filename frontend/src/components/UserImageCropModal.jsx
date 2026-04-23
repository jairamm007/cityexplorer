import { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import { toast } from 'react-toastify';
import 'react-easy-crop/react-easy-crop.css';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = url;
  });

const buildCropSource = (source) => {
  if (!source) {
    return source;
  }

  if (/^https?:\/\//i.test(source)) {
    return `/api/utils/image-proxy?url=${encodeURIComponent(source)}`;
  }

  return source;
};

const getCroppedFile = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.95);
  });

  if (!blob) {
    throw new Error('Unable to create cropped image');
  }

  const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
  const previewUrl = URL.createObjectURL(blob);

  return { file, previewUrl };
};

const ImageCropModal = ({ isOpen, imageSrc, onClose, onApply, initialAspect = 16 / 9 }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(initialAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAspect(initialAspect);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [isOpen, initialAspect]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const applyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    setSaving(true);
    try {
      const cropSource = buildCropSource(imageSrc);
      const result = await getCroppedFile(cropSource, croppedAreaPixels);
      onApply(result);
    } catch (error) {
      toast.error('Unable to crop this image. Try another image URL or upload file.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !imageSrc) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-slate-900">Crop image</h3>
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            Ratio
            <select
              value={String(aspect)}
              onChange={(event) => setAspect(Number(event.target.value))}
              className="rounded-full border border-slate-300 px-3 py-1.5"
            >
              <option value={String(1)}>1:1</option>
              <option value={String(4 / 3)}>4:3</option>
              <option value={String(16 / 9)}>16:9</option>
              <option value={String(3 / 2)}>3:2</option>
            </select>
          </label>
        </div>

        <div className="relative mt-4 h-80 overflow-hidden rounded-2xl bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyCrop}
            disabled={saving}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Applying...' : 'Apply crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
