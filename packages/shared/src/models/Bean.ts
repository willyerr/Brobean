
export interface Bean {
  id?: number;

  // Informasi dasar
  name: string;
  roastery: string;

  // Asal kopi
  originCountry?: string;
  originRegion?: string;
  originFarm?: string;

  // Informasi biji kopi
  variety?: string;
  process?: string;
  roastLevel?: string;
  roastDate?: string;

  // Informasi pembelian
  bagWeightGrams?: number;
  price?: number;

  // Foto
  photoBase64?: string;

  // Catatan tambahan
  notes?: string;

  // Status arsip (NULL berarti aktif)
  archivedAt?: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}



