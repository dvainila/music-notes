import { useState } from 'react';
import styled from 'styled-components';
import { TopBar } from '../components/Layout/TopBar';
import { HandednessToggle } from '../components/Controls/HandednessToggle';
import { SharpToggle } from '../components/Controls/SharpToggle';
import { MetronomeControl } from '../components/Controls/MetronomeControl';
import { FireworkSettingsControl } from '../components/Controls/FireworkSettingsControl';
import { loadHandedness, saveHandedness } from '../storage/handedness';
import { loadShowSharps, saveShowSharps } from '../storage/sharps';
import { loadFireworkSettings, saveFireworkSettings } from '../storage/fireworkSettings';
import type { Handedness } from '../music/notes';

const Page = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;

  @media (max-width: 900px) {
    padding: 16px;
  }
`;

const Panel = styled.div`
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 22px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.fret};
  flex-wrap: wrap;

  &:last-child {
    border-bottom: none;
  }
`;

const RowTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
`;

export function SettingsPage() {
  const [handedness, setHandedness] = useState<Handedness>(loadHandedness);
  const [showSharps, setShowSharps] = useState(loadShowSharps);
  const [fireworkSettings, setFireworkSettings] = useState(loadFireworkSettings);

  const handleHandednessChange = (value: Handedness) => {
    setHandedness(value);
    saveHandedness(value);
  };

  const handleShowSharpsChange = (value: boolean) => {
    setShowSharps(value);
    saveShowSharps(value);
  };

  const handleFireworkSettingsChange = (settings: typeof fireworkSettings) => {
    setFireworkSettings(settings);
    saveFireworkSettings(settings);
  };

  return (
    <Page>
      <TopBar />
      <Content>
        <Panel>
          <Title>Settings</Title>

          <Row>
            <RowTitle>Guitar handedness</RowTitle>
            <HandednessToggle value={handedness} onChange={handleHandednessChange} />
          </Row>

          <Row>
            <RowTitle>Note labels</RowTitle>
            <SharpToggle checked={showSharps} onChange={handleShowSharpsChange} />
          </Row>

          <Row>
            <RowTitle>Metronome</RowTitle>
            <MetronomeControl />
          </Row>

          <Row>
            <RowTitle>Celebration effect</RowTitle>
            <FireworkSettingsControl value={fireworkSettings} onChange={handleFireworkSettingsChange} />
          </Row>
        </Panel>
      </Content>
    </Page>
  );
}
