'use client';

import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import StatsGraph from './StatsGraph';
import { LinearProgress, useTheme } from '@esmalley/react-material-ui';
import { Basketball, Football, General } from '@srating-io/types';


export interface TrendsType {
  games: General.Games;
  player_statistic_rankings: Basketball.PlayerStatisticRankings | Football.PlayerStatisticRankings;
  league_player_statistic_rankings: Basketball.LeaguePlayerStatisticRankings | Football.LeaguePlayerStatisticRankings;
  conference_statistic_rankings: Basketball.ConferenceStatisticRankings | Football.ConferenceStatisticRankings;
  conference_player_statistic_rankings: Basketball.ConferencePlayerStatisticRankings | Football.ConferencePlayerStatisticRankings;
  player_boxscores: Basketball.PlayerBoxscores | Football.PlayerBoxscores;
}

const padding = 5;

/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style={{ padding }}>
      {children}
    </div>
  );
};

const ClientSkeleton = () => {
  const theme = useTheme();
  const heightToRemove = padding + footerNavigationHeight + headerBarHeight + 190;
  return (
    <Contents>
      <div style = {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: `calc(100vh - ${heightToRemove}px)`,
      }}>
        <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
      </div>
    </Contents>
  );
};

const Client = (
  { organization_id, division_id, season, player_id, data }:
  { organization_id: string, division_id: string, season: number, player_id: string, data: TrendsType },
) => {
  const games = (data && data.games) || {};
  const player_statistic_rankings = (data && data.player_statistic_rankings) || {};
  const conference_player_statistic_rankings = (data && data.conference_player_statistic_rankings) || {};
  const league_player_statistic_rankings = (data && data.league_player_statistic_rankings) || {};
  const player_boxscores = (data && data.player_boxscores) || {};

  return (
    <Contents>
      <StatsGraph organization_id = {organization_id} division_id = {division_id} season = {season} player_statistic_rankings = {player_statistic_rankings} games = {games} league_player_statistic_rankings = {league_player_statistic_rankings} conference_player_statistic_rankings = {conference_player_statistic_rankings} player_boxscores = {player_boxscores} />
    </Contents>
  );
};

export { Client, ClientSkeleton };
