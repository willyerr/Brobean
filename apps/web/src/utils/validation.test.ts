import { describe, expect, it } from 'vitest';
import { validateBeanName, validateRoastery } from './validation';

describe('Validasi form Bean', () => {
  describe('validateBeanName', () => {
    it('menolak nama kosong', () => {
      expect(validateBeanName('')).toBe('Nama kopi wajib diisi.');
    });

    it('menolak nama yang hanya berisi spasi', () => {
      expect(validateBeanName('   ')).toBe('Nama kopi wajib diisi.');
    });

    it('menolak nama kurang dari 2 karakter setelah trim', () => {
      expect(validateBeanName(' A ')).toBe('Nama kopi minimal 2 karakter.');
    });

    it('menerima nama dengan minimal 2 karakter', () => {
      expect(validateBeanName(' Gayo ')).toBe(true);
    });
  });

  describe('validateRoastery', () => {
    it('menolak roastery kosong', () => {
      expect(validateRoastery('')).toBe('Nama roastery wajib diisi.');
    });

    it('menolak roastery yang hanya berisi spasi', () => {
      expect(validateRoastery('   ')).toBe('Nama roastery wajib diisi.');
    });

    it('menerima nama roastery yang terisi', () => {
      expect(validateRoastery(' Space Roastery ')).toBe(true);
    });
  });
});
