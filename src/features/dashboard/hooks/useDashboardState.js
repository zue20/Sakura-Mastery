import { useState, useCallback, useMemo } from 'react';

// Pure JS state logic — unchanged from the web version.
const LEVEL_DEFAULTS = {
  N5: { streak: 12, xp: 2450 },
  N4: { streak: 5, xp: 980 },
};

export default function useDashboardState(initialLevel = 'N5') {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [levelStats, setLevelStats] = useState(LEVEL_DEFAULTS);

  const switchLevel = useCallback((level) => {
    if (level !== 'N5' && level !== 'N4') return;
    setCurrentLevel(level);
  }, []);

  const addXp = useCallback((amount) => {
    setLevelStats((prev) => ({
      ...prev,
      [currentLevel]: {
        ...prev[currentLevel],
        xp: prev[currentLevel].xp + amount,
      },
    }));
  }, [currentLevel]);

  const bumpStreak = useCallback(() => {
    setLevelStats((prev) => ({
      ...prev,
      [currentLevel]: {
        ...prev[currentLevel],
        streak: prev[currentLevel].streak + 1,
      },
    }));
  }, [currentLevel]);

  const stats = useMemo(() => levelStats[currentLevel], [levelStats, currentLevel]);

  return {
    currentLevel,
    switchLevel,
    streak: stats.streak,
    xp: stats.xp,
    addXp,
    bumpStreak,
  };
}