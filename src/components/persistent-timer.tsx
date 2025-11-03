'use client';

import { useTimer, type SessionType } from '@/hooks/use-timer';
import { Card, CardContent } from './ui/card';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward } from 'lucide-react';
import { Button } from './ui/button';

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
};

const getSessionTypeInfo = (sessionType: SessionType) => {
    switch (sessionType) {
        case 'work': return { label: 'Focus', color: 'text-primary' };
        case 'shortBreak': return { label: 'Break', color: 'text-green-500' };
        case 'longBreak': return { label: 'Break', color: 'text-blue-500' };
        default: return { label: 'Timer', color: 'text-foreground' };
    }
}

export function PersistentTimer() {
    const { timeLeft, isActive, isTimerVisible, sessionType, pauseTimer, startTimer, skipTimer } = useTimer();
    const { label, color } = getSessionTypeInfo(sessionType);
    
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const timerRef = useRef<HTMLDivElement>(null);


    const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!timerRef.current) return;
        setIsDragging(true);
        const rect = timerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        // Prevent text selection while dragging
        e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y,
        });
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };
    
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);
    
    if (!isTimerVisible) return null;

    return (
        <div
            ref={timerRef}
            className="fixed z-50 cursor-grab"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                touchAction: 'none', // prevent scrolling on mobile
            }}
            onMouseDown={onMouseDown}
        >
            <Card className="w-48 shadow-lg">
                <CardContent className="p-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className={`text-xs font-bold ${color}`}>{label}</span>
                        <span className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</span>
                    </div>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={isActive ? pauseTimer : startTimer}>
                            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => skipTimer()}>
                            <SkipForward className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
