/**
 * Utility to export matches to personal calendars.
 */

// Helper to format Date object into YYYYMMDDTHHmmssZ format (UTC)
const formatToUTCString = (date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generates a pre-filled Google Calendar event URL.
 */
export const getGoogleCalendarUrl = (match, p1Name, p2Name) => {
  const startDate = new Date(match.scheduled_at);
  if (isNaN(startDate.getTime())) return null;

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration
  
  const startStr = formatToUTCString(startDate);
  const endStr = formatToUTCString(endDate);
  
  const sportUpper = match.sport.charAt(0).toUpperCase() + match.sport.slice(1);
  const title = `${sportUpper} Match: ${p1Name} vs ${p2Name}`;
  const details = `League Championship booked match: ${p1Name} vs ${p2Name}.\nSport: ${match.sport}\nCourt: ${match.court || 'Main Court'}`;
  const location = match.court || 'Main Court';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
};

/**
 * Downloads a standard .ics (iCalendar) file for Apple Calendar, Outlook, etc.
 */
export const downloadICalFile = (match, p1Name, p2Name) => {
  const startDate = new Date(match.scheduled_at);
  if (isNaN(startDate.getTime())) return;

  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
  
  const startStr = formatToUTCString(startDate);
  const endStr = formatToUTCString(endDate);
  
  const sportUpper = match.sport.charAt(0).toUpperCase() + match.sport.slice(1);
  const title = `${sportUpper} Match: ${p1Name} vs ${p2Name}`;
  const details = `League Championship booked match: ${p1Name} vs ${p2Name}. Sport: ${match.sport}`;
  const location = match.court || 'Main Court';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChampionAce//LeagueCalendar//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${details}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
