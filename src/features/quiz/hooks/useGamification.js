import { useReducer, useCallback, useMemo } from 'react';

const XP_PER_CORRECT_ANSWER = 10;

function reducer(state, action) {
  switch (action.type) {
    case 'ANSWER_CORRECT': {
      return {
        ...state,
        xp: state.xp + XP_PER_CORRECT_ANSWER,
        streak: state.streak + 1,
        bestStreak: Math.max(state.bestStreak, state.streak + 1),
        lastXpGain: XP_PER_CORRECT_ANSWER,
      };
    }

    case 'ANSWER_INCORRECT': {
      const heartsLeft = state.hearts - 1;
      return {
        ...state,
        hearts: heartsLeft,
        streak: 0,
        lastXpGain: 0,
        isOutOfHearts: heartsLeft <= 0,
      };
    }

    // Restores hearts to full WITHOUT touching xp/streak/bestStreak —
    // used when the player pays XP to refill mid-quiz. RESET (below) is
    // different: it wipes the whole session, used only for a fresh start.
    case 'REFILL_HEARTS':
      return {
        ...state,
        hearts: state.heartsStart,
        isOutOfHearts: false,
      };

    case 'RESET':
      return createInitialState(action.heartsStart);

    default:
      return state;
  }
}

function createInitialState(heartsStart) {
  return {
    hearts: heartsStart,
    heartsStart,
    xp: 0,
    streak: 0,
    bestStreak: 0,
    lastXpGain: 0,
    isOutOfHearts: false,
  };
}

export function useGamification({ heartsStart = 3 } = {}) {
  const [state, dispatch] = useReducer(reducer, heartsStart, createInitialState);

  const registerCorrect = useCallback(() => {
    dispatch({ type: 'ANSWER_CORRECT' });
  }, []);

  const registerIncorrect = useCallback(() => {
    dispatch({ type: 'ANSWER_INCORRECT' });
  }, []);

  const refillHearts = useCallback(() => {
    dispatch({ type: 'REFILL_HEARTS' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', heartsStart });
  }, [heartsStart]);

  const summary = useMemo(() => ({
    xp: state.xp,
    heartsRemaining: state.hearts,
    heartsStart: state.heartsStart,
    bestStreak: state.bestStreak,
  }), [state.xp, state.hearts, state.heartsStart, state.bestStreak]);

  return {
    hearts: state.hearts,
    heartsStart: state.heartsStart,
    xp: state.xp,
    streak: state.streak,
    lastXpGain: state.lastXpGain,
    isOutOfHearts: state.isOutOfHearts,
    summary,
    registerCorrect,
    registerIncorrect,
    refillHearts,
    reset,
  };
}