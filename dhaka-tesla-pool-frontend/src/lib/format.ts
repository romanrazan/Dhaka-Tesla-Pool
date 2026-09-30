export const formatBDT = (poisha: number | null | undefined) =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 })
    .format((poisha ?? 0) / 100);

export const formatZone = (zone: string) =>
  zone.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

