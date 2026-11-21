export type BrewParameterValue = string | number | boolean | string[];

export interface Brew {
  id?: number;
  beanId: number;
  preparationId: number;
  rating: number;
  brewedAt: string;
  note?: string;
  values: Record<string, BrewParameterValue>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Preparation {
  id: number;
  name: string;
  slug: string;
  note?: string | null;
  style_type: string;
  is_builtin: number;
  use_custom_parameters: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreparationParameter {
  parameter_key: string;
  label: string;
  value_type: 'text' | 'number' | 'duration' | 'boolean' | 'text_list';
  unit: string | null;
  phase: 'before' | 'during' | 'after';
  default_enabled: number;
  sort_order: number;
  is_enabled: number;
  preparation_phase: 'before' | 'during' | 'after';
  preparation_sort_order: number;
  is_required: number;
}
