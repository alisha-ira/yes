export interface RecurringSchedule {
  dates: Date[];
  frequency: string;
  dayOfWeek: string;
  time: string;
}

export function generateRecurringSchedule(
  startDate: string,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  preferredDay: string,
  numberOfPosts: number
): Date[] {
  const dates: Date[] = [];
  const daysMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  const targetDayOfWeek = daysMap[preferredDay.toLowerCase()];
  let currentDate = new Date(startDate);

  const daysToAdd = (targetDayOfWeek - currentDate.getDay() + 7) % 7;
  if (daysToAdd > 0) {
    currentDate.setDate(currentDate.getDate() + daysToAdd);
  }

  for (let i = 0; i < numberOfPosts; i++) {
    dates.push(new Date(currentDate));

    switch (frequency) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        const maxDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate();
        if (currentDate.getDate() > maxDay) {
          currentDate.setDate(maxDay);
        }
        break;
    }
  }

  return dates;
}

export function formatSchedulePreview(dates: Date[], time: string): string[] {
  return dates.map(date => {
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${dateStr} at ${time}`;
  });
}

export function getNextOccurrence(
  dayOfWeek: string,
  fromDate: Date = new Date()
): Date {
  const daysMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  const targetDay = daysMap[dayOfWeek.toLowerCase()];
  const currentDay = fromDate.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7;

  const nextDate = new Date(fromDate);
  nextDate.setDate(nextDate.getDate() + (daysUntilTarget || 7));

  return nextDate;
}
