
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLocalDatabase } from './localDatabase';
import { localBeanRepository, localPreparationRepository, localBrewRepository } from './localRepositories';


vi.mock('./localDatabase', () => ({
  getLocalDatabase: vi.fn(),
}));

const mockBeanRow = {
  id: 1,
  name: 'Gayo Wine',
  roastery: 'Space Roastery',
  origin_country: 'Indonesia',
  origin_region: 'Aceh',
  origin_farm: null,
  variety: 'Arabica',
  process: 'Wine',
  roast_level: 'Medium',
  roast_date: null,
  bag_weight_grams: 200,
  price: 150000,
  photo_base64: null,
  notes: 'Sweet coffee',
  archived_at: null,
  created_at: '2026-11-27 06:00:00',
  updated_at: '2026-11-27 06:00:00',
};

function createMockDatabase() {
  return {
    query: vi.fn(),
    run: vi.fn(),
    execute: vi.fn(),
  };
}

describe('localBeanRepository', () => {
  let db: ReturnType<typeof createMockDatabase>;

  beforeEach(() => {
    vi.clearAllMocks();

    db = createMockDatabase();

    vi.mocked(getLocalDatabase).mockResolvedValue(
      db as unknown as Awaited<ReturnType<typeof getLocalDatabase>>
    );
  });

  

it('menolak nama kopi kosong saat membuat Bean', async () => {
  await expect(
    localBeanRepository.createBean({
      name: '   ',
      roastery: 'Test Roastery',
    })
  ).rejects.toThrow('Nama kopi dan roastery wajib diisi.');
});

it('menolak roastery kosong saat membuat Bean', async () => {
  await expect(
    localBeanRepository.createBean({
      name: 'Test Coffee',
      roastery: '   ',
    })
  ).rejects.toThrow('Nama kopi dan roastery wajib diisi.');
});

it('menolak berat kopi nol saat membuat Bean', async () => {
  await expect(
    localBeanRepository.createBean({
      name: 'Test Coffee',
      roastery: 'Test Roastery',
      bagWeightGrams: 0,
    })
  ).rejects.toThrow('Berat kopi harus berupa angka lebih dari 0.');
});

it('menolak harga negatif saat membuat Bean', async () => {
  await expect(
    localBeanRepository.createBean({
      name: 'Test Coffee',
      roastery: 'Test Roastery',
      price: -1,
    })
  ).rejects.toThrow('Harga kopi tidak boleh negatif.');
});

it('menolak nama kosong saat memperbarui Bean', async () => {
  await expect(
    localBeanRepository.updateBean(1, {
      name: '   ',
    })
  ).rejects.toThrow('Nama kopi tidak boleh kosong.');
});

it('menolak roastery kosong saat memperbarui Bean', async () => {
  await expect(
    localBeanRepository.updateBean(1, {
      roastery: '   ',
    })
  ).rejects.toThrow('Roastery tidak boleh kosong.');
});


it('mengubah nama kopi menjadi trimmed saat membuat Bean', async () => {
  const db = await getLocalDatabase();

  vi.mocked(getLocalDatabase).mockResolvedValue(db);

  (db.run as ReturnType<typeof vi.fn>).mockResolvedValue({
    changes: { lastId: 1 },
  });

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockBeanRow],
  });

  await localBeanRepository.createBean({
    name: '  Test Coffee  ',
    roastery: '  Test Roastery  ',
  });

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO beans'),
    expect.arrayContaining(['Test Coffee', 'Test Roastery'])
  );
});

it('mengubah field opsional kosong menjadi null saat membuat Bean', async () => {
  const db = await getLocalDatabase();

  (db.run as ReturnType<typeof vi.fn>).mockResolvedValue({
    changes: { lastId: 1 },
  });

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockBeanRow],
  });

  await localBeanRepository.createBean({
    name: 'Test Coffee',
    roastery: 'Test Roastery',
    originCountry: '',
    notes: '',
  });

  const params = (db.run as ReturnType<typeof vi.fn>).mock.calls[0][1];

  expect(params).toContain(null);
});

it('menolak berat kopi negatif saat memperbarui Bean', async () => {
  await expect(
    localBeanRepository.updateBean(1, {
      bagWeightGrams: -100,
    })
  ).rejects.toThrow('Berat kopi harus berupa angka lebih dari 0.');
});

it('menolak harga negatif saat memperbarui Bean', async () => {
  await expect(
    localBeanRepository.updateBean(1, {
      price: -100,
    })
  ).rejects.toThrow('Harga kopi tidak boleh negatif.');
});

it('tidak menjalankan UPDATE ketika tidak ada field yang diubah', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockBeanRow],
  });

  await localBeanRepository.updateBean(1, {});

  expect(db.run).not.toHaveBeenCalled();
});

it('mengubah nama dan roastery menjadi trimmed saat update Bean', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockBeanRow],
  });

  await localBeanRepository.updateBean(1, {
    name: '  New Coffee  ',
    roastery: '  New Roastery  ',
  });

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('name = ?'),
    expect.arrayContaining(['New Coffee', 'New Roastery'])
  );
});

  it('mengambil seluruh data kopi', async () => {
    db.query.mockResolvedValue({ values: [mockBeanRow] });

    const result = await localBeanRepository.getBeans();

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM beans ORDER BY id DESC'
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Gayo Wine');
  });

  it('mengembalikan array kosong jika database kosong', async () => {
    db.query.mockResolvedValue({ values: undefined });

    const result = await localBeanRepository.getBeans();

    expect(result).toEqual([]);
  });

  it('mengambil kopi berdasarkan ID', async () => {
    db.query.mockResolvedValue({ values: [mockBeanRow] });

    const result = await localBeanRepository.getBeanById(1);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT * FROM beans WHERE id = ?',
      [1]
    );
    expect(result.name).toBe('Gayo Wine');
    expect(result.roastery).toBe('Space Roastery');
  });

  it('menghasilkan error jika ID kopi tidak ditemukan', async () => {
    db.query.mockResolvedValue({ values: [] });

    await expect(
      localBeanRepository.getBeanById(99)
    ).rejects.toThrow('Data kopi tidak ditemukan.');
  });

  it('mengubah nilai database menjadi tipe data Bean', async () => {
    db.query.mockResolvedValue({ values: [mockBeanRow] });

    const result = await localBeanRepository.getBeanById(1);

    expect(result.id).toBe(1);
    expect(result.bagWeightGrams).toBe(200);
    expect(result.price).toBe(150000);
    expect(result.originCountry).toBe('Indonesia');
  });

  it('membuat kopi dengan data yang valid', async () => {
    db.run.mockResolvedValue({ changes: { lastId: 1 } });
    db.query.mockResolvedValue({ values: [mockBeanRow] });

    const result = await localBeanRepository.createBean({
      name: 'Gayo Wine',
      roastery: 'Space Roastery',
    });

    expect(db.run).toHaveBeenCalled();
    expect(result.name).toBe('Gayo Wine');
  });

  it('menghapus spasi berlebih pada nama dan roastery', async () => {
    db.run.mockResolvedValue({ changes: { lastId: 1 } });
    db.query.mockResolvedValue({ values: [mockBeanRow] });

    await localBeanRepository.createBean({
      name: '  Gayo Wine  ',
      roastery: '  Space Roastery  ',
    });

    const insertedValues = db.run.mock.calls[0][1] as unknown[];

    expect(insertedValues[0]).toBe('Gayo Wine');
    expect(insertedValues[1]).toBe('Space Roastery');
  });

  it('menolak pembuatan kopi tanpa nama', async () => {
    await expect(
      localBeanRepository.createBean({
        name: '',
        roastery: 'Space Roastery',
      })
    ).rejects.toThrow('Nama kopi dan roastery wajib diisi.');
  });

  it('menolak pembuatan kopi tanpa roastery', async () => {
    await expect(
      localBeanRepository.createBean({
        name: 'Gayo Wine',
        roastery: '',
      })
    ).rejects.toThrow('Nama kopi dan roastery wajib diisi.');
  });

  it('menolak berat kopi nol atau negatif', async () => {
    await expect(
      localBeanRepository.createBean({
        name: 'Gayo Wine',
        roastery: 'Space Roastery',
        bagWeightGrams: 0,
      })
    ).rejects.toThrow('Berat kopi harus berupa angka lebih dari 0.');
  });

  it('menolak harga negatif', async () => {
    await expect(
      localBeanRepository.createBean({
        name: 'Gayo Wine',
        roastery: 'Space Roastery',
        price: -1000,
      })
    ).rejects.toThrow('Harga kopi tidak boleh negatif.');
  });

  it('memperbarui nama kopi berdasarkan ID', async () => {
    db.query.mockResolvedValue({ values: [mockBeanRow] });

    await localBeanRepository.updateBean(1, {
      name: 'Updated Gayo',
    });

    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE beans SET name = ?'),
      ['Updated Gayo', 1]
    );
  });

  it('menolak nama kosong ketika memperbarui kopi', async () => {
    await expect(
      localBeanRepository.updateBean(1, { name: '   ' })
    ).rejects.toThrow('Nama kopi tidak boleh kosong.');
  });

  it('mengarsipkan kopi berdasarkan ID', async () => {
    db.run.mockResolvedValue({});
    db.query.mockResolvedValue({
      values: [{ ...mockBeanRow, archived_at: '2026-11-27' }],
    });

    const result = await localBeanRepository.archiveBean(1);

    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining('archived_at = CURRENT_TIMESTAMP'),
      [1]
    );
    expect(result.archivedAt).toBe('2026-11-27');
  });

  it('berhasil menghapus Bean berdasarkan ID', async () => {
  db.run.mockResolvedValue({ changes: { changes: 1 } });

  await expect(
    localBeanRepository.deleteBean(1)
  ).resolves.toBeUndefined();

  expect(db.run).toHaveBeenCalledWith(
    'DELETE FROM beans WHERE id = ?',
    [1]
  );
});

  it('memulihkan kopi yang telah diarsipkan', async () => {
    db.run.mockResolvedValue({});
    db.query.mockResolvedValue({ values: [mockBeanRow] });

    const result = await localBeanRepository.restoreBean(1);

    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining('archived_at = NULL'),
      [1]
    );
    expect(result.archivedAt).toBeUndefined();
  });

  it('menghasilkan pesan khusus jika kopi gagal dihapus', async () => {
    db.run.mockRejectedValue(new Error('Foreign key constraint failed'));

    await expect(
      localBeanRepository.deleteBean(1)
    ).rejects.toThrow(
      'Kopi tidak dapat dihapus karena masih digunakan pada Brew Log.'
    );
  });
});


const mockPreparationRow = {
  id: 1,
  name: 'V60',
  slug: 'v60',
  note: null,
  style_type: 'V60',
  is_builtin: 1,
  use_custom_parameters: 0,
  archived_at: null,
  created_at: '2026-11-27',
  updated_at: '2026-11-27',
};

const mockCustomPreparationRow = {
  ...mockPreparationRow,
  id: 11,
  name: 'My Pour Over',
  slug: 'my-pour-over',
  style_type: 'CUSTOM_PREPARATION',
  is_builtin: 0,
};

const mockParameterRow = {
  parameter_key: 'grind_weight',
  label: 'Grind weight',
  value_type: 'number',
  unit: 'g',
  phase: 'before',
  default_enabled: 1,
  sort_order: 2,
  is_enabled: 1,
  preparation_phase: 'before',
  preparation_sort_order: 2,
  is_required: 0,
};


const mockBrewRow = {
  id: 101,
  bean_id: 1,
  preparation_id: 1,
  rating: 5,
  brewed_at: '2026-11-27T06:00:00.000Z',
  note: 'Sweet and fruity',
  created_at: '2026-11-27',
  updated_at: '2026-11-27',
};

const mockBrewParameterRow = {
  parameter_key: 'grind_weight',
  value_json: '15',
};

describe('localBrewRepository', () => {
  let brewDb: ReturnType<typeof createMockDatabase>;

  beforeEach(() => {
    vi.clearAllMocks();

    brewDb = createMockDatabase();

    vi.mocked(getLocalDatabase).mockResolvedValue(
      brewDb as unknown as Awaited<ReturnType<typeof getLocalDatabase>>
    );   
  });

it.each([
  ['teks', 'invalid'],
  ['array', ['15', '20']],
])(
  'menolak input parameter berupa %s saat membuat Brew Log',
  async (_description, invalidValues) => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) {
        return { values: [{ id: 1 }] };
      }

      if (sql.includes('FROM preparations')) {
        return { values: [mockPreparationRow] };
      }

      return { values: [] };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: invalidValues as never,
      })
    ).rejects.toThrow('Nilai parameter harus berupa object.');

    expect(brewDb.execute).not.toHaveBeenCalledWith(
      'BEGIN TRANSACTION'
    );
  }
);

it.each([
  {
    description: 'boolean false',
    parameter: {
      ...mockParameterRow,
      parameter_key: 'bloom',
      label: 'Bloom',
      value_type: 'boolean',
    },
    value: false,
    expectedJson: 'false',
  },
  {
    description: 'teks',
    parameter: {
      ...mockParameterRow,
      parameter_key: 'water_type',
      label: 'Water type',
      value_type: 'text',
    },
    value: 'Mineral Water',
    expectedJson: '"Mineral Water"',
  },
  {
    description: 'daftar teks',
    parameter: {
      ...mockParameterRow,
      parameter_key: 'flavor_notes',
      label: 'Flavor notes',
      value_type: 'text_list',
    },
    value: ['Sweet', 'Floral'],
    expectedJson: '["Sweet","Floral"]',
  },
])(
  'menyimpan parameter valid dengan tipe $description',
  async ({ parameter, value, expectedJson }) => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) {
        return { values: [{ id: 1 }] };
      }

      if (sql.includes('FROM preparations')) {
        return { values: [mockPreparationRow] };
      }

      if (sql.includes('FROM preparation_parameters pp')) {
        return { values: [parameter] };
      }

      if (sql.includes('FROM brew_parameter_values')) {
        return {
          values: [{
            parameter_key: parameter.parameter_key,
            value_json: expectedJson,
          }],
        };
      }

      return { values: [mockBrewRow] };
    });

    brewDb.run.mockResolvedValue({
      changes: { lastId: 101 },
    });

    await localBrewRepository.createBrew({
      beanId: 1,
      preparationId: 1,
      rating: 5,
      brewedAt: '2026-11-27',
      values: {
        [parameter.parameter_key]: value,
      },
    });

    expect(brewDb.run).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO brew_parameter_values'),
      [101, parameter.parameter_key, expectedJson]
    );

    expect(brewDb.execute).toHaveBeenCalledWith('COMMIT');
  }
);

it('tidak menyimpan parameter opsional yang tidak diisi', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM beans')) {
      return { values: [{ id: 1 }] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    if (sql.includes('FROM preparation_parameters pp')) {
      return {
        values: [{
          ...mockParameterRow,
          is_required: 0,
        }],
      };
    }

    return { values: [mockBrewRow] };
  });

  brewDb.run.mockResolvedValue({
    changes: { lastId: 101 },
  });

  await localBrewRepository.createBrew({
    beanId: 1,
    preparationId: 1,
    rating: 5,
    brewedAt: '2026-11-27',
    values: {},
  });

  expect(brewDb.run).not.toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO brew_parameter_values'),
    expect.anything()
  );

  expect(brewDb.execute).toHaveBeenCalledWith('COMMIT');
});

it.each([
  {
    description: 'teks yang bukan string',
    valueType: 'text',
    submittedValue: 123,
    expectedError: 'harus berupa teks.',
  },
  {
    description: 'daftar teks yang berisi angka',
    valueType: 'text_list',
    submittedValue: ['coffee', 123],
    expectedError: 'harus berupa daftar teks.',
  },
  {
    description: 'angka NaN',
    valueType: 'number',
    submittedValue: NaN,
    expectedError: 'harus berupa angka >= 0.',
  },
  {
    description: 'angka Infinity',
    valueType: 'number',
    submittedValue: Infinity,
    expectedError: 'harus berupa angka >= 0.',
  },
])('menolak $description saat update Brew Log', async ({
  valueType,
  submittedValue,
  expectedError,
}) => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    if (sql.includes('FROM preparation_parameters pp')) {
      return {
        values: [{
          ...mockParameterRow,
          value_type: valueType,
          is_enabled: 1,
          is_required: 0,
        }],
      };
    }

    return { values: [mockBrewRow] };
  });

  await expect(
    localBrewRepository.updateBrew(101, {
      values: {
  grind_weight: submittedValue as never,
},
    })
  ).rejects.toThrow(expectedError);

  expect(brewDb.execute).not.toHaveBeenCalledWith('BEGIN TRANSACTION');
  expect(brewDb.run).not.toHaveBeenCalled();
});


it('mengizinkan update Brew Log dengan metode seduh lama yang sudah diarsipkan', async () => {
  const archivedPreparation = {
    ...mockPreparationRow,
    archived_at: '2026-11-26',
  };

  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [archivedPreparation] };
    }

    return { values: [mockBrewRow] };
  });

  const result = await localBrewRepository.updateBrew(101, {
    note: 'Updated historical Brew Log',
  });

  expect(brewDb.run).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE brews SET'),
    [1, 1, 5, mockBrewRow.brewed_at, 'Updated historical Brew Log', 101]
  );

  expect(brewDb.execute).toHaveBeenCalledWith('COMMIT');
  expect(result.id).toBe(101);
});


it('menolak rating nol saat memperbarui Brew Log', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    return { values: [mockBrewRow] };
  });

  await expect(
    localBrewRepository.updateBrew(101, {
      rating: 0,
    })
  ).rejects.toThrow('Rating harus berupa angka 1 sampai 5.');

  expect(brewDb.run).not.toHaveBeenCalled();
  expect(brewDb.execute).not.toHaveBeenCalledWith('BEGIN TRANSACTION');
});


it('menolak nilai boolean yang bukan bertipe boolean saat update Brew Log', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    if (sql.includes('FROM preparation_parameters pp')) {
      return {
        values: [{
          ...mockParameterRow,
          value_type: 'boolean',
          is_enabled: 1,
          is_required: 0,
        }],
      };
    }

    return { values: [mockBrewRow] };
  });

  await expect(
    localBrewRepository.updateBrew(101, {
      values: {
        grind_weight: 'true',
      },
    })
  ).rejects.toThrow('harus berupa boolean.');

  expect(brewDb.execute).not.toHaveBeenCalledWith('BEGIN TRANSACTION');
  expect(brewDb.run).not.toHaveBeenCalled();
});


it('menolak update ketika parameter wajib tidak diisi', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    if (sql.includes('FROM preparation_parameters pp')) {
      return {
        values: [{
          ...mockParameterRow,
          is_enabled: 1,
          is_required: 1,
        }],
      };
    }

    return { values: [mockBrewRow] };
  });

  await expect(
    localBrewRepository.updateBrew(101, {
      values: {
        grind_weight: '',
      },
    })
  ).rejects.toThrow('wajib diisi.');

  expect(brewDb.execute).not.toHaveBeenCalledWith('BEGIN TRANSACTION');
  expect(brewDb.run).not.toHaveBeenCalled();
});



it('memperbarui tanggal seduh Brew Log', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    return { values: [mockBrewRow] };
  });

  const newDate = '2026-11-28T08:00:00.000Z';

  await localBrewRepository.updateBrew(101, {
    brewedAt: newDate,
  });

  expect(brewDb.run).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE brews SET'),
    [1, 1, 5, newDate, mockBrewRow.note, 101]
  );
});

it('mempertahankan nilai parameter ketika hanya rating diperbarui', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    return { values: [mockBrewRow] };
  });

  const result = await localBrewRepository.updateBrew(101, {
    rating: 4,
  });

  expect(result.values.grind_weight).toBe(15);

  expect(brewDb.run).not.toHaveBeenCalledWith(
    expect.stringContaining('DELETE FROM brew_parameter_values'),
    expect.anything()
  );
});


it('mengganti metode seduh dan menyimpan parameter baru', async () => {
  const newPreparation = {
    ...mockPreparationRow,
    id: 2,
    name: 'French Press',
    slug: 'french-press',
  };

  const newParameter = {
    ...mockParameterRow,
    parameter_key: 'water_volume',
    label: 'Water volume',
    unit: 'ml',
  };

  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [newPreparation] };
    }

    if (sql.includes('FROM preparation_parameters')) {
      return { values: [newParameter] };
    }

    if (sql.includes('FROM brews')) {
      return {
        values: [{ ...mockBrewRow, preparation_id: 2 }],
      };
    }

    return { values: [mockBrewRow] };
  });

  await localBrewRepository.updateBrew(101, {
    preparationId: 2,
    values: {
      water_volume: 250,
    },
  });

  expect(brewDb.run).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE brews SET'),
    expect.arrayContaining([2])
  );

  expect(brewDb.run).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO brew_parameter_values'),
    [101, 'water_volume', '250']
  );

  expect(brewDb.execute).toHaveBeenCalledWith('COMMIT');
});

it('menghapus parameter lama ketika metode seduh diganti', async () => {
  const newPreparation = {
    ...mockPreparationRow,
    id: 2,
  };

  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [newPreparation] };
    }

    if (sql.includes('FROM preparation_parameters')) {
      return { values: [] };
    }

    if (sql.includes('FROM brews')) {
      return {
        values: [{ ...mockBrewRow, preparation_id: 2 }],
      };
    }

    return { values: [mockBrewRow] };
  });

  await localBrewRepository.updateBrew(101, {
    preparationId: 2,
    values: {},
  });

  expect(brewDb.run).toHaveBeenCalledWith(
    expect.stringContaining('DELETE FROM brew_parameter_values'),
    [101]
  );

  expect(brewDb.execute).toHaveBeenCalledWith('COMMIT');
});


it('menolak metode seduh yang tidak ditemukan saat update', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [] };
    }

    return { values: [mockBrewRow] };
  });

  await expect(
    localBrewRepository.updateBrew(101, {
      preparationId: 999,
    })
  ).rejects.toThrow();

  expect(brewDb.run).not.toHaveBeenCalled();
  expect(brewDb.execute).not.toHaveBeenCalledWith('BEGIN TRANSACTION');
});

it('tidak menghapus parameter ketika values tidak disertakan saat update', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    return { values: [mockBrewRow] };
  });

  await localBrewRepository.updateBrew(101, {
    note: 'Updated without changing parameters',
  });

  expect(brewDb.run).not.toHaveBeenCalledWith(
    expect.stringContaining('DELETE FROM brew_parameter_values'),
    [101]
  );

  expect(brewDb.run).not.toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO brew_parameter_values'),
    expect.anything()
  );
});

it('menolak parameter yang tidak aktif saat mengganti metode seduh', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return {
        values: [
          {
            ...mockPreparationRow,
            id: 2,
          },
        ],
      };
    }

    if (sql.includes('FROM preparation_parameters')) {
      return {
        values: [
          {
            ...mockParameterRow,
            is_enabled: 1,
          },
        ],
      };
    }

    return { values: [mockBrewRow] };
  });

  await expect(
    localBrewRepository.updateBrew(101, {
      preparationId: 2,
      values: {
        inactive_parameter: 10,
      },
    })
  ).rejects.toThrow(
    "Parameter 'inactive_parameter' tidak aktif untuk metode seduh ini."
  );

  expect(brewDb.run).not.toHaveBeenCalled();
});


it('menolak angka negatif saat memperbarui parameter Brew Log', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    if (sql.includes('FROM preparation_parameters')) {
      return {
        values: [
          {
            ...mockParameterRow,
            is_enabled: 1,
          },
        ],
      };
    }

    return { values: [mockBrewRow] };
  });

  await expect(
    localBrewRepository.updateBrew(101, {
      values: {
        grind_weight: -10,
      },
    })
  ).rejects.toThrow(
    "Nilai 'Grind weight' harus berupa angka >= 0."
  );

  expect(brewDb.run).not.toHaveBeenCalled();
});

it('melakukan rollback ketika update Brew Log gagal', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    return { values: [mockBrewRow] };
  });

  brewDb.run.mockRejectedValueOnce(new Error('Database update failed'));

  await expect(
    localBrewRepository.updateBrew(101, {
      note: 'Updated note',
    })
  ).rejects.toThrow('Database update failed');

  expect(brewDb.execute).toHaveBeenCalledWith('BEGIN TRANSACTION');
  expect(brewDb.execute).toHaveBeenCalledWith('ROLLBACK');
});

  it('menolak preparation baru yang sudah diarsipkan', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return {
        values: [{ ...mockPreparationRow, id: 2, archived_at: '2026-11-26' }],
      };
    }

    if (sql.includes('FROM beans')) {
      return { values: [{ id: 1 }] };
    }

    return { values: [mockBrewRow] };
  });

  await expect(
    localBrewRepository.updateBrew(101, {
      preparationId: 2,
    })
  ).rejects.toThrow();

  expect(brewDb.run).not.toHaveBeenCalled();
});

it('mempertahankan parameter historis saat preparation tidak berubah', async () => {
  brewDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM brew_parameter_values')) {
      return { values: [mockBrewParameterRow] };
    }

    if (sql.includes('FROM preparations')) {
      return { values: [mockPreparationRow] };
    }

    return { values: [mockBrewRow] };
  });

  await localBrewRepository.updateBrew(101, {
    note: 'Updated note',
  });

  expect(brewDb.run).not.toHaveBeenCalledWith(
    expect.stringContaining('DELETE FROM brew_parameter_values'),
    expect.anything()
  );
});


  it('memperbarui rating Brew Log', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM brew_parameter_values')) {
        return { values: [mockBrewParameterRow] };
      }
      return { values: [mockBrewRow] };
    });

    const result = await localBrewRepository.updateBrew(101, {
      rating: 4,
    });

    expect(brewDb.run).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE brews SET'),
      [1, 1, 4, mockBrewRow.brewed_at, mockBrewRow.note, 101]
    );
    expect(brewDb.execute).toHaveBeenCalledWith('COMMIT');
    expect(result.id).toBe(101);
  });

  it('memperbarui catatan Brew Log', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM brew_parameter_values')) {
        return { values: [mockBrewParameterRow] };
      }
      return { values: [mockBrewRow] };
    });

    await localBrewRepository.updateBrew(101, {
      note: 'More sweetness',
    });

    expect(brewDb.run).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE brews SET'),
      [1, 1, 5, mockBrewRow.brewed_at, 'More sweetness', 101]
    );
  });

  it('menolak rating yang tidak valid saat memperbarui Brew Log', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM brew_parameter_values')) {
        return { values: [mockBrewParameterRow] };
      }
      return { values: [mockBrewRow] };
    });

    await expect(
      localBrewRepository.updateBrew(101, {
        rating: 6,
      })
    ).rejects.toThrow('Rating harus berupa angka 1 sampai 5.');

    expect(brewDb.run).not.toHaveBeenCalled();
  });

  it('menolak penggantian bean jika bean tidak ditemukan', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM brew_parameter_values')) {
        return { values: [mockBrewParameterRow] };
      }
      if (sql.includes('FROM beans')) return { values: [] };
      return { values: [mockBrewRow] };
    });

    await expect(
      localBrewRepository.updateBrew(101, {
        beanId: 99,
      })
    ).rejects.toThrow('Bean yang dipilih tidak ditemukan.');
  });

  it('menghapus Brew Log berdasarkan ID', async () => {
    brewDb.run.mockResolvedValue({ changes: { changes: 1 } });

    await localBrewRepository.deleteBrew(101);

    expect(brewDb.run).toHaveBeenCalledWith(
      'DELETE FROM brews WHERE id = ?',
      [101]
    );
  });

it('meneruskan error database ketika gagal menghapus Brew Log', async () => {
  brewDb.run.mockRejectedValue(
    new Error('Database delete failed')
  );

  await expect(
    localBrewRepository.deleteBrew(101)
  ).rejects.toThrow('Database delete failed');

  expect(brewDb.run).toHaveBeenCalledWith(
    'DELETE FROM brews WHERE id = ?',
    [101]
  );
});

  it('membuat Brew Log dengan data valid dan menyimpan parameter', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      if (sql.includes('FROM preparations')) return { values: [mockPreparationRow] };
      if (sql.includes('FROM preparation_parameters pp')) return { values: [mockParameterRow] };
      if (sql.includes('FROM brews')) return { values: [mockBrewRow] };
      if (sql.includes('FROM brew_parameter_values')) return { values: [mockBrewParameterRow] };
      return { values: [] };
    });

    brewDb.run.mockResolvedValue({ changes: { lastId: 101 } });

    const result = await localBrewRepository.createBrew({
      beanId: 1,
      preparationId: 1,
      rating: 5,
      brewedAt: '2026-11-27T06:00:00.000Z',
      note: 'Sweet and fruity',
      values: { grind_weight: 15 },
    });

    expect(brewDb.execute).toHaveBeenCalledWith('BEGIN TRANSACTION');
    expect(brewDb.run).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO brews'),
      [1, 1, 5, '2026-11-27T06:00:00.000Z', 'Sweet and fruity']
    );
    expect(brewDb.run).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO brew_parameter_values'),
      [101, 'grind_weight', '15']
    );
    expect(brewDb.execute).toHaveBeenCalledWith('COMMIT');
    expect(result.id).toBe(101);
    expect(result.values.grind_weight).toBe(15);
  });

  it('melakukan rollback jika penyimpanan Brew Log gagal', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      if (sql.includes('FROM preparations')) return { values: [mockPreparationRow] };
      if (sql.includes('FROM preparation_parameters pp')) return { values: [mockParameterRow] };
      return { values: [] };
    });

    brewDb.run.mockRejectedValue(new Error('Database error'));

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: { grind_weight: 15 },
      })
    ).rejects.toThrow('Database error');

    expect(brewDb.execute).toHaveBeenCalledWith('BEGIN TRANSACTION');
    expect(brewDb.execute).toHaveBeenCalledWith('ROLLBACK');
    expect(brewDb.execute).not.toHaveBeenCalledWith('COMMIT');
  });

  it('menolak nilai parameter boolean yang bukan boolean', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      if (sql.includes('FROM preparations')) return { values: [mockPreparationRow] };
      return {
        values: [{
          ...mockParameterRow,
          parameter_key: 'bloom',
          label: 'Bloom',
          value_type: 'boolean',
        }],
      };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: { bloom: 'yes' },
      })
    ).rejects.toThrow("Nilai 'Bloom' harus berupa boolean.");
  });

  it('menolak nilai parameter teks yang bukan string', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      if (sql.includes('FROM preparations')) return { values: [mockPreparationRow] };
      return {
        values: [{
          ...mockParameterRow,
          parameter_key: 'water_type',
          label: 'Water type',
          value_type: 'text',
        }],
      };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: { water_type: 123 },
      })
    ).rejects.toThrow("Nilai 'Water type' harus berupa teks.");
  });

  it('menolak daftar teks jika berisi nilai bukan string', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      if (sql.includes('FROM preparations')) return { values: [mockPreparationRow] };
      return {
        values: [{
          ...mockParameterRow,
          parameter_key: 'flavor_notes',
          label: 'Flavor notes',
          value_type: 'text_list',
        }],
      };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: {
  flavor_notes: ['Sweet', 123] as unknown as string[],
},
      })
    ).rejects.toThrow("Nilai 'Flavor notes' harus berupa daftar teks.");
  });

  it('mengambil seluruh riwayat Brew Log', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM brew_parameter_values')) {
        return { values: [mockBrewParameterRow] };
      }
      return { values: [mockBrewRow] };
    });

    const result = await localBrewRepository.getBrews();

    expect(brewDb.query).toHaveBeenCalledWith(
      'SELECT * FROM brews ORDER BY brewed_at DESC, id DESC'
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(101);
    expect(result[0].rating).toBe(5);
    expect(result[0].values.grind_weight).toBe(15);
  });

  it('mengembalikan array kosong jika belum ada Brew Log', async () => {
    brewDb.query.mockResolvedValue({ values: undefined });

    const result = await localBrewRepository.getBrews();

    expect(result).toEqual([]);
  });

  it('mengambil Brew Log berdasarkan ID', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM brew_parameter_values')) {
        return { values: [mockBrewParameterRow] };
      }
      return { values: [mockBrewRow] };
    });

    const result = await localBrewRepository.getBrewById(101);

    expect(result.id).toBe(101);
    expect(result.beanId).toBe(1);
    expect(result.preparationId).toBe(1);
    expect(result.values.grind_weight).toBe(15);
  });

  it('menghasilkan error jika Brew Log tidak ditemukan', async () => {
    brewDb.query.mockResolvedValue({ values: [] });

    await expect(
      localBrewRepository.getBrewById(999)
    ).rejects.toThrow('Brew Log tidak ditemukan.');
  });

  it('menggunakan nilai asli jika JSON parameter tidak valid', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM brew_parameter_values')) {
        return {
          values: [{ parameter_key: 'grind_weight', value_json: 'invalid-json' }],
        };
      }
      return { values: [mockBrewRow] };
    });

    const result = await localBrewRepository.getBrewById(101);

    expect(result.values.grind_weight).toBe('invalid-json');
  });

  it('menolak Brew Log jika bean tidak ditemukan', async () => {
    brewDb.query.mockResolvedValue({ values: [] });

    await expect(
      localBrewRepository.createBrew({
        beanId: 99,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: {},
      })
    ).rejects.toThrow('Bean yang dipilih tidak ditemukan.');
  });

  it('menolak Brew Log jika metode seduh telah diarsipkan', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) {
        return { values: [{ id: 1 }] };
      }
      return {
        values: [{ ...mockCustomPreparationRow, archived_at: '2026-11-27' }],
      };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 11,
        rating: 5,
        brewedAt: '2026-11-27',
        values: {},
      })
    ).rejects.toThrow('Metode seduh tidak tersedia.');
  });

  it('menolak rating di luar rentang 1 sampai 5', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      return { values: [mockPreparationRow] };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 6,
        brewedAt: '2026-11-27',
        values: {},
      })
    ).rejects.toThrow('Rating wajib diisi dengan angka 1 sampai 5.');
  });

  it('menolak parameter yang tidak aktif pada metode seduh', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      if (sql.includes('FROM preparations')) return { values: [mockPreparationRow] };
      return {
        values: [{ ...mockParameterRow, is_enabled: 0 }],
      };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: { grind_weight: 15 },
      })
    ).rejects.toThrow(
      "Parameter 'grind_weight' tidak aktif untuk metode seduh ini."
    );
  });

  it('menolak nilai parameter angka yang negatif', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      if (sql.includes('FROM preparations')) return { values: [mockPreparationRow] };
      return { values: [mockParameterRow] };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: { grind_weight: -5 },
      })
    ).rejects.toThrow(
      "Nilai 'Grind weight' harus berupa angka >= 0."
    );
  });

  it('menolak nilai parameter angka yang bukan angka', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      if (sql.includes('FROM preparations')) return { values: [mockPreparationRow] };
      return { values: [mockParameterRow] };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: { grind_weight: '15' },
      })
    ).rejects.toThrow(
      "Nilai 'Grind weight' harus berupa angka >= 0."
    );
  });

  it('menolak parameter wajib yang belum diisi', async () => {
    brewDb.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM beans')) return { values: [{ id: 1 }] };
      if (sql.includes('FROM preparations')) return { values: [mockPreparationRow] };
      return {
        values: [{ ...mockParameterRow, is_required: 1 }],
      };
    });

    await expect(
      localBrewRepository.createBrew({
        beanId: 1,
        preparationId: 1,
        rating: 5,
        brewedAt: '2026-11-27',
        values: {},
      })
    ).rejects.toThrow("Parameter 'Grind weight' wajib diisi.");
  });
});


describe('localPreparationRepository', () => {
  let prepDb: {
    query: ReturnType<typeof vi.fn>;
    run: ReturnType<typeof vi.fn>;
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    prepDb = {
      query: vi.fn(),
      run: vi.fn(),
      execute: vi.fn(),
    };

    vi.mocked(getLocalDatabase).mockResolvedValue(
      prepDb as unknown as Awaited<ReturnType<typeof getLocalDatabase>>
    );
  });
  
it('tidak menjalankan UPDATE jika tidak ada field preparation yang berubah', async () => {
  prepDb.query.mockResolvedValue({
    values: [mockCustomPreparationRow],
  });

  const result =
    await localPreparationRepository.updatePreparation(11, {});

  expect(prepDb.run).not.toHaveBeenCalled();
  expect(result.id).toBe(11);
  expect(result.name).toBe('My Pour Over');
});

it.each([
  ['', 'Nama metode wajib diisi dan maksimal 80 karakter.'],
  ['   ', 'Nama metode wajib diisi dan maksimal 80 karakter.'],
  ['A'.repeat(81), 'Nama metode wajib diisi dan maksimal 80 karakter.'],
])('menolak nama metode tidak valid saat membuat preparation', async (name, error) => {
  await expect(
    localPreparationRepository.createPreparation({
      name,
    })
  ).rejects.toThrow(error);
});

it('menerima nama metode dengan panjang tepat 80 karakter', async () => {
  const db = await getLocalDatabase();

  (db.run as ReturnType<typeof vi.fn>).mockResolvedValue({
    changes: { lastId: 11 },
  });

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockCustomPreparationRow],
  });

  await localPreparationRepository.createPreparation({
    name: 'A'.repeat(80),
  });

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO preparations'),
    expect.arrayContaining(['A'.repeat(80)])
  );
});


it('menolak perubahan nama metode bawaan', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockPreparationRow],
  });

  await expect(
    localPreparationRepository.updatePreparation(1, {
      name: 'New V60',
    })
  ).rejects.toThrow('Metode bawaan tidak dapat diubah.');

  expect(db.run).not.toHaveBeenCalled();
});

it('menolak pengarsipan metode bawaan', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockPreparationRow],
  });

  await expect(
    localPreparationRepository.archivePreparation(1)
  ).rejects.toThrow('Metode bawaan tidak dapat diarsipkan.');

  expect(db.run).not.toHaveBeenCalled();
});

it('menolak nama kosong saat memperbarui metode custom', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockCustomPreparationRow],
  });

  await expect(
    localPreparationRepository.updatePreparation(11, {
      name: '   ',
    })
  ).rejects.toThrow('Nama metode tidak valid.');

  expect(db.run).not.toHaveBeenCalled();
});

it('menolak nama metode lebih dari 80 karakter saat update', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockCustomPreparationRow],
  });

  await expect(
    localPreparationRepository.updatePreparation(11, {
      name: 'A'.repeat(81),
    })
  ).rejects.toThrow('Nama metode tidak valid.');

  expect(db.run).not.toHaveBeenCalled();
});

it('membuat metode custom dengan style default', async () => {
  const db = await getLocalDatabase();

  (db.run as ReturnType<typeof vi.fn>).mockResolvedValue({
    changes: { lastId: 11 },
  });

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockCustomPreparationRow],
  });

  await localPreparationRepository.createPreparation({
    name: 'Aeropress',
  });

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO preparations'),
    expect.arrayContaining(['Aeropress', 'aeropress', null, 'CUSTOM_PREPARATION'])
  );

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO preparation_parameters'),
    [11]
  );
});


it('menyimpan parameter sebagai enabled bernilai 1', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockParameterRow],
  });

  await localPreparationRepository.updatePreparationParameters(11, [
    { key: 'grind_weight', enabled: true },
  ]);

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE preparation_parameters'),
    [1, 'before', 0, 0, 11, 'grind_weight']
  );

  expect(db.execute).toHaveBeenCalledWith('COMMIT');
});

it('menyimpan parameter disabled sebagai 0', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockParameterRow],
  });

  await localPreparationRepository.updatePreparationParameters(11, [
    { key: 'grind_weight', enabled: false },
  ]);

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE preparation_parameters'),
    [0, 'before', 0, 0, 11, 'grind_weight']
  );
});

it('menyimpan phase dan sort order parameter sesuai input', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockParameterRow],
  });

  await localPreparationRepository.updatePreparationParameters(11, [
    {
      key: 'grind_weight',
      enabled: true,
      phase: 'during',
      sortOrder: 5,
    },
  ]);

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE preparation_parameters'),
    [1, 'during', 5, 0, 11, 'grind_weight']
  );
});

it('menyimpan status required parameter sebagai 1', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockParameterRow],
  });

  await localPreparationRepository.updatePreparationParameters(11, [
    {
      key: 'grind_weight',
      enabled: true,
      required: true,
    },
  ]);

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE preparation_parameters'),
    [1, 'before', 0, 1, 11, 'grind_weight']
  );
});

it('menggunakan nilai default untuk phase dan sort order yang tidak diberikan', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockParameterRow],
  });

  await localPreparationRepository.updatePreparationParameters(11, [
    { key: 'grind_weight', enabled: true },
  ]);

  expect(db.run).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE preparation_parameters'),
    [1, 'before', 0, 0, 11, 'grind_weight']
  );
});


it('melakukan rollback ketika update parameter preparation gagal', async () => {
  const db = await getLocalDatabase();

  (db.query as ReturnType<typeof vi.fn>).mockResolvedValue({
    values: [mockCustomPreparationRow],
  });

  (db.run as ReturnType<typeof vi.fn>).mockRejectedValue(
    new Error('Database error')
  );

  await expect(
    localPreparationRepository.updatePreparationParameters(11, [
      { key: 'grind_weight', enabled: true },
    ])
  ).rejects.toThrow('Database error');

  expect(db.execute).toHaveBeenCalledWith('BEGIN TRANSACTION');
  expect(db.execute).toHaveBeenCalledWith('ROLLBACK');
  expect(db.execute).not.toHaveBeenCalledWith('COMMIT');
});



  it('mengambil daftar metode seduh aktif', async () => {
    prepDb.query.mockResolvedValue({
      values: [mockPreparationRow],
    });

    const result = await localPreparationRepository.getPreparations();

    expect(prepDb.query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE archived_at IS NULL')
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('V60');
  });

  it('menyertakan metode yang diarsipkan jika diminta', async () => {
    prepDb.query.mockResolvedValue({ values: [] });

    await localPreparationRepository.getPreparations(true);

    expect(prepDb.query).toHaveBeenCalledWith(
      expect.not.stringContaining('WHERE archived_at IS NULL')
    );
  });

  it('mengembalikan array kosong jika tidak ada metode seduh', async () => {
    prepDb.query.mockResolvedValue({ values: undefined });

    const result = await localPreparationRepository.getPreparations();

    expect(result).toEqual([]);
  });

  it('mengambil parameter berdasarkan ID metode seduh', async () => {
    prepDb.query.mockResolvedValue({
      values: [mockParameterRow],
    });

    const result =
      await localPreparationRepository.getPreparationParameters(1);

    expect(prepDb.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM preparation_parameters pp'),
      [1]
    );
    expect(result[0].parameter_key).toBe('grind_weight');
    expect(result[0].is_enabled).toBe(1);
  });

  it('membuat metode seduh baru', async () => {
    prepDb.run.mockResolvedValue({
      changes: { lastId: 11 },
    });

    prepDb.query.mockResolvedValue({
      values: [mockCustomPreparationRow],
    });

    const result = await localPreparationRepository.createPreparation({
      name: 'My Pour Over',
      note: 'Manual brewing method',
    });

    expect(prepDb.run).toHaveBeenCalledTimes(2);
    expect(result.name).toBe('My Pour Over');
    expect(result.is_builtin).toBe(0);
  });

  it('mengubah nama menjadi slug yang benar', async () => {
    prepDb.run.mockResolvedValue({
      changes: { lastId: 11 },
    });

    prepDb.query.mockResolvedValue({
      values: [mockCustomPreparationRow],
    });

    await localPreparationRepository.createPreparation({
      name: '  Café Pour Over!  ',
    });

    const insertValues = prepDb.run.mock.calls[0][1] as unknown[];

    expect(insertValues[0]).toBe('Café Pour Over!');
    expect(insertValues[1]).toBe('cafe-pour-over');
  });

  it('menolak nama metode yang kosong', async () => {
    await expect(
      localPreparationRepository.createPreparation({ name: '   ' })
    ).rejects.toThrow(
      'Nama metode wajib diisi dan maksimal 80 karakter.'
    );
  });

  it('menolak nama metode lebih dari 80 karakter', async () => {
    await expect(
      localPreparationRepository.createPreparation({
        name: 'A'.repeat(81),
      })
    ).rejects.toThrow(
      'Nama metode wajib diisi dan maksimal 80 karakter.'
    );
  });

  it('memperbarui metode seduh custom', async () => {
    prepDb.query.mockResolvedValue({
      values: [mockCustomPreparationRow],
    });

    await localPreparationRepository.updatePreparation(11, {
      name: 'New Pour Over',
      note: 'Updated note',
      styleType: 'DRIPPER',
    });

    expect(prepDb.run).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE preparations SET'),
      expect.arrayContaining([
        'New Pour Over',
        'new-pour-over',
        'Updated note',
        'DRIPPER',
        11,
      ])
    );
  });

  it('menolak perubahan metode bawaan', async () => {
    prepDb.query.mockResolvedValue({
      values: [mockPreparationRow],
    });

    await expect(
      localPreparationRepository.updatePreparation(1, {
        name: 'New V60',
      })
    ).rejects.toThrow('Metode bawaan tidak dapat diubah.');

    expect(prepDb.run).not.toHaveBeenCalled();
  });

  it('menolak nama kosong saat memperbarui metode', async () => {
    prepDb.query.mockResolvedValue({
      values: [mockCustomPreparationRow],
    });

    await expect(
      localPreparationRepository.updatePreparation(11, {
        name: '   ',
      })
    ).rejects.toThrow('Nama metode tidak valid.');
  });

  it('mengarsipkan metode seduh custom', async () => {
    prepDb.query.mockResolvedValue({
      values: [
        {
          ...mockCustomPreparationRow,
          archived_at: '2026-11-27',
        },
      ],
    });

    const result =
      await localPreparationRepository.archivePreparation(11);

    expect(prepDb.run).toHaveBeenCalledWith(
      expect.stringContaining('SET archived_at = CURRENT_TIMESTAMP'),
      [11]
    );
    expect(result.archived_at).toBe('2026-11-27');
  });

  it('menolak pengarsipan metode bawaan', async () => {
    prepDb.query.mockResolvedValue({
      values: [mockPreparationRow],
    });

    await expect(
      localPreparationRepository.archivePreparation(1)
    ).rejects.toThrow('Metode bawaan tidak dapat diarsipkan.');

    expect(prepDb.run).not.toHaveBeenCalled();
  });

  it('memulihkan metode seduh yang diarsipkan', async () => {
    prepDb.query.mockResolvedValue({
      values: [
        {
          ...mockCustomPreparationRow,
          archived_at: null,
        },
      ],
    });

    await localPreparationRepository.restorePreparation(11);

    expect(prepDb.run).toHaveBeenCalledWith(
      expect.stringContaining('SET archived_at = NULL'),
      [11]
    );
  });

  
it('memperbarui parameter dalam transaksi database', async () => {
  prepDb.query.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM preparation_parameters pp')) {
      return {
        values: [mockParameterRow],
      };
    }

    return {
      values: [mockCustomPreparationRow],
    };
  });

  const result =
    await localPreparationRepository.updatePreparationParameters(
      11,
      [
        {
          key: 'grind_weight',
          enabled: true,
          phase: 'before',
          sortOrder: 2,
          required: true,
        },
      ]
    );

  expect(prepDb.execute).toHaveBeenCalledWith('BEGIN TRANSACTION');

  expect(prepDb.run).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE preparation_parameters SET'),
    [1, 'before', 2, 1, 11, 'grind_weight']
  );

  expect(prepDb.execute).toHaveBeenCalledWith('COMMIT');

  expect(result).toHaveLength(1);
  expect(result[0].parameter_key).toBe('grind_weight');
  expect(result[0].is_required).toBe(0);
});

  it('melakukan rollback jika pembaruan parameter gagal', async () => {
    prepDb.query.mockResolvedValue({
      values: [mockCustomPreparationRow],
    });

    prepDb.run.mockRejectedValue(new Error('Database error'));

    await expect(
      localPreparationRepository.updatePreparationParameters(
        11,
        [
          {
            key: 'grind_weight',
            enabled: true,
          },
        ]
      )
    ).rejects.toThrow('Database error');

    expect(prepDb.execute).toHaveBeenCalledWith('BEGIN TRANSACTION');
    expect(prepDb.execute).toHaveBeenCalledWith('ROLLBACK');
    expect(prepDb.execute).not.toHaveBeenCalledWith('COMMIT');
  });
});