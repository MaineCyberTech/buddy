export interface PhotoEntry {
  id: string;
  timestamp: number;
  speciesName: string;
  nickname: string;
  stage: string;
  rarity: string;
  isShiny: boolean;
  hat: string;
  location?: string;
}

export function initPhotoAlbum(): PhotoEntry[] {
  return [];
}

export function addPhoto(album: PhotoEntry[], photo: PhotoEntry): PhotoEntry[] {
  return [photo, ...album].slice(0, 50);
}
