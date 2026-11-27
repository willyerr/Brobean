
/** @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import BeanForm from './BeanForm';
import type { Bean } from '@brobean/shared';

afterEach(() => {
  cleanup();
});

const defaultProps = {
  editingBean: null as Bean | null,
  isSubmitLoading: false,
  onSave: vi.fn().mockResolvedValue(true),
  onCancelEdit: vi.fn(),
  onNotice: vi.fn(),
};

describe('BeanForm Component', () => {
  it('menampilkan judul Add a new bean', () => {
    render(<BeanForm {...defaultProps} />);

    expect(screen.getByText('Add a new bean')).toBeTruthy();
  });

  it('menampilkan field Nama kopi dan Roastery', () => {
    render(<BeanForm {...defaultProps} />);

    expect(screen.getByLabelText(/Nama kopi/)).toBeTruthy();
    expect(screen.getByLabelText(/Roastery/)).toBeTruthy();
  });

  it('menampilkan tombol Simpan ke koleksi', () => {
    render(<BeanForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Simpan ke koleksi/ })).toBeTruthy();
  });

  it('menampilkan error jika nama kopi kosong', async () => {
    render(<BeanForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Roastery/), {
      target: { value: 'Space Roastery' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Simpan ke koleksi/ }));

    expect(await screen.findByText('Nama kopi wajib diisi.')).toBeTruthy();
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('menampilkan error jika nama kopi kurang dari dua karakter', async () => {
    render(<BeanForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Nama kopi/), {
      target: { value: 'A' },
    });

    fireEvent.change(screen.getByLabelText(/Roastery/), {
      target: { value: 'Space Roastery' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Simpan ke koleksi/ }));

    expect(
      await screen.findByText('Nama kopi minimal 2 karakter.')
    ).toBeTruthy();
  });

  it('menampilkan error jika roastery kosong', async () => {
    render(<BeanForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Nama kopi/), {
      target: { value: 'Gayo Wine' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Simpan ke koleksi/ }));

    expect(await screen.findByText('Nama roastery wajib diisi.')).toBeTruthy();
  });

  it('mengirim data yang sudah di-trim saat disimpan', async () => {
    const onSave = vi.fn().mockResolvedValue(true);

    render(<BeanForm {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/Nama kopi/), {
      target: { value: '  Gayo Wine  ' },
    });

    fireEvent.change(screen.getByLabelText(/Roastery/), {
      target: { value: '  Space Roastery  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Simpan ke koleksi/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Gayo Wine',
          roastery: 'Space Roastery',
        })
      );
    });
  });

  it('mereset form setelah penyimpanan berhasil', async () => {
    const onSave = vi.fn().mockResolvedValue(true);

    render(<BeanForm {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/Nama kopi/), {
      target: { value: 'Gayo Wine' },
    });

    fireEvent.change(screen.getByLabelText(/Roastery/), {
      target: { value: 'Space Roastery' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Simpan ke koleksi/ }));

    await waitFor(() => {
      expect((screen.getByLabelText(/Nama kopi/) as HTMLInputElement).value).toBe('');
    });
  });

  it('tidak mereset form jika penyimpanan gagal', async () => {
    const onSave = vi.fn().mockResolvedValue(false);

    render(<BeanForm {...defaultProps} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/Nama kopi/), {
      target: { value: 'Gayo Wine' },
    });

    fireEvent.change(screen.getByLabelText(/Roastery/), {
      target: { value: 'Space Roastery' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Simpan ke koleksi/ }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });

    expect((screen.getByLabelText(/Nama kopi/) as HTMLInputElement).value).toBe('Gayo Wine');
  });

  it('menonaktifkan tombol simpan ketika sedang loading', () => {
    render(<BeanForm {...defaultProps} isSubmitLoading={true} />);

    expect(
      (screen.getByRole('button', { name: /Menyimpan/ }) as HTMLButtonElement).disabled
    ).toBe(true);
  });
});
