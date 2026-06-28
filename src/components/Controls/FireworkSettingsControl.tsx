import styled from 'styled-components';
import type { FireworkDensity, FireworkSettings } from '../../storage/fireworkSettings';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
`;

const Label = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.noteText};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;

  @media (max-width: 900px) {
    font-size: 10px;
    gap: 5px;
  }
`;

const Switch = styled.input`
  appearance: none;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: ${({ theme }) => theme.colors.fret};
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;

  &:checked {
    background: ${({ theme }) => theme.colors.accent};
  }

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s ease;
  }

  &:checked::before {
    transform: translateX(18px);
  }

  @media (max-width: 900px) {
    width: 28px;
    height: 16px;

    &::before {
      width: 12px;
      height: 12px;
    }

    &:checked::before {
      transform: translateX(12px);
    }
  }
`;

const DensitySelect = styled.select`
  padding: 6px 4px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.fret};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.noteText};
  font-size: 13px;
  cursor: pointer;

  @media (max-width: 900px) {
    padding: 3px;
    font-size: 10px;
  }
`;

const DENSITY_OPTIONS: { value: FireworkDensity; label: string }[] = [
  { value: 'low', label: 'Few' },
  { value: 'medium', label: 'Normal' },
  { value: 'high', label: 'Lots' },
];

interface FireworkSettingsControlProps {
  value: FireworkSettings;
  onChange: (settings: FireworkSettings) => void;
}

export function FireworkSettingsControl({ value, onChange }: FireworkSettingsControlProps) {
  return (
    <Wrapper>
      <Label>
        <Switch
          type="checkbox"
          checked={value.enabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
        />
        🎉 Fireworks
      </Label>
      {value.enabled && (
        <DensitySelect
          value={value.density}
          onChange={(e) => onChange({ ...value, density: e.target.value as FireworkDensity })}
        >
          {DENSITY_OPTIONS.map(({ value: density, label }) => (
            <option key={density} value={density}>
              {label}
            </option>
          ))}
        </DensitySelect>
      )}
    </Wrapper>
  );
}
