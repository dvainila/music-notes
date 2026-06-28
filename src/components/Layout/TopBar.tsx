import type { ReactNode } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { useFullscreen } from '../../hooks/useFullscreen';

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

const Links = styled.nav`
  display: flex;
  gap: 8px;
`;

const StyledLink = styled(NavLink)`
  padding: 9px 18px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.fret};
  }

  &.active {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.noteTextActive};
  }

  &.active:hover {
    background: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: 900px) {
    padding: 6px 12px;
    font-size: 12px;
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

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.fret};
  background: transparent;
  color: ${({ theme }) => theme.colors.noteText};
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.fret};
  }

  @media (max-width: 900px) {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }
`;

interface TopBarProps {
  children?: ReactNode;
}

export function TopBar({ children }: TopBarProps) {
  const fullscreen = useFullscreen();

  return (
    <Bar>
      <Brand>🎸 Fretboard</Brand>
      <Links>
        <StyledLink to="/" end>
          Fretboard
        </StyledLink>
        <StyledLink to="/settings">Settings</StyledLink>
      </Links>
      <Actions>
        {children}
        {fullscreen.isSupported && (
          <>
            <Divider />
            <IconButton
              type="button"
              onClick={fullscreen.toggle}
              title={fullscreen.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              aria-label={fullscreen.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {fullscreen.isFullscreen ? '⤡' : '⛶'}
            </IconButton>
          </>
        )}
      </Actions>
    </Bar>
  );
}
