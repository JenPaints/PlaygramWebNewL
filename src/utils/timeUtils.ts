/**
 * Utility functions for time formatting
 */

/**
 * Converts 24-hour time format to 12-hour format
 * @param time24 - Time in 24-hour format (e.g., "17:00")
 * @returns Time in 12-hour format (e.g., "5:00 PM")
 */
export const formatTo12Hour = (time24: string): string => {
  if (!time24 || !time24.includes(':')) {
    return time24;
  }

  const [hours, minutes] = time24.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return time24;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Formats a time range from 24-hour to 12-hour format
 * @param startTime - Start time in 24-hour format (e.g., "17:00")
 * @param endTime - End time in 24-hour format (e.g., "18:30")
 * @returns Formatted time range (e.g., "5:00 PM - 6:30 PM")
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  const formattedStart = formatTo12Hour(startTime);
  const formattedEnd = formatTo12Hour(endTime);
  return `${formattedStart} - ${formattedEnd}`;
};

/**
 * Formats time using Intl.DateTimeFormat with 12-hour format
 * @param time - Time string in 24-hour format
 * @returns Formatted time string
 */
export const formatTimeIntl = (time: string): string => {
  if (!time || !time.includes(':')) {
    return time;
  }

  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(`2000-01-01T${time}`));
  } catch {
    return formatTo12Hour(time);
  }
};

/**
 * Formats a timestamp to 12-hour time format
 * @param timestamp - Unix timestamp
 * @returns Formatted time string
 */
export const formatTimestampTo12Hour = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a timestamp to include date and 12-hour time
 * @param timestamp - Unix timestamp
 * @returns Formatted date and time string
 */
export const formatDateTimeWith12Hour = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
};