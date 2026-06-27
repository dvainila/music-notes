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
`;

const Brand = styled.span`
  font-weight: 700;
  font-size: 17px;
  white-space: nowrap;
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.fret};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-left: auto;
`;

interface TopBarProps {
  children?: ReactNode;
}

export function TopBar({ children }: TopBarProps) {
  return (
    <Bar>
      <Brand>🎸 Гитарный гриф</Brand>
      {children && (
        <Actions>
          <Divider />
          {children}
        </Actions>
      )}
    </Bar>
  );
}
