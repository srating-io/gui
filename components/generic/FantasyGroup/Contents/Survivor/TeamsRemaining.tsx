'use client';

import { Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';

/**
 * The teams an entry has spent, and what that leaves it.
 *
 * This is the strategy view, and the part no competitor ships. Survivor is only interesting
 * because a team is a resource: burning the best one tonight is cheap now and expensive in March.
 * Showing the count and the spent list is what makes that trade visible instead of something a
 * player has to track on paper.
 */
const TeamsRemaining = (
  {
    teams,
    used_team_ids,
    total_teams,
  }:
  {
    teams: General.Teams;
    used_team_ids: string[];
    total_teams: number;
  },
) => {
  const theme = useTheme();

  const used = used_team_ids
    .map((team_id) => teams[team_id])
    .filter((row) => !!row)
    .sort((a, b) => (a.name > b.name ? 1 : -1));

  const remaining = total_teams ? total_teams - used_team_ids.length : null;

  return (
    <div>
      <Typography type = 'h6'>Teams left</Typography>
      <Paper style = {{ padding: 16 }}>
        <Typography type = 'body1'>
          {
            remaining !== null
              ? `${remaining} of ${total_teams} still available to you`
              : `${used_team_ids.length} used so far`
          }
        </Typography>
        <Typography type = 'caption' style = {{ color: theme.text.secondary }}>
          Each team can only be used once, so the strong ones are worth saving.
        </Typography>
        {
          used.length
            ? used.map((row) => (
              <Tile
                key = {row.team_id}
                primary = {row.name}
                secondary = 'used'
              />
            ))
            : <Typography type = 'body1' style = {{ color: theme.text.secondary, fontStyle: 'italic' }}>Nothing spent yet.</Typography>
        }
      </Paper>
    </div>
  );
};

export default TeamsRemaining;
