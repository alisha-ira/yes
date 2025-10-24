export interface PlatformDimensions {
  width: number;
  height: number;
  name: string;
}

export const platformFormats: Record<string, PlatformDimensions> = {
  instagram_square: { width: 1080, height: 1080, name: 'Instagram Square' },
  instagram_portrait: { width: 1080, height: 1350, name: 'Instagram Portrait' },
  twitter_post: { width: 1200, height: 675, name: 'Twitter Post' },
  linkedin_post: { width: 1200, height: 627, name: 'LinkedIn Post' }
};

export async function resizeImageForPlatforms(file: File): Promise<Record<string, string>> {
  const img = await loadImage(file);
  const resizedImages: Record<string, string> = {};

  for (const [key, dimensions] of Object.entries(platformFormats)) {
    const resizedUrl = await resizeImage(img, dimensions.width, dimensions.height);
    resizedImages[key] = resizedUrl;
  }

  return resizedImages;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeImage(img: HTMLImageElement, targetWidth: number, targetHeight: number): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const imgAspect = img.width / img.height;
    const targetAspect = targetWidth / targetHeight;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = img.width;
    let sourceHeight = img.height;

    if (imgAspect > targetAspect) {
      sourceWidth = img.height * targetAspect;
      sourceX = (img.width - sourceWidth) / 2;
    } else {
      sourceHeight = img.width / targetAspect;
      sourceY = (img.height - sourceHeight) / 2;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    resolve(canvas.toDataURL('image/jpeg', 0.9));
  });
}

export function getResizedImageForPlatform(
  resizedImages: Record<string, string>,
  platform: 'instagram' | 'twitter' | 'linkedin'
): string {
  switch (platform) {
    case 'instagram':
      return resizedImages.instagram_portrait || resizedImages.instagram_square || '';
    case 'twitter':
      return resizedImages.twitter_post || '';
    case 'linkedin':
      return resizedImages.linkedin_post || '';
    default:
      return '';
  }
}
