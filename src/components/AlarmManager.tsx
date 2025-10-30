import { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Trash2, Clock, Volume2, VolumeX, CheckCircle, XCircle } from 'lucide-react';
import type { Alarm } from '../types';

interface AlarmManagerProps {
  alarms: Alarm[];
  onAddAlarm: () => void;
  onDeleteAlarm: (id: string) => void;
  onDismissAlarm: (id: string) => void;
}

export function AlarmManager({ alarms, onAddAlarm, onDeleteAlarm, onDismissAlarm }: AlarmManagerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [triggeredAlarms, setTriggeredAlarms] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationPermission = useRef<NotificationPermission>('default');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      notificationPermission.current = Notification.permission;
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          notificationPermission.current = permission;
        });
      }
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0;

    oscillator.start();

    audioRef.current = {
      play: () => {
        const beepDuration = 200;
        const pauseDuration = 100;
        const repeats = 5;

        for (let i = 0; i < repeats; i++) {
          setTimeout(() => {
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + beepDuration / 1000);
          }, i * (beepDuration + pauseDuration));
        }
      }
    } as any;

    return () => {
      oscillator.stop();
      audioContext.close();
    };
  }, []);

  useEffect(() => {
    alarms.forEach((alarm) => {
      if (alarm.status === 'active' && !triggeredAlarms.has(alarm.id)) {
        const alarmTime = new Date(alarm.alarm_datetime);
        const timeDiff = alarmTime.getTime() - currentTime.getTime();

        if (timeDiff <= 0 && timeDiff > -5000) {
          setTriggeredAlarms((prev) => new Set(prev).add(alarm.id));
          triggerAlarm(alarm);
        }
      }
    });
  }, [currentTime, alarms, triggeredAlarms]);

  const triggerAlarm = (alarm: Alarm) => {
    if (alarm.sound_enabled && audioRef.current) {
      audioRef.current.play();
    }

    if (alarm.notification_enabled) {
      if (notificationPermission.current === 'granted') {
        const notification = new Notification('Alarm: ' + alarm.title, {
          body: alarm.notes || 'Your scheduled alarm is going off!',
          icon: '/favicon.ico',
          tag: alarm.id,
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
          onDismissAlarm(alarm.id);
        };
      } else {
        alert(`ALARM: ${alarm.title}\n\n${alarm.notes || 'Your scheduled alarm is going off!'}`);
        onDismissAlarm(alarm.id);
      }
    } else {
      alert(`ALARM: ${alarm.title}\n\n${alarm.notes || 'Your scheduled alarm is going off!'}`);
      onDismissAlarm(alarm.id);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeUntil = (dateTimeStr: string) => {
    const alarmTime = new Date(dateTimeStr);
    const diff = alarmTime.getTime() - currentTime.getTime();

    if (diff < 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const activeAlarms = alarms.filter((a) => a.status === 'active').sort((a, b) =>
    new Date(a.alarm_datetime).getTime() - new Date(b.alarm_datetime).getTime()
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Alarms</h2>
            <p className="text-sm text-gray-600">
              {activeAlarms.length} active alarm{activeAlarms.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={onAddAlarm}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all flex items-center gap-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          New Alarm
        </button>
      </div>

      {activeAlarms.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Alarms</h3>
          <p className="text-gray-600 text-sm">
            Create an alarm to get reminded about your scheduled posts
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeAlarms.map((alarm) => {
            const isPast = new Date(alarm.alarm_datetime).getTime() < currentTime.getTime();
            return (
              <div
                key={alarm.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  isPast
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-orange-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg truncate">
                        {alarm.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        {alarm.sound_enabled ? (
                          <Volume2 className="w-4 h-4 text-orange-600" title="Sound enabled" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-gray-400" title="Sound disabled" />
                        )}
                        {alarm.notification_enabled && (
                          <Bell className="w-4 h-4 text-orange-600" title="Notifications enabled" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(alarm.alarm_datetime)}</span>
                      </div>
                    </div>

                    <div className={`text-sm font-semibold ${isPast ? 'text-red-600' : 'text-orange-600'}`}>
                      {isPast ? 'ALARM TRIGGERED' : `Rings in: ${getTimeUntil(alarm.alarm_datetime)}`}
                    </div>

                    {alarm.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">{alarm.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {isPast && (
                      <button
                        onClick={() => onDismissAlarm(alarm.id)}
                        className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        title="Dismiss alarm"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteAlarm(alarm.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete alarm"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
