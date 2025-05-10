import React, { useState } from 'react';
import Card from '@/app/components/Card';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/Button';
import { updateGameSettings } from '@/lib/firebase/gameService';
import type { Game } from '@/types/firestore';

interface LobbySettingsProps {
  gameId: string;
  initialSettings?: Game['settings'];
  isHost: boolean;
}

const DEFAULT_SETTINGS = {
  wordCountPerPerson: 5,
  roundLengthSeconds: 60,
  skipPenaltySeconds: 10,
};

export default function LobbySettings({ gameId, initialSettings, isHost }: LobbySettingsProps) {
  const [wordCount, setWordCount] = useState(initialSettings?.wordCountPerPerson ?? DEFAULT_SETTINGS.wordCountPerPerson);
  const [roundLength, setRoundLength] = useState(initialSettings?.roundLengthSeconds ?? DEFAULT_SETTINGS.roundLengthSeconds);
  const [skipPenalty, setSkipPenalty] = useState(initialSettings?.skipPenaltySeconds ?? DEFAULT_SETTINGS.skipPenaltySeconds);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCountError, setWordCountError] = useState<string | null>(null);
  const [roundLengthError, setRoundLengthError] = useState<string | null>(null);
  const [skipPenaltyError, setSkipPenaltyError] = useState<string | null>(null);

  if (!isHost) return null;

  const validateWordCount = (value: string) => {
    const num = Number(value);
    if (!/^[0-9]+$/.test(value) || isNaN(num)) return 'Enter a valid number';
    if (num < 1 || num > 20) return 'Must be between 1 and 20';
    return null;
  };
  const validateRoundLength = (value: string) => {
    const num = Number(value);
    if (!/^[0-9]+$/.test(value) || isNaN(num)) return 'Enter a valid number';
    if (num < 10 || num > 300) return 'Must be between 10 and 300';
    return null;
  };
  const validateSkipPenalty = (value: string) => {
    const num = Number(value);
    if (!/^[0-9]+$/.test(value) || isNaN(num)) return 'Enter a valid number';
    if (num < 0) return 'Must be at least 0';
    if (num > roundLength) return 'Cannot be greater than round length';
    return null;
  };

  const handleWordCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWordCount(Number(value));
    setWordCountError(validateWordCount(value));
  };
  const handleRoundLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRoundLength(Number(value));
    setRoundLengthError(validateRoundLength(value));
    // If skip penalty is now greater than new round length, adjust it
    if (skipPenalty > Number(value)) {
      setSkipPenalty(Number(value));
    }
  };
  const handleSkipPenaltyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkipPenalty(Number(value));
    setSkipPenaltyError(validateSkipPenalty(value));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const wcErr = validateWordCount(wordCount.toString());
    const rlErr = validateRoundLength(roundLength.toString());
    const spErr = validateSkipPenalty(skipPenalty.toString());
    setWordCountError(wcErr);
    setRoundLengthError(rlErr);
    setSkipPenaltyError(spErr);
    if (wcErr || rlErr || spErr) return;
    setSaving(true);
    try {
      await updateGameSettings(gameId, {
        wordCountPerPerson: wordCount,
        roundLengthSeconds: roundLength,
        skipPenaltySeconds: skipPenalty,
      });
      setSuccess(true);
    } catch (err) {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <Card title="Game Settings" className="mb-4">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Input
          label="Word count per person"
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
          min={1}
          max={20}
          value={wordCount}
          onChange={handleWordCountChange}
          fullWidth
          error={wordCountError || undefined}
        />
        <Input
          label="Round length (seconds)"
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
          min={10}
          max={300}
          value={roundLength}
          onChange={handleRoundLengthChange}
          fullWidth
          error={roundLengthError || undefined}
        />
        <Input
          label="Skip penalty (seconds)"
          inputMode="numeric"
          pattern="[0-9]*"
          type="text"
          min={0}
          max={roundLength}
          value={skipPenalty}
          onChange={handleSkipPenaltyChange}
          fullWidth
          error={skipPenaltyError || undefined}
        />
        <div className="flex gap-2 items-center">
          <Button type="submit" variant="primary" isLoading={saving} disabled={saving}>
            Save Settings
          </Button>
          {success && <span className="text-green-600 font-medium">Saved!</span>}
          {error && <span className="text-red-600 font-medium">{error}</span>}
        </div>
      </form>
    </Card>
  );
} 