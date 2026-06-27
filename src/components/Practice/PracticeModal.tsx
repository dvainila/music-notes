import { useState } from 'react';
import { STANDARD_TUNING, getStringNumber } from '../../music/notes';
import {
  Overlay,
  Card,
  Title,
  FieldGroup,
  FieldLabel,
  StringGrid,
  StringButton,
  CheckboxRow,
  Actions,
  Button,
} from './PracticeModal.styles';

export interface PracticeConfig {
  stringIndex: number;
  includeSharps: boolean;
  showNotesOnString: boolean;
}

interface PracticeModalProps {
  onStart: (config: PracticeConfig) => void;
  onCancel: () => void;
}

export function PracticeModal({ onStart, onCancel }: PracticeModalProps) {
  const [stringIndex, setStringIndex] = useState(0);
  const [includeSharps, setIncludeSharps] = useState(false);
  const [showNotesOnString, setShowNotesOnString] = useState(false);

  return (
    <Overlay onClick={onCancel}>
      <Card onClick={(e) => e.stopPropagation()}>
        <Title>Настройка обучения</Title>

        <FieldGroup>
          <FieldLabel>Выберите струну</FieldLabel>
          <StringGrid>
            {STANDARD_TUNING.map((note, index) => (
              <StringButton
                key={index}
                type="button"
                $active={stringIndex === index}
                onClick={() => setStringIndex(index)}
              >
                {getStringNumber(index)} ({note})
              </StringButton>
            ))}
          </StringGrid>
        </FieldGroup>

        <FieldGroup>
          <CheckboxRow>
            <input
              type="checkbox"
              checked={includeSharps}
              onChange={(e) => setIncludeSharps(e.target.checked)}
            />
            Включая диезы (#)
          </CheckboxRow>
          <CheckboxRow>
            <input
              type="checkbox"
              checked={showNotesOnString}
              onChange={(e) => setShowNotesOnString(e.target.checked)}
            />
            Показывать ноты на струне
          </CheckboxRow>
        </FieldGroup>

        <Actions>
          <Button type="button" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            type="button"
            $variant="primary"
            onClick={() => onStart({ stringIndex, includeSharps, showNotesOnString })}
          >
            Начать обучение
          </Button>
        </Actions>
      </Card>
    </Overlay>
  );
}
