'use client';

import { useAppSelector } from '@/redux/hooks';
import Organization from '@/components/helpers/Organization';
import General from '@/components/helpers/General';
import { Color } from '@esmalley/ts-utils';
import { Skeleton } from '@esmalley/react-material-ui';
import { Game } from '@srating-io/types';


const ConferenceRank = (
  { game, conference_id }:
  { game: Game.GameWithOddsAndTeams; conference_id: string; },
) => {
  const conferenceStats = useAppSelector((state) => state.gameReducer.conferenceStats);
  const gameStatsLoading = useAppSelector((state) => state.gameReducer.gameStatsLoading);
  const displayRank = useAppSelector((state) => state.displayReducer.rank);

  const numberOfConferences = Organization.getNumberOfConferences({ organization_id: game.organization_id, division_id: game.division_id, season: game.season });

  // const current = (conferenceStats[game.game_id] && conferenceStats[game.game_id].current[conference_id]) || null;
  const historical = (conferenceStats[game.game_id] && conferenceStats[game.game_id].historical[conference_id]) || null;
  const statistic_ranking = historical;

  const bestColor = General.getBestColor();
  const worstColor = General.getWorstColor();

  let rank = null;
  if (statistic_ranking) {
    rank = displayRank in statistic_ranking ? statistic_ranking[displayRank] : statistic_ranking.rank;
  }

  const supFontSize = 10;

  const supRankStyle: React.CSSProperties = {
    fontSize: supFontSize,
    marginRight: '5px',
    fontWeight: 700,
  };

  if (rank) {
    supRankStyle.color = Color.lerpColor(bestColor, worstColor, (+(rank / numberOfConferences)));
  }


  return (
    <sup style = {supRankStyle}>
      {
        gameStatsLoading ?
        <Skeleton style={{ width: 10, height: 10, display: 'inline-block', marginRight: 2.5 }} />
          : rank || ''
      }
    </sup>
  );
};

export default ConferenceRank;
