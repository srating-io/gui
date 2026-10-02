'use server';

import { Client, TrendsType } from '@/components/generic/Team/Contents/Trends/Client';
import { useServerAPI } from '@/components/serverAPI';
import { Team } from '@srating-io/types';

const Server = async ({ organization_id, division_id, team_id, season }) => {
  const revalidateSeconds = 60 * 60 * 6; // 6 hours

  /**
   * The schedule is the same call the schedule tab makes, against the same cache entry.
   *
   * The accuracy chart needs the opponent behind each game, which getTrends does not carry - its
   * games are the dates and the scores. Asking for the schedule here is one cached request rather
   * than naming opponents by id. Both are in flight at once, so the page waits for the slower of
   * the two instead of their sum.
   */
  const [data, schedule]: [TrendsType, Team.getScheduleResults] = await Promise.all([
    useServerAPI({
      class: 'team',
      function: 'getTrends',
      arguments: {
        organization_id,
        division_id,
        team_id,
        season,
      },
      cache: revalidateSeconds,
    }),
    useServerAPI({
      class: 'team',
      function: 'getSchedule',
      arguments: {
        organization_id,
        division_id,
        team_id,
        season,
      },
      cache: 60,
    }),
  ]);

  return (
    <>
      <Client organization_id = {organization_id} division_id = {division_id} team_id = {team_id} season = {season} data = {data} schedule = {schedule} />
    </>
  );
};

export default Server;
