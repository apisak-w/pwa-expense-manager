import dayjs from './dayjs';

export type FormatLastSyncOptions = {
  nullLabel?: string; // text to show when timestamp is null
  justNowLabel?: string; // text to use when < 1 minute
  prefix?: string; // optional prefix to prepend to the relative text
};

export function formatLastSync(timestamp: number | null, opts?: FormatLastSyncOptions): string {
  const { nullLabel = 'Never', justNowLabel = 'Just now', prefix } = opts ?? {};

  if (!timestamp) return nullLabel;

  const date = dayjs(timestamp);

  if (dayjs().diff(date, 'minute') < 1) {
    const text = justNowLabel;
    return prefix ? `${prefix} ${text}` : text;
  }

  const rel = date.fromNow();

  return prefix ? `${prefix} ${rel}` : rel;
}

export default formatLastSync;
