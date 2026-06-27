import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(90deg); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 32px;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 56px;
  animation: ${rotate} 1.6s ease-in-out infinite;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
`;

const Subtitle = styled.p`
  margin: 0;
  max-width: 320px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

export function RotateDeviceOverlay() {
  return (
    <Overlay>
      <Icon>📱</Icon>
      <Title>Please rotate your device</Title>
      <Subtitle>This app is only available in landscape orientation. Turn your phone sideways to continue.</Subtitle>
    </Overlay>
  );
}
