'use client';

import { useAppSelector } from '@/redux/hooks';

import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import { Paper, Tile, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';


const MyPicks = () => {
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_players);
  const fantasy_draft_orders = useAppSelector((state) => state.fantasyGroupReducer.fantasy_draft_orders);
  const player_team_seasons = useAppSelector((state) => state.fantasyGroupReducer.player_team_seasons);
  const players = useAppSelector((state) => state.fantasyGroupReducer.players);
  const user = useAppSelector((state) => state.userReducer.user);


  const fantasy_entry_id_x_fantasy_entry_players: {[fantasy_entry_id: string]: General.FantasyEntryPlayers} = {};
  const fantasy_entry_id_x_fantasy_draft_orders: {[fantasy_entry_id: string]: General.FantasyDraftOrders} = {};

  for (const fantasy_entry_player_id in fantasy_entry_players) {
    const row = fantasy_entry_players[fantasy_entry_player_id];

    if (!(row.fantasy_entry_id in fantasy_entry_id_x_fantasy_entry_players)) {
      fantasy_entry_id_x_fantasy_entry_players[row.fantasy_entry_id] = {};
    }

    fantasy_entry_id_x_fantasy_entry_players[row.fantasy_entry_id][fantasy_entry_player_id] = row;
  }

  for (const fantasy_draft_order_id in fantasy_draft_orders) {
    const row = fantasy_draft_orders[fantasy_draft_order_id];

    if (!(row.fantasy_entry_id in fantasy_entry_id_x_fantasy_draft_orders)) {
      fantasy_entry_id_x_fantasy_draft_orders[row.fantasy_entry_id] = {};
    }

    fantasy_entry_id_x_fantasy_draft_orders[row.fantasy_entry_id][fantasy_draft_order_id] = row;
  }

  const getEntry = (fantasy_entry_id) => {
    const fantasy_entry = fantasy_entrys[fantasy_entry_id];

    const tiles = Object.values(fantasy_entry_id_x_fantasy_draft_orders[fantasy_entry_id]).sort((a, b) => {
      return a.pick < b.pick ? -1 : 1;
    }).filter((row) => {
      if (!row.fantasy_entry_player_id) {
        return false;
      }

      return true;
    }).map((row) => {
      const player = (
        row.fantasy_entry_player_id &&
        row.fantasy_entry_player_id in fantasy_entry_players &&
        fantasy_entry_players[row.fantasy_entry_player_id].player_team_season_id &&
        fantasy_entry_players[row.fantasy_entry_player_id].player_team_season_id in player_team_seasons &&
        players[player_team_seasons[fantasy_entry_players[row.fantasy_entry_player_id].player_team_season_id].player_id]
      );
      const player_name = player ? `${player.first_name} ${player.last_name}` : 'Unknown';
      return (
        <Tile
          primary = {player_name}
        />
      );
    });

    return (
      <div>
        <Typography type = 'body1' style = {{ color: theme.info.main }}>{fantasy_entry.name}</Typography>
        {tiles}
      </div>
    );
  };

  const getContents = () => {
    const elements: React.JSX.Element[] = [];

    for (const fantasy_entry_id in fantasy_entrys) {
      const row = fantasy_entrys[fantasy_entry_id];

      if (
        row.user_id === user.user_id &&
        fantasy_entry_id in fantasy_entry_id_x_fantasy_entry_players &&
        fantasy_entry_id in fantasy_entry_id_x_fantasy_draft_orders
      ) {
        elements.push(getEntry(fantasy_entry_id));
      }
    }

    if (elements.length) {
      return elements;
    }

    return (
      <div style = {{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', fontStyle: 'italic', color: theme.text.secondary }}>
        <span style = {{ display: 'flex', marginRight: 10 }}><SentimentVeryDissatisfiedIcon style = {{ fontSize: 24 }} /></span>
        <Typography type = 'body1' style = {{ color: theme.text.secondary }}>Draft has not started yet!</Typography>
      </div>
    );
  };

  return (
    <div>
      <Typography type = 'h6'>My picks</Typography>
      <Paper style={{ padding: 20 }}>
        {getContents()}
      </Paper>
    </div>
  );
};

export default MyPicks;
