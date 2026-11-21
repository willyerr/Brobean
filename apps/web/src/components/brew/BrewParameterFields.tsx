import type { BrewParameterValue, PreparationParameter } from '@brobean/shared';

interface Props {
  parameters: PreparationParameter[];
  values: Record<string, BrewParameterValue>;
  onChange: (key: string, value: BrewParameterValue | undefined) => void;
  disabled?: boolean;
}

const phases = [
  { key: 'before', title: 'Before Brewing', description: 'Prepare your coffee and equipment.' },
  { key: 'during', title: 'During Brewing', description: 'Record what happens while brewing.' },
  { key: 'after', title: 'After Brewing', description: 'Capture the final brew result.' },
] as const;

function ParameterInput({ parameter, value, onChange, disabled }: {
  parameter: PreparationParameter;
  value: BrewParameterValue | undefined;
  onChange: (value: BrewParameterValue | undefined) => void;
  disabled: boolean;
}) {
  const id = `brew-param-${parameter.parameter_key}`;
  const label = <label htmlFor={id}>{parameter.label}{parameter.is_required ? <span className="required-mark"> *</span> : null}</label>;
  const hint = parameter.unit ? <small className="field-hint">Unit: {parameter.unit}</small> : null;

  if (parameter.value_type === 'boolean') {
    return (
      <div className="brew-parameter-check">
        <label htmlFor={id}>{parameter.label}{parameter.is_required ? ' *' : ''}</label>
        <input id={id} type="checkbox" checked={value === true} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      </div>
    );
  }

  if (parameter.value_type === 'text_list') {
    return (
      <div className="field-group">
        {label}
        <textarea id={id} rows={3} value={Array.isArray(value) ? value.join('\n') : ''} disabled={disabled} placeholder="Enter one item per line" onChange={(event) => onChange(event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} />
        {hint}
      </div>
    );
  }

  return (
    <div className="field-group">
      {label}
      <div className="brew-parameter-input-wrap">
        <input
          id={id}
          type={parameter.value_type === 'number' || parameter.value_type === 'duration' ? 'number' : 'text'}
          min={parameter.value_type === 'number' || parameter.value_type === 'duration' ? 0 : undefined}
          step={parameter.value_type === 'number' ? 'any' : 1}
          value={value === undefined ? '' : String(value)}
          disabled={disabled}
          placeholder={parameter.value_type === 'duration' ? 'Enter seconds' : 'Enter value'}
          onChange={(event) => {
            const raw = event.target.value;
            if (!raw) onChange(undefined);
            else if (parameter.value_type === 'number' || parameter.value_type === 'duration') onChange(Number(raw));
            else onChange(raw);
          }}
        />
        {parameter.unit ? <span>{parameter.unit}</span> : null}
      </div>
      {parameter.value_type === 'duration' ? <small className="field-hint">Enter duration in seconds.</small> : hint}
    </div>
  );
}

export default function BrewParameterFields({ parameters, values, onChange, disabled = false }: Props) {
  const enabled = parameters.filter((parameter) => parameter.is_enabled === 1);
  if (!enabled.length) return <p className="brew-no-parameters">No parameters are enabled for this brewing method.</p>;

  return (
    <div className="brew-parameter-phases">
      {phases.map((phase) => {
        const phaseParameters = enabled.filter((parameter) => parameter.preparation_phase === phase.key);
        if (!phaseParameters.length) return null;
        return (
          <details className="brew-phase" key={phase.key} open>
            <summary>
              <span><strong>{phase.title}</strong><small>{phase.description}</small></span>
              <span className="brew-phase-chevron" aria-hidden="true">⌄</span>
            </summary>
            <div className="brew-phase-fields">
              {phaseParameters.map((parameter) => (
                <ParameterInput
                  key={parameter.parameter_key}
                  parameter={parameter}
                  value={values[parameter.parameter_key]}
                  disabled={disabled}
                  onChange={(value) => onChange(parameter.parameter_key, value)}
                />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
