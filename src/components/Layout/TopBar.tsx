import type { ReactNode } from 'react';
import styled from 'styled-components';

const Bar = styled.header`
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 18px 36px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.fret};
  flex-wrap: wrap;
  flex-shrink: 0;

  @media (max-width: 900px) {
    gap: 10px;
    padding: 8px 12px;
  }
`;

const Brand = styled.span`
  font-weight: 700;
  font-size: 17px;
  white-space: nowrap;

  @media (max-width: 900px) {
    font-size: 13px;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.fret};

  @media (max-width: 900px) {
    height: 16px;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-left: auto;

  @media (max-width: 900px) {
    gap: 8px;
  }
`;

interface TopBarProps {
  children?: ReactNode;
}

export function TopBar({ children }: TopBarProps) {
  return (
    <Bar>
      <Brand>🎸 Fretboard</Brand>
      {children && (
        <Actions>
          <Divider />
          {children}
        </Actions>
      )}
    </Bar>
  );
}
