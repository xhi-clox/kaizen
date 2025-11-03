'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from 'react';
import { useSettings } from './use-app-data';
import { setItem, getItem } from '@/lib/storage';
import { defaultSettings } from '@/lib/data';

export type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface TimerState {
    sessionType: SessionType;
    isActive: boolean;
    sessionCount: number;
    manualDuration: number;
    startTime: number | null; // Timestamp
    elapsedTime: number; // Seconds
}

interface TimerContextProps extends Omit<TimerState, 'elapsedTime'> {
  timeLeft: number;
  isTimerVisible: boolean;
  setManualDuration: (duration: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  endWorkSession: (wasCompleted: boolean) => void;
  setIsTimerVisible: (isVisible: boolean) => void;
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

const getInitialState = (): TimerState => {
    const defaultWorkDuration = defaultSettings.pomodoro.work;
    const storedState = getItem<Partial<TimerState>>('timerState', {});
    return {
        sessionType: storedState.sessionType || 'work',
        isActive: storedState.isActive || false,
        sessionCount: storedState.sessionCount || 0,
        manualDuration: storedState.manualDuration || defaultWorkDuration,
        startTime: storedState.startTime || null,
        elapsedTime: storedState.elapsedTime || 0,
    };
};

export function TimerProvider({ children }: { children: ReactNode }) {
  const [settings] = useSettings();
  const [state, setState] = useState<TimerState>(getInitialState());
  const [isTimerVisible, setIsTimerVisible] = useState<boolean>(() => getItem('isTimerVisible', false));
  const [timeLeft, setTimeLeft] = useState(0);

  const getTimerDuration = useCallback(() => {
    switch (state.sessionType) {
      case 'work':
        return state.manualDuration * 60;
      case 'shortBreak':
        return settings.pomodoro.shortBreak * 60;
      case 'longBreak':
        return settings.pomodoro.longBreak * 60;
    }
  }, [settings, state.sessionType, state.manualDuration]);

  // Sync state to localStorage
  useEffect(() => {
    setItem('timerState', state);
  }, [state]);

  useEffect(() => {
    setItem('isTimerVisible', isTimerVisible);
  }, [isTimerVisible]);

  // Main timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    const calculateTimeLeft = () => {
        if (!state.isActive || !state.startTime) {
            return;
        }
        const now = Date.now();
        const currentElapsed = Math.floor((now - state.startTime) / 1000);
        const remaining = getTimerDuration() - (state.elapsedTime + currentElapsed);
        
        if (remaining <= 0) {
            setTimeLeft(0);
            if (state.isActive) {
                 // The page itself will handle session end logic, but we stop the timer here
                setState(s => ({ ...s, isActive: false, startTime: null, elapsedTime: 0 }));
            }
        } else {
            setTimeLeft(remaining);
        }
    };

    if (state.isActive) {
      calculateTimeLeft(); // Initial calculation
      interval = setInterval(calculateTimeLeft, 1000);
    } else {
        const remaining = getTimerDuration() - state.elapsedTime;
        setTimeLeft(remaining > 0 ? remaining : getTimerDuration());
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isActive, state.startTime, state.elapsedTime, getTimerDuration]);

  // Update duration when settings change and timer isn't running
  useEffect(() => {
    if (!state.isActive) {
        if (state.sessionType === 'work') {
            setState(s => ({ ...s, manualDuration: settings.pomodoro.work, elapsedTime: 0 }));
        } else {
            setState(s => ({...s, elapsedTime: 0}));
        }
    }
  }, [settings.pomodoro.work, settings.pomodoro.shortBreak, settings.pomodoro.longBreak, state.sessionType, state.isActive]);


  const startTimer = () => {
    const duration = getTimerDuration();
    if (duration > 0 && !state.isActive) {
      setState(s => ({ ...s, isActive: true, startTime: Date.now() }));
      setIsTimerVisible(true);
    }
  };

  const pauseTimer = () => {
    if (!state.isActive || !state.startTime) return;
    const currentElapsed = Math.floor((Date.now() - state.startTime) / 1000);
    setState(s => ({ 
        ...s, 
        isActive: false, 
        startTime: null,
        elapsedTime: s.elapsedTime + currentElapsed,
    }));
  };

  const resetTimer = () => {
    setState({
        ...getInitialState(),
        manualDuration: settings.pomodoro.work,
        sessionType: 'work',
        sessionCount: 0,
        elapsedTime: 0,
        isActive: false,
        startTime: null,
    });
    setIsTimerVisible(false);
  };
  
  const endWorkSession = (wasCompleted: boolean) => {
    const newSessionCount = state.sessionCount + 1;
    const nextSessionType = newSessionCount % 4 === 0 ? 'longBreak' : 'shortBreak';
    
    setState({
        ...state,
        isActive: true, // Auto-start break
        sessionType: nextSessionType,
        sessionCount: newSessionCount,
        startTime: Date.now(),
        elapsedTime: 0,
    });
    setIsTimerVisible(true);
  }

  const skipTimer = () => {
    if (state.sessionType === 'work') {
        endWorkSession(false);
    } else { // Is a break
        setState(s => ({
            ...s,
            isActive: false,
            sessionType: 'work',
            startTime: null,
            elapsedTime: 0,
        }));
        setIsTimerVisible(false);
    }
  };
  
  const setManualDuration = (duration: number) => {
      if (!state.isActive) {
          setState(s => ({ ...s, manualDuration: duration, elapsedTime: 0 }));
      }
  };

  const value: TimerContextProps = {
    sessionType: state.sessionType,
    isActive: state.isActive,
    sessionCount: state.sessionCount,
    manualDuration: state.manualDuration,
    startTime: state.startTime,
    timeLeft,
    isTimerVisible,
    setIsTimerVisible,
    setManualDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    endWorkSession,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
