import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 28px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 900px), (max-height: 500px) {
    padding: 14px;
  }
`;

export const Title = styled.h2`
  margin: 0 0 20px;
  font-size: 20px;

  @media (max-width: 900px), (max-height: 500px) {
    margin: 0 0 10px;
    font-size: 15px;
  }
`;

export const FieldGroup = styled.div`
  margin-bottom: 20px;

  @media (max-width: 900px), (max-height: 500px) {
    margin-bottom: 10px;
  }
`;

export const FieldLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 8px;
`;

export const StringGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
`;

export const StringButton = styled.button<{ $active: boolean }>`
  padding: 10px 4px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.fret};
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  background: ${({ theme, $active }) => ($active ? theme.colors.accent : 'transparent')};
  color: ${({ theme, $active }) => ($active ? theme.colors.noteTextActive : theme.colors.noteText)};
  transition: background 0.2s ease;
`;

export const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  margin-bottom: 12px;
  color: ${({ theme }) => theme.colors.noteText};
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
`;

export const Button = styled.button<{ $variant?: 'primary' }>`
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  background: ${({ theme, $variant }) => ($variant === 'primary' ? theme.colors.accent : theme.colors.fret)};
  color: ${({ theme, $variant }) => ($variant === 'primary' ? theme.colors.noteTextActive : theme.colors.noteText)};
`;
