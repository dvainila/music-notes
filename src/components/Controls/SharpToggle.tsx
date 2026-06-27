import styled from 'styled-components';

const Wrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  color: ${({ theme }) => theme.colors.noteText};
  font-size: 14px;
  white-space: nowrap;

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

interface SharpToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SharpToggle({ checked, onChange }: SharpToggleProps) {
  return (
    <Wrapper>
      <Switch type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      Show sharps (#)
    </Wrapper>
  );
}
