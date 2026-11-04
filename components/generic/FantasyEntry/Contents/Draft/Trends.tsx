'use client';

import { useAppSelector } from '@/redux/hooks';
import Panel, { Empty } from '@/components/generic/Dashboard/Panel';
import { ChartLine, getChartPalette } from '@/components/generic/Chart';
import { isRotoScoring } from '@/components/helpers/FantasyScoring';
import ShowChartIcon from '@esmalley/react-material-icons/ShowChart';
import LeaderboardIcon from '@esmalley/react-material-icons/Leaderboard';
import PieChartIcon from '@esmalley/react-material-icons/PieChart';
import { Typography, useTheme } from '@esmalley/react-material-ui';
import { Dates } from '@esmalley/ts-utils';
import React from 'react';


const Trends = () => {
  const theme = useTheme();
  const palette = getChartPalette(theme);

  const fantasy_entry = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry);
  const fantasy_group = useAppSelector((state) => state.fantasyEntryReducer.fantasy_group);
  const fantasy_ranking_history = useAppSelector((state) => state.fantasyEntryReducer.fantasy_ranking_history);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_players);
  const player_team_seasons = useAppSelector((state) => state.fantasyEntryReducer.player_team_seasons);
  const players = useAppSelector((state) => state.fantasyEntryReducer.players);
  const fantasy_entry_player_statistic_rankings = useAppSelector((state) => state.fantasyEntryReducer.fantasy_entry_player_statistic_rankings);

  const { fantasy_entry_id } = fantasy_entry;
  const isRoto = isRotoScoring(fantasy_group.draft_scoring_terminology_id);

  const history = Object.values(fantasy_ranking_history || {})
    .filter((row) => row.fantasy_entry_id === fantasy_entry_id)
    .sort((a, b) => Dates.parse(a.date_of_rank, true).getTime() - Dates.parse(b.date_of_rank, true).getTime())
    .map((row) => ({
      date: Dates.format(row.date_of_rank, 'M jS'),
      points: row.points,
      rank: row.rank,
    }));

  // Who is actually carrying this entry. Built from the season totals, which are always present,
  // so this panel works whether or not the history rows have shipped.
  const share_rows: { name: string; score: number; share: number }[] = [];

  let total = 0;

  for (const id in fantasy_entry_player_statistic_rankings) {
    const row = fantasy_entry_player_statistic_rankings[id];

    if (row.fantasy_entry_id !== fantasy_entry_id) {
      continue;
    }

    const fantasy_entry_player = fantasy_entry_players[row.fantasy_entry_player_id];
    const player_team_season = fantasy_entry_player && player_team_seasons[fantasy_entry_player.player_team_season_id];
    const player = player_team_season && players[player_team_season.player_id];

    if (!player) {
      continue;
    }

    const score = +(row.rating || 0);

    total += score;
    share_rows.push({
      name: (player.first_name ? `${player.first_name.charAt(0)}. ` : '') + player.last_name,
      score,
      share: 0,
    });
  }

  for (const row of share_rows) {
    row.share = total > 0 ? (row.score / total) * 100 : 0;
  }

  share_rows.sort((a, b) => b.score - a.score);

  const getShare = (): React.JSX.Element => {
    if (isRoto) {
      return <Empty message = 'Roto scores the whole entry at once, so there is no per player share.' />;
    }

    if (!share_rows.length || total <= 0) {
      return <Empty message = 'No player has scored yet.' />;
    }

    return (
      <div>
        {share_rows.map((row, index) => (
          <div key = {row.name} style = {{ marginBottom: 8 }}>
            <div style = {{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Typography type = 'body2'>{row.name}</Typography>
              <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
                {`${+row.share.toFixed(1)}% · ${+row.score.toFixed(1)}`}
              </Typography>
            </div>
            <div style = {{ height: 6, borderRadius: 3, backgroundColor: theme.grey[theme.mode === 'light' ? 200 : 800] }}>
              <div style = {{
                height: 6,
                borderRadius: 3,
                width: `${Math.max(row.share, 0)}%`,
                // Color follows the entity, not its rank, so a player keeps their color as the
                // order moves.
                backgroundColor: palette.categorical[index % palette.categorical.length],
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  };


  return (
    <div>
      <Panel icon = {<PieChartIcon style = {{ color: theme.info.main, fontSize: 24 }} />} title = 'Who is carrying this entry'>
        {getShare()}
      </Panel>

      <Panel icon = {<ShowChartIcon style = {{ color: theme.info.main, fontSize: 24 }} />} title = 'Points over time'>
        {history.length > 1 ? (
          <ChartLine
            rows = {history}
            lines = {[{
              dataKey: 'points',
              name: 'Points',
              type: 'monotone',
              stroke: palette.categorical[0],
              strokeWidth: 2,
              dot: false,
              connectNulls: true,
            }]}
            XAxisDataKey = 'date'
            YAxisLabel = 'Points'
            YAxisProps = {{ allowDecimals: false, width: 70 }}
          />
        ) : <Empty message = 'Not enough history yet to draw a trend.' />}
      </Panel>

      <Panel icon = {<LeaderboardIcon style = {{ color: theme.info.main, fontSize: 24 }} />} title = 'Rank over time'>
        {history.length > 1 ? (
          // Rank and points are different scales, so they get a panel each rather than a second
          // y-axis. Reversed, because first place belongs at the top.
          <ChartLine
            rows = {history}
            lines = {[{
              dataKey: 'rank',
              name: 'Rank',
              type: 'monotone',
              stroke: palette.categorical[1 % palette.categorical.length],
              strokeWidth: 2,
              dot: false,
              connectNulls: true,
            }]}
            XAxisDataKey = 'date'
            YAxisLabel = 'Rank'
            YAxisProps = {{ allowDecimals: false, width: 70, reversed: true }}
          />
        ) : <Empty message = 'Not enough history yet to draw a trend.' />}
      </Panel>
    </div>
  );
};

export default Trends;
