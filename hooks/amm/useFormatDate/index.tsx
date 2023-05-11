export function useFormatDate(timestamp: number): string {
  const ONE_MINUTE = 60
  const ONE_HOUR = 60 * ONE_MINUTE
  const ONE_DAY = 24 * ONE_HOUR
  const ONE_WEEK = 7 * ONE_DAY

  const now = Date.now()
  const secondsAgo = (now - timestamp) / 1000

  if (secondsAgo < ONE_MINUTE) {
    return 'just now';
  } else if (secondsAgo < ONE_HOUR) {
    const minutesAgo = Math.floor(secondsAgo / ONE_MINUTE);
    return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < ONE_DAY) {
    const hoursAgo = Math.floor(secondsAgo / ONE_HOUR);
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < ONE_WEEK) {
    const daysAgo = Math.floor(secondsAgo / ONE_DAY);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  } else {
    const weeksAgo = Math.floor(secondsAgo / ONE_WEEK);
    return `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`;
  }
}