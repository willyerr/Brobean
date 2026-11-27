
/** @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BrewCard from './BrewCard';
import type { Bean, Brew, Preparation } from '@brobean/shared';

afterEach(() => {
  cleanup();
});

const mockBrew = {
  id: 1,
  brewedAt: '2026-11-27T06:00:00.000Z',
  rating: 4,
  note: 'Sweet and balanced',
  values: {
    grind_weight: 15,
    brew_temperature: 92,
    brew_quantity: 250,
    brew_beverage_quantity: 220,
  },
} as unknown as Brew;

const mockBean = {
  name: 'Gayo Wine',
  roastery: 'Space Roastery',
} as Bean;

const mockPreparation = {
  name: 'V60',
} as Preparation;


function renderCard(
  overrides: {
    brew?: Brew;
    bean?: Bean;
    preparation?: Preparation;
    onDelete?: (brew: Brew) => void;
  } = {}
) {
  const props = {
    brew: overrides.brew ?? mockBrew,
    bean: 'bean' in overrides ? overrides.bean : mockBean,
    preparation: 'preparation' in overrides
      ? overrides.preparation
      : mockPreparation,
    onDelete: overrides.onDelete ?? vi.fn(),
  };

  return {
    ...render(
      <MemoryRouter>
        <BrewCard {...props} />
      </MemoryRouter>
    ),
    props,
  };
}

describe('BrewCard Component', () => {
  it('menampilkan nama kopi', () => {
    renderCard();
    expect(screen.getByText('Gayo Wine')).toBeTruthy();
  });

  it('menampilkan nama roastery', () => {
    renderCard();
    expect(screen.getByText('Space Roastery')).toBeTruthy();
  });

  it('menampilkan metode brewing', () => {
    renderCard();
    expect(screen.getByText('V60')).toBeTruthy();
  });

  it('menampilkan fallback jika informasi kopi tidak tersedia', () => {
    renderCard({ bean: undefined });
    expect(screen.getByText('Coffee bean')).toBeTruthy();
    expect(screen.getByText('Bean details unavailable')).toBeTruthy();
  });

  it('menampilkan fallback jika metode brewing tidak tersedia', () => {
    renderCard({ preparation: undefined });
    expect(screen.getByText('Brewing method')).toBeTruthy();
  });

  it('menampilkan rating sesuai nilai brew', () => {
    renderCard();
    expect(
      screen.getByLabelText('Rating 4 out of 5')
    ).toBeTruthy();
    expect(screen.getByText('4/5')).toBeTruthy();
  });

  it('menampilkan tanggal brewing', () => {
    renderCard();
    expect(screen.getByText('27 Nov 2026')).toBeTruthy();
  });

  it('menampilkan ringkasan parameter brewing', () => {
    renderCard();
    expect(screen.getByText('15 g')).toBeTruthy();
    expect(screen.getByText('92 °C')).toBeTruthy();
    expect(screen.getByText('250 g')).toBeTruthy();
    expect(screen.queryByText('220 g')).toBeNull();
  });

  it('menampilkan pesan jika parameter belum dicatat', () => {
    const brew = {
      ...mockBrew,
      values: {},
    } as Brew;

    renderCard({ brew });
    expect(
      screen.getByText('No brewing parameters recorded.')
    ).toBeTruthy();
  });

  it('menampilkan catatan brew jika tersedia', () => {
    renderCard();
    expect(screen.getByText('“Sweet and balanced”')).toBeTruthy();
  });

  it('tidak menampilkan catatan jika note kosong', () => {
    const brew = {
      ...mockBrew,
      note: '',
    } as Brew;

    renderCard({ brew });
    expect(screen.queryByText('“Sweet and balanced”')).toBeNull();
  });

  it('memanggil onDelete dengan data brew yang benar', () => {
    const onDelete = vi.fn();
    renderCard({ onDelete });

    fireEvent.click(
      screen.getByRole('button', { name: 'Delete Brew Log 1' })
    );

    expect(onDelete).toHaveBeenCalledWith(mockBrew);
  });
});
