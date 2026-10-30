export interface Bean {
  id?: number;
  name: string;
  roastery: string;
  latitude?: number;  // Advanced Feature: Lokasi
  longitude?: number; // Advanced Feature: Lokasi
  photoBase64?: string; // Advanced Feature: Kamera
  origin?: string;
  process?: string;
  roastLevel?: string;
  createdAt?: Date;
}