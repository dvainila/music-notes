import styled from 'styled-components';
import type { Handedness } from '../../music/notes';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;

  @media (max-width: 900px), (max-height: 500px) {
    display: none;
  }
`;

const Options = styled.div`
  display: inline-flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.fret};
`;

const Option = styled.button<{ $active: boolean }>`
  padding: 8px 14px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  background: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.noteTextActive : theme.colors.noteText)};
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.fret)};
  }

  @media (max-width: 900px), (max-height: 500px) {
    padding: 5px 8px;
    font-size: 10px;
  }
`;

interface HandednessToggleProps {
  value: Handedness;
  onChange: (value: Handedness) => void;
}

export function HandednessToggle({ value, onChange }: HandednessToggleProps) {
  return (
    <Wrapper>
      <Label>Guitar:</Label>
      <Options>
        <Option type="button" $active={value === 'right'} onClick={() => onChange('right')}>
          Right-handed
        </Option>
        <Option type="button" $active={value === 'left'} onClick={() => onChange('left')}>
          Left-handed
        </Option>
      </Options>
    </Wrapper>
  );
}
