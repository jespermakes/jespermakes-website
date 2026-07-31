// Lunar height field for the moon lamp (DR-160 Phase B2). The asset is
// NASA's LDEM displacement map (public domain, SVS CGI Moon Kit), served
// from /images/lamp-designer/moon-height.jpg as a 1024x512 equirect
// grayscale. Tests inject synthetic fields so no canvas is needed.

export interface HeightField {
  width: number;
  height: number;
  /** Brightness 0..1, row-major, v=0 at the top of the image (north). */
  data: Float32Array;
}

let cachedField: HeightField | null = null;
let loading: Promise<HeightField> | null = null;

export function setHeightFieldForTests(field: HeightField | null): void {
  cachedField = field;
  loading = null;
}

export function getLoadedMoonField(): HeightField | null {
  return cachedField;
}

/** Bilinear sample; u wraps around (longitude), v clamps (latitude). */
export function sampleField(field: HeightField, u: number, v: number): number {
  const uu = ((u % 1) + 1) % 1;
  const vv = Math.min(1, Math.max(0, v));
  const x = uu * (field.width - 1);
  const y = vv * (field.height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(field.width - 1, x0 + 1);
  const y1 = Math.min(field.height - 1, y0 + 1);
  const fx = x - x0;
  const fy = y - y0;
  const at = (px: number, py: number) => field.data[py * field.width + px];
  const top = at(x0, y0) * (1 - fx) + at(x1, y0) * fx;
  const bottom = at(x0, y1) * (1 - fx) + at(x1, y1) * fx;
  return top * (1 - fy) + bottom * fy;
}

/**
 * Load the NASA moon height field in the browser (img + canvas). Cached
 * for the session. Callers that run before it resolves get a smooth
 * sphere; the mesh rebuilds when the field arrives.
 */
export function loadMoonHeightField(): Promise<HeightField> {
  if (cachedField) return Promise.resolve(cachedField);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(img, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const data = new Float32Array(canvas.width * canvas.height);
        for (let i = 0; i < data.length; i++) {
          data[i] = pixels[i * 4] / 255;
        }
        cachedField = { width: canvas.width, height: canvas.height, data };
        resolve(cachedField);
      } catch (err) {
        loading = null;
        reject(err);
      }
    };
    img.onerror = () => {
      loading = null;
      reject(new Error("moon height map failed to load"));
    };
    img.src = "/images/lamp-designer/moon-height.jpg";
  });
  return loading;
}
