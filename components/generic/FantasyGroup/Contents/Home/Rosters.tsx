'use client';

import Roster from '@/components/generic/FantasyEntry/Contents/Draft/Roster';
import { useAppSelector } from '@/redux/hooks';

import KeyboardArrowLeftIcon from '@esmalley/react-material-icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@esmalley/react-material-icons/KeyboardArrowRight';
import { IconButton, Typography } from '@esmalley/react-material-ui';
import { useState } from 'react';

const Rosters = () => {
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_entry_players = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_players);
  const player_team_seasons = useAppSelector((state) => state.fantasyGroupReducer.player_team_seasons);
  const players = useAppSelector((state) => state.fantasyGroupReducer.players);
  const fantasy_entry_player_statistic_rankings = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entry_player_statistic_rankings);
  const fantasy_draft_orders = useAppSelector((state) => state.fantasyGroupReducer.fantasy_draft_orders);

  const keys = Object.keys(fantasy_entrys);

  const [selected, setSelected] = useState(keys[0]);

  const handleRotate = (e, direction: 'left' | 'right') => {
    if (keys.length === 0) return;

    const currentIndex = keys.indexOf(selected);

    if (direction === 'right') {
      // (0 + 1) % 5 = 1 ... (4 + 1) % 5 = 0 (wraps around)
      const nextIndex = (currentIndex + 1) % keys.length;
      setSelected(keys[nextIndex]);
    } else {
      // If index is 0, wrap to the last item, otherwise subtract 1
      const prevIndex = currentIndex === 0 ? keys.length - 1 : currentIndex - 1;
      setSelected(keys[prevIndex]);
    }
  };


  return (
    <div>
      <Typography type = 'h6'>Rosters</Typography>
      <div style = {{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <IconButton icon={<KeyboardArrowLeftIcon style = {{ fontSize: 24 }} />} value = {'left'} onClick={handleRotate} />
        <div style={{
          flex: 1, // Takes up all available space between buttons
          overflowX: 'auto', // Enables horizontal scrolling
          minWidth: 0, // Essential for flex children to allow shrinking/scrolling
        }}>
          <Roster
            fantasy_entry = {fantasy_entrys[selected]}
            fantasy_group = {fantasy_group}
            fantasy_entry_players={fantasy_entry_players}
            player_team_seasons={player_team_seasons}
            players={players}
            fantasy_entry_player_statistic_rankings = {fantasy_entry_player_statistic_rankings}
            fantasy_draft_orders = {fantasy_draft_orders}
          />
        </div>
        <IconButton icon={<KeyboardArrowRightIcon style = {{ fontSize: 24 }} />} value = {'right'} onClick={handleRotate} />
      </div>
    </div>
  );
};

export default Rosters;
