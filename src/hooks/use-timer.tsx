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

export type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface TimerContextProps {
  sessionType: SessionType;
  timeLeft: number;
  isActive: boolean;
  sessionCount: number;
  isTimerVisible: boolean;
  manualDuration: number;
  setManualDuration: (duration: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  endWorkSession: (wasCompleted: boolean) => void;
}

const TimerContext = createContext<TimerContextProps | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [settings] = useSettings();
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isTimerVisible, setIsTimerVisible] = useState(false);

  // Allow manual duration for work sessions
  const [manualDuration, setManualDuration] = useState(settings.pomodoro.work);

   const getTimerDuration = useCallback(() => {
    switch (sessionType) {
      case 'work':
        return manualDuration * 60;
      case 'shortBreak':
        return settings.pomodoro.shortBreak * 60;
      case 'longBreak':
        return settings.pomodoro.longBreak * 60;
    }
  }, [settings, sessionType, manualDuration]);

  const [timeLeft, setTimeLeft] = useState(getTimerDuration());
  
  // Update timeLeft when duration changes (and timer is not active)
  useEffect(() => {
    if (!isActive) {
        setTimeLeft(getTimerDuration());
    }
  }, [getTimerDuration, isActive]);

  // Main timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // This will be handled by the page, which calls endWorkSession
      // We just pause the timer here.
      setIsActive(false);
      setIsTimerVisible(false); // Hide timer when it hits zero, page will show dialog
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);
  
  // When settings change, update manual duration if timer is not active
  useEffect(() => {
    if (!isActive) {
      setManualDuration(settings.pomodoro.work);
    }
  }, [settings?.pomodoro.work, isActive]);


  const startTimer = () => {
    if (timeLeft > 0) {
        setIsActive(true);
        setIsTimerVisible(true);
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getTimerDuration());
    setIsTimerVisible(false);
  };

  const skipTimer = () => {
    setIsActive(false);
    setIsTimerVisible(false); // Hide timer, let the page handle what's next
  };
  
  const endWorkSession = (wasCompleted: boolean) => {
    const newSessionCount = sessionCount + 1;
    setSessionCount(newSessionCount);
    if (newSessionCount % 4 === 0) {
        setSessionType('longBreak');
    } else {
        setSessionType('shortBreak');
    }
    // Automatically start the break timer
    setIsActive(true);
    setIsTimerVisible(true);
  }

  const value = {
    sessionType,
    timeLeft,
    isActive,
    sessionCount,
    isTimerVisible,
    manualDuration,
    setManualDuration: (duration: number) => {
        if (!isActive) {
            setManualDuration(duration);
        }
    },
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
