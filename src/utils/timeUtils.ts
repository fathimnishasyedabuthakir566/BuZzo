/**
 * Checks if a scheduled time (HH:mm) is at or after the current time.
 */
export const isAfterCurrentTime = (scheduledTime: string): boolean => {
    const [scheduledHours, scheduledMinutes] = scheduledTime.split(":").map(Number);

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    if (scheduledHours > currentHours) return true;
    if (scheduledHours === currentHours && scheduledMinutes >= currentMinutes) return true;

    return false;
};

/**
 * Formats a single string for comparison or display
 */
export const getCurrentTimeString = (): string => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // "HH:mm"
};
