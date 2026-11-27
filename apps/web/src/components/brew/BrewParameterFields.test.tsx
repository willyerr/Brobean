
/** @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import BrewParameterFields from './BrewParameterFields';
import type { PreparationParameter } from '@brobean/shared';

afterEach(() => {
  cleanup();
});

function createParameter(overrides: Record<string, unknown> = {}) {
  return {
    parameter_key: 'test_parameter',
    label: 'Test Parameter',
    value_type: 'text',
    unit: null,
    is_required: 0,
    is_enabled: 1,
    preparation_phase: 'before',
    ...overrides,
  } as unknown as PreparationParameter;
}

describe('BrewParameterFields Component', () => {
  it('menampilkan pesan jika tidak ada parameter', () => {
    render(
      <BrewParameterFields
        parameters={[]}
        values={{}}
        onChange={vi.fn()}
      />
    );

    expect(
      screen.getByText('No parameters are enabled for this brewing method.')
    ).toBeTruthy();
  });

  it('tidak menampilkan parameter yang dinonaktifkan', () => {
    const parameters = [
      createParameter({ is_enabled: 0 }),
    ];

    render(
      <BrewParameterFields
        parameters={parameters}
        values={{}}
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByLabelText('Test Parameter')).toBeNull();
    expect(
      screen.getByText('No parameters are enabled for this brewing method.')
    ).toBeTruthy();
  });

  it('menampilkan parameter yang aktif', () => {
    render(
      <BrewParameterFields
        parameters={[createParameter()]}
        values={{}}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Test Parameter')).toBeTruthy();
  });

  it('mengelompokkan parameter berdasarkan fase brewing', () => {
    const parameters = [
      createParameter({
        parameter_key: 'grind',
        label: 'Grind Size',
        preparation_phase: 'before',
      }),
      createParameter({
        parameter_key: 'temperature',
        label: 'Temperature',
        preparation_phase: 'during',
      }),
      createParameter({
        parameter_key: 'taste',
        label: 'Taste Notes',
        preparation_phase: 'after',
      }),
    ];

    render(
      <BrewParameterFields
        parameters={parameters}
        values={{}}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('Before Brewing')).toBeTruthy();
    expect(screen.getByText('During Brewing')).toBeTruthy();
    expect(screen.getByText('After Brewing')).toBeTruthy();
  });

  it('mengirim nilai checkbox boolean ketika dicentang', () => {
    const onChange = vi.fn();

    render(
      <BrewParameterFields
        parameters={[
          createParameter({
            parameter_key: 'bloom',
            label: 'Bloom completed',
            value_type: 'boolean',
          }),
        ]}
        values={{}}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Bloom completed'));

    expect(onChange).toHaveBeenCalledWith('bloom', true);
  });

  it('menampilkan nilai checkbox yang sudah tersimpan', () => {
    render(
      <BrewParameterFields
        parameters={[
          createParameter({
            label: 'Bloom completed',
            value_type: 'boolean',
          }),
        ]}
        values={{ test_parameter: true }}
        onChange={vi.fn()}
      />
    );

    expect(
      (screen.getByLabelText('Bloom completed') as HTMLInputElement).checked
    ).toBe(true);
  });

  it('mengubah text_list menjadi array dan menghapus baris kosong', () => {
    const onChange = vi.fn();

    render(
      <BrewParameterFields
        parameters={[
          createParameter({
            parameter_key: 'notes',
            label: 'Flavor Notes',
            value_type: 'text_list',
          }),
        ]}
        values={{}}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Flavor Notes'), {
      target: { value: 'Chocolate\n\nCaramel\n Citrus ' },
    });

    expect(onChange).toHaveBeenCalledWith(
      'notes',
      ['Chocolate', 'Caramel', 'Citrus']
    );
  });

  it('mengubah input number menjadi nilai numerik', () => {
    const onChange = vi.fn();

    render(
      <BrewParameterFields
        parameters={[
          createParameter({
            parameter_key: 'weight',
            label: 'Coffee Weight',
            value_type: 'number',
            unit: 'gram',
          }),
        ]}
        values={{}}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Coffee Weight'), {
      target: { value: '15' },
    });

    expect(onChange).toHaveBeenCalledWith('weight', 15);
  });

  it('mengubah input duration menjadi nilai numerik', () => {
    const onChange = vi.fn();

    render(
      <BrewParameterFields
        parameters={[
          createParameter({
            parameter_key: 'time',
            label: 'Brew Time',
            value_type: 'duration',
          }),
        ]}
        values={{}}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Brew Time'), {
      target: { value: '120' },
    });

    expect(onChange).toHaveBeenCalledWith('time', 120);
  });

  it('mengirim undefined ketika input number dikosongkan', () => {
    const onChange = vi.fn();

    render(
      <BrewParameterFields
        parameters={[
          createParameter({
            parameter_key: 'weight',
            label: 'Coffee Weight',
            value_type: 'number',
          }),
        ]}
        values={{ weight: 15 }}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Coffee Weight'), {
      target: { value: '' },
    });

    expect(onChange).toHaveBeenCalledWith('weight', undefined);
  });

  it('mengirim nilai teks sebagai string', () => {
    const onChange = vi.fn();

    render(
      <BrewParameterFields
        parameters={[createParameter()]}
        values={{}}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Test Parameter'), {
      target: { value: 'Medium grind' },
    });

    expect(onChange).toHaveBeenCalledWith(
      'test_parameter',
      'Medium grind'
    );
  });

  it('menonaktifkan input ketika disabled bernilai true', () => {
    render(
      <BrewParameterFields
        parameters={[createParameter()]}
        values={{}}
        onChange={vi.fn()}
        disabled={true}
      />
    );

    expect(
      (screen.getByLabelText('Test Parameter') as HTMLInputElement).disabled
    ).toBe(true);
  });
});
