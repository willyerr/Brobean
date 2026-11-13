/**
 * Aturan validasi input untuk form Bean.
 * Fungsi mengembalikan true jika valid, atau pesan error jika tidak valid.
 */
export const validateBeanName = (value: string): true | string => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return 'Nama kopi wajib diisi.';
  }

  if (normalizedValue.length < 2) {
    return 'Nama kopi minimal 2 karakter.';
  }

  return true;
};

export const validateRoastery = (value: string): true | string => {
  if (!value.trim()) {
    return 'Nama roastery wajib diisi.';
  }

  return true;
};
