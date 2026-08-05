'use client';

import Blank from '@/components/generic/Blank';
import { useAppSelector } from '@/redux/hooks';

// import EmojiEventsIcon from '@esmalley/react-material-icons/EmojiEvents';
import WorkspacePremiumIcon from '@esmalley/react-material-icons/WorkspacePremium';
import { Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';
// import SportsScoreIcon from '@esmalley/react-material-icons/SportsScore';

const Winner = () => {
  const theme = useTheme();

  // const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_rankings = useAppSelector((state) => state.fantasyGroupReducer.fantasy_rankings);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);
  const fantasy_group_users = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group_users);

  const user_id_x_fantasy_group_user = {};
  for (const fantasy_group_user_id in fantasy_group_users) {
    const row = fantasy_group_users[fantasy_group_user_id];

    user_id_x_fantasy_group_user[row.user_id] = row;
  }

  let winner_fantasy_ranking: General.FantasyRanking | null = null;

  for (const fantasy_ranking_id in fantasy_rankings) {
    const row = fantasy_rankings[fantasy_ranking_id];

    if (row.rank === 1) {
      winner_fantasy_ranking = row;
    }
  }

  const getContents = () => {
    if (!winner_fantasy_ranking) {
      return (
        <Blank text = 'No winner determined yet' />
      );
    }

    const fantasy_ranking = winner_fantasy_ranking;

    const fantasy_entry = fantasy_entrys[fantasy_ranking.fantasy_entry_id];

    let name = fantasy_entry.user_id;

    if (fantasy_entry.user_id in user_id_x_fantasy_group_user) {
      name = user_id_x_fantasy_group_user[fantasy_entry.user_id].name || user_id_x_fantasy_group_user[fantasy_entry.user_id].email;
    }

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
          <WorkspacePremiumIcon style = {{ color: theme.yellow[(theme.mode === 'dark' ? 500 : 900)], fontSize: 40 }} />
          <div style = {{ margin: '0px 10px' }}>
            <Typography type='h4'>{name}</Typography>
            <Typography type='body2' style={{ color: theme.text.secondary }}>{fantasy_ranking.points} Points</Typography>
          </div>
          <WorkspacePremiumIcon style = {{ color: theme.yellow[(theme.mode === 'dark' ? 500 : 900)], fontSize: 40 }} />
      </div>
    );
  };


  return (
    <div style = {{ textAlign: 'center' }}>
      <Typography type = 'h5'>League ended</Typography>
      {getContents()}
    </div>
  );
};

export default Winner;
