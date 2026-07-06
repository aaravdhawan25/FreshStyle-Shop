export const MIN_CANCELLATION_NOTICE_MS = 3 * 60 * 60 * 1000;

export function canCancel(startTimeIso: string, nowMs: number = Date.now()): boolean {
  return new Date(startTimeIso).getTime() - nowMs >= MIN_CANCELLATION_NOTICE_MS;
}
