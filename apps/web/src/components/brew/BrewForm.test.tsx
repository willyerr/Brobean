
/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import BrewForm from './BrewForm';
import { brewRepository } from '../../services/brewRepository';

vi.mock('../../services/brewRepository', () => ({
  brewRepository: {
    getPreparationParameters: vi.fn(),
  },
}));

vi.mock('./BrewRating', () => ({
  default: ({ value, onChange, disabled }: any) => (
    <div>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={disabled}
          aria-label={`Rating ${rating}`}
          aria-pressed={value === rating}
          onClick={() => onChange(rating)}
        >
          {rating}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('./BrewParameterFields', () => ({
  default: ({ parameters, values, onChange, disabled }: any) => (
    <div>
      {parameters.map((parameter: any) => (
        <input
          key={parameter.parameter_key}
          aria-label={parameter.label}
          disabled={disabled}
          value={values[parameter.parameter_key] ?? ''}
          onChange={(event) =>
            onChange(parameter.parameter_key, event.target.value)
          }
        />
      ))}
    </div>
  ),
}));

const mockBeans = [
  { id: 1, name: 'Gayo Wine', roastery: 'Space Roastery' },
  {
    id: 2,
    name: 'Archived Bean',
    roastery: 'Old Roastery',
    archivedAt: '2026-01-01',
  },
] as any[];

const mockPreparations = [
  { id: 1, name: 'V60' },
  { id: 2, name: 'French Press' },
  { id: 3, name: 'Archived Method', archived_at: '2026-01-01' },
] as any[];

const mockRequiredParameter = {
  id: 1,
  parameter_key: 'grind_size',
  label: 'Grind Size',
  value_type: 'text',
  is_enabled: 1,
  is_required: 1,
};

const defaultProps = {
  beans: mockBeans,
  preparations: mockPreparations,
  onSave: vi.fn().mockResolvedValue({ id: 10 }),
  onCancel: vi.fn(),
};

function renderForm(props = {}) {
  return render(<BrewForm {...defaultProps} {...props} />);
}

async function prepareValidForm() {
  fireEvent.change(screen.getByLabelText(/Coffee bean/), {
    target: { value: '1' },
  });

  fireEvent.change(screen.getByLabelText(/Brewing method/), {
    target: { value: '1' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Rating 5' }));

  await waitFor(() => {
    expect(brewRepository.getPreparationParameters).toHaveBeenCalled();
  });
}

afterEach(() => {
  cleanup();
});

describe('BrewForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(brewRepository.getPreparationParameters).mockResolvedValue([]);
    defaultProps.onSave = vi.fn().mockResolvedValue({ id: 10 });
    defaultProps.onCancel = vi.fn();
  });

  it('menampilkan judul New Brew untuk form baru', () => {
    renderForm();

    expect(screen.getByText('New Brew.')).toBeTruthy();
  });

  it('hanya menampilkan Bean yang belum diarsipkan', () => {
    renderForm();

    expect(screen.getByText(/Gayo Wine/)).toBeTruthy();
    expect(screen.queryByText(/Archived Bean/)).toBeNull();
  });

  it('menampilkan metode seduh aktif', () => {
    renderForm();

    expect(screen.getByText('V60')).toBeTruthy();
    expect(screen.getByText('French Press')).toBeTruthy();
  });

  it('menyediakan tombol untuk membatalkan form', () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Close form' }));

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('menampilkan prompt sebelum metode seduh dipilih', () => {
    renderForm();

    expect(
      screen.getByText('Choose a brewing method to see its parameters.')
    ).toBeTruthy();
  });

  it('mengambil parameter berdasarkan metode seduh yang dipilih', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Brewing method/), {
      target: { value: '1' },
    });

    await waitFor(() => {
      expect(
        brewRepository.getPreparationParameters
      ).toHaveBeenCalledWith(1);
    });
  });

  it('menampilkan parameter setelah berhasil dimuat', async () => {
    vi.mocked(brewRepository.getPreparationParameters).mockResolvedValue([
      mockRequiredParameter,
    ] as any);

    renderForm();

    fireEvent.change(screen.getByLabelText(/Brewing method/), {
      target: { value: '1' },
    });

    expect(await screen.findByLabelText('Grind Size')).toBeTruthy();
  });

  it('menampilkan error ketika parameter gagal dimuat', async () => {
    vi.mocked(brewRepository.getPreparationParameters).mockRejectedValue(
      new Error('Database error')
    );

    renderForm();

    fireEvent.change(screen.getByLabelText(/Brewing method/), {
      target: { value: '1' },
    });

    expect(await screen.findByRole('alert')).toBeTruthy();

    expect(
      screen.getByText(/Parameter brewing method gagal dimuat/)
    ).toBeTruthy();
  });

  it('menghapus parameter lama ketika metode seduh diganti', async () => {
    vi.mocked(brewRepository.getPreparationParameters).mockResolvedValue([
      mockRequiredParameter,
    ] as any);

    renderForm();

    fireEvent.change(screen.getByLabelText(/Brewing method/), {
      target: { value: '1' },
    });

    expect(await screen.findByLabelText('Grind Size')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Grind Size'), {
      target: { value: 'Medium' },
    });

    fireEvent.change(screen.getByLabelText(/Brewing method/), {
      target: { value: '2' },
    });

    await waitFor(() => {
      expect(
        brewRepository.getPreparationParameters
      ).toHaveBeenLastCalledWith(2);
    });
  });

  it('menampilkan error jika Bean belum dipilih', async () => {
    renderForm();

    fireEvent.submit(document.querySelector('form')!);

    expect(
      await screen.findByText(
        'Pilih coffee bean dan brewing method terlebih dahulu.'
      )
    ).toBeTruthy();

    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('menampilkan error jika rating belum dipilih', async () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Coffee bean/), {
      target: { value: '1' },
    });

    fireEvent.change(screen.getByLabelText(/Brewing method/), {
      target: { value: '1' },
    });

    fireEvent.submit(document.querySelector('form')!);

    expect(
      await screen.findByText(
        'Rating wajib dipilih sebelum menyimpan Brew Log.'
      )
    ).toBeTruthy();

    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('menampilkan error jika tanggal seduh tidak valid', async () => {
    renderForm();

    await prepareValidForm();

    fireEvent.change(screen.getByLabelText(/Brewed at/), {
      target: { value: 'invalid-date' },
    });

    fireEvent.submit(document.querySelector('form')!);

    expect(
      await screen.findByText('Tanggal dan waktu seduh tidak valid.')
    ).toBeTruthy();

    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('menampilkan error jika parameter wajib belum diisi', async () => {
    vi.mocked(brewRepository.getPreparationParameters).mockResolvedValue([
      mockRequiredParameter,
    ] as any);

    renderForm();

    fireEvent.change(screen.getByLabelText(/Coffee bean/), {
      target: { value: '1' },
    });

    fireEvent.change(screen.getByLabelText(/Brewing method/), {
      target: { value: '1' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Rating 5' }));

    expect(await screen.findByLabelText('Grind Size')).toBeTruthy();

    fireEvent.submit(document.querySelector('form')!);

    expect(
      await screen.findByText('Grind Size wajib diisi.')
    ).toBeTruthy();

    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('mengirim data Brew yang benar ketika berhasil disimpan', async () => {
    renderForm();

    await prepareValidForm();

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          beanId: 1,
          preparationId: 1,
          rating: 5,
          note: '',
          values: {},
        })
      );
    });
  });

  it('menghapus spasi berlebih pada tasting notes sebelum disimpan', async () => {
    renderForm();

    await prepareValidForm();

    fireEvent.change(screen.getByLabelText('Tasting notes / impression'), {
      target: { value: '  Sweet and fruity  ' },
    });

    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          note: 'Sweet and fruity',
        })
      );
    });
  });

  it('menampilkan error jika onSave mengembalikan null', async () => {
    const onSave = vi.fn().mockResolvedValue(null);

    renderForm({ onSave });

    await prepareValidForm();

    fireEvent.submit(document.querySelector('form')!);

    expect(
      await screen.findByText(/Brew Log belum berhasil disimpan/)
    ).toBeTruthy();
  });

  it('menampilkan error jika onSave melempar exception', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Save failed'));

    renderForm({ onSave });

    await prepareValidForm();

    fireEvent.submit(document.querySelector('form')!);

    expect(
      await screen.findByText(/Brew Log belum berhasil disimpan/)
    ).toBeTruthy();
  });

  it('menampilkan judul Edit Brew ketika mengedit data', () => {
    renderForm({
      initialBrew: {
        id: 10,
        beanId: 1,
        preparationId: 1,
        rating: 4,
        brewedAt: '2026-11-27T08:00:00.000Z',
        note: 'Floral',
        values: {},
      } as any,
    });

    expect(screen.getByText('Edit Brew.')).toBeTruthy();
  });
});
