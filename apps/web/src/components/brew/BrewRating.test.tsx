
/** @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BrewRating from './BrewRating';

afterEach(() => {
  cleanup();
});

describe('BrewRating Component', () => {
  it('menampilkan grup rating dengan label yang benar', () => {
    render(<BrewRating value={0} onChange={() => {}} />);

    expect(
      screen.getByRole('radiogroup', { name: 'Overall brew rating' })
    ).toBeTruthy();
  });

  it('menampilkan lima tombol rating', () => {
    render(<BrewRating value={0} onChange={() => {}} />);

    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('menampilkan status rating yang dipilih', () => {
    render(<BrewRating value={3} onChange={() => {}} />);

    expect(
      screen.getByRole('radio', { name: '3 out of 5 stars' })
        .getAttribute('aria-checked')
    ).toBe('true');

    expect(
      screen.getByRole('radio', { name: '2 out of 5 stars' })
        .getAttribute('aria-checked')
    ).toBe('false');
  });

  it('menampilkan teks Choose a rating ketika nilai nol', () => {
    render(<BrewRating value={0} onChange={() => {}} />);

    expect(screen.getByText('Choose a rating')).toBeTruthy();
  });

  it('menampilkan nilai rating dalam format x/5', () => {
    render(<BrewRating value={4} onChange={() => {}} />);

    expect(screen.getByText('4/5')).toBeTruthy();
  });

  it('memanggil onChange dengan nilai rating yang diklik', () => {
    const onChange = vi.fn();

    render(<BrewRating value={0} onChange={onChange} />);

    fireEvent.click(
      screen.getByRole('radio', { name: '5 out of 5 stars' })
    );

    expect(onChange).toHaveBeenCalledWith(5);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('menonaktifkan semua tombol ketika disabled bernilai true', () => {
    render(<BrewRating value={3} onChange={() => {}} disabled />);

    screen.getAllByRole('radio').forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('tidak memanggil onChange ketika tombol dinonaktifkan', () => {
    const onChange = vi.fn();

    render(<BrewRating value={2} onChange={onChange} disabled />);

    fireEvent.click(
      screen.getByRole('radio', { name: '4 out of 5 stars' })
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});
