import { Basketball, Football, General } from '@srating-io/types';

export interface CustomizedTeam extends General.Team {
  conference_id?: string;
  division_id?: string;
  stats?: {
    statistic_ranking_id: string;
    rank: number;
    elo_rank: number;
    wins: number;
    losses: number;
    kenpom_rank?: number;
    srs_rank?: number;
    ap_rank?: number;
    coaches_rank?: number;
    net_rank?: number;
  }
}


export interface Bookmaker {
  title: string;
  key: string;
  money_line_away: number;
  money_line_home: number;
  spread_away: number;
  spread_home: number;
  over: number;
  under: number;
}

export type Bookmakers = {[key: string]: Bookmaker};

export type RankingTable = (
  Basketball.StatisticRanking |
  Basketball.PlayerStatisticRanking |
  Basketball.ConferenceStatisticRanking |
  Football.StatisticRanking |
  Football.PlayerStatisticRanking |
  Football.ConferenceStatisticRanking |
  General.CoachStatisticRanking
) & {
  name: string;
  committed?: boolean;
  committed_team_id?: string;
  committed_team_name?: string;
  committed_conference_id?: string;
  team_name?: string;
  player?: General.Player;
  player_team_season?: General.PlayerTeamSeason;
}

export interface RankingColumns {
  [key: string]: {
    id: string;
    numeric: boolean;
    label: string;
    tooltip: string;
    sort?: string;
    sticky?: boolean;
    disabled?: boolean;
  }
}



