import { Fantasy } from '@srating-io/types';
import { Dates } from '@esmalley/ts-utils';


const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value: number): string => (value < 10 ? `0${value}` : `${value}`);


/**
 * A utc datetime's eastern calendar date, which is the day a slate actually belongs to.
 *
 * The api builds every window on eastern dates, so a 10pm et tip is already tomorrow in utc --
 * reading the date off the front of the string puts that game on the wrong round.
 */
export const getEasternDate = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  if (DATE_ONLY.test(value)) {
    return value;
  }

  const parts = Dates.getPartsInZone(Dates.parse(value, true), 'America/New_York');

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
};


/**
 * What the gui calls a slate.
 *
 * A daily league stores the date it covers as the name, so format it rather than printing
 * `2026-11-11` at someone. Noon local formatted local, which lands on the same calendar day at
 * every offset, unlike reading a bare `Y-m-d` as midnight.
 */
export const getSlateLabel = (fantasy_slate: Fantasy.FantasySlate | null | undefined): string => {
  if (!fantasy_slate) {
    return '';
  }

  const { name } = fantasy_slate;

  if (name && DATE_ONLY.test(name)) {
    return Dates.format(`${name} 12:00:00`, 'D, M j');
  }

  return name || `Round ${fantasy_slate.ordinal}`;
};


/**
 * The eastern dates a slate covers, inclusive. One day for a daily league, seven for a weekly one.
 *
 * Taken from the datetimes rather than `name`, which is only ever a label.
 */
export const getSlateEasternRange = (
  fantasy_slate: Fantasy.FantasySlate | null | undefined,
): { first: string; last: string } | null => {
  if (!fantasy_slate) {
    return null;
  }

  const first = getEasternDate(fantasy_slate.start_datetime);
  const last = getEasternDate(fantasy_slate.end_datetime) || first;

  if (!first || !last) {
    return null;
  }

  return { first, last };
};


/**
 * The slate covering a date, or null for a day whose round does not exist yet.
 *
 * Only two slates are ever open at once -- the api generates the rest lazily -- so most of a
 * league's days have no slate behind them.
 */
export const findSlateByDate = (
  fantasy_slates: Fantasy.FantasySlates | null | undefined,
  date: string | null | undefined,
): Fantasy.FantasySlate | null => {
  if (!date) {
    return null;
  }

  const found = Object.values(fantasy_slates || {}).find((row) => {
    const range = getSlateEasternRange(row);

    return !!range && date >= range.first && date <= range.last;
  });

  return found || null;
};
