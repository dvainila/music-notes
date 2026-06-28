import styled from 'styled-components';

const Dot = styled.div`
  position: absolute;
  left: 50%;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.markerDot};
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4) inset;
  transform: translate(-50%, -50%);

  @media (max-width: 900px), (max-height: 500px) {
    width: 7px;
    height: 7px;
  }
`;

interface FretMarkerProps {
  fret: number;
  double?: boolean;
}

export function FretMarker({ double = false }: FretMarkerProps) {
  if (double) {
    return (
      <>
        <Dot style={{ top: '30%' }} />
        <Dot style={{ top: '70%' }} />
      </>
    );
  }
  return <Dot style={{ top: '50%' }} />;
}
