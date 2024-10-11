'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ReactConfetti from 'react-confetti';
import { BreakTime, breakTimes } from '@/types/breaTimes';

function getNextBreakTime(now: Date): BreakTime | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayBreak = breakTimes.find((breakTime) => {
    const breakMinutes = breakTime.hour * 60 + breakTime.minute;
    return breakMinutes > currentMinutes;
  });

  return todayBreak || breakTimes[0];
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = milliseconds % 1000;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

export default function BreakTimer() {
  const [nextBreak, setNextBreak] = useState<BreakTime | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);

  const sendNotification = useCallback(
    (title: string, body: string) => {
      const now = Date.now();
      if (now - lastNotificationTime > 60000) {
        // Only send notification if more than 1 minute has passed
        new Notification(title, { body });
        setLastNotificationTime(now);
      }
    },
    [lastNotificationTime]
  );

  useEffect(() => {
    // Load notification preference from localStorage
    const storedPreference = localStorage.getItem('notificationsEnabled');
    if (storedPreference !== null) {
      setNotificationsEnabled(storedPreference === 'true');
    }

    const timer = setInterval(() => {
      const now = new Date();
      const next = getNextBreakTime(now);
      setNextBreak(next);

      if (next) {
        const nextTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          next.hour,
          next.minute
        );

        // If the next break is earlier in the day than the current time, it's tomorrow
        if (nextTime.getTime() <= now.getTime()) {
          nextTime.setDate(nextTime.getDate() + 1);
        }

        const diff = Math.max(0, nextTime.getTime() - now.getTime());
        setTimeLeft(diff);

        if (notificationsEnabled) {
          const fiveMinutesBeforeBreak = 5 * 60 * 1000;
          if (diff <= fiveMinutesBeforeBreak && diff > fiveMinutesBeforeBreak - 1000) {
            sendNotification(
              `5 minutes until ${next.label}`,
              `Your ${next.label} break starts in 5 minutes!`
            );
          } else if (diff < 1000 && diff > 0) {
            sendNotification(`Time for ${next.label}!`, `Your ${next.label} break starts now!`);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
          }
        }
      }
    }, 10); // Update every 10ms for smooth millisecond display

    return () => clearInterval(timer);
  }, [notificationsEnabled, sendNotification]);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {showConfetti && <ReactConfetti />}
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Break Timer</CardTitle>
        </CardHeader>
        <CardContent>
          {nextBreak ? (
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Next break: {nextBreak.label}</p>
              <p className="text-4xl font-bold mb-4">{formatTime(timeLeft)}</p>
              <p className="text-sm text-gray-500 mb-4">
                Time until {nextBreak.hour.toString().padStart(2, '0')}:
                {nextBreak.minute.toString().padStart(2, '0')}
              </p>
            </div>
          ) : (
            <p className="text-center">No upcoming breaks</p>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
            <Label htmlFor="notifications">Enable Notifications</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
