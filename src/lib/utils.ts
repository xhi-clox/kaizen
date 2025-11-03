import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSimpleDate(date: string | Date | number) {
    return format(date, 'dd MMM, yyyy');
}

export function formatTime(date: string | Date | number) {
    return format(date, 'p');
}

export function formatDateTime(date: string | Date | number) {
    return format(date, 'dd MMM, yyyy p');
}

export function timeAgo(date: string | Date) {
    const dateToParse = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateToParse, { addSuffix: true });
}
