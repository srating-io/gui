'use client';

import React, { useTransition } from 'react';


import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import HelperGame from '@/components/helpers/Game';
import Url from '@/components/helpers/Url';
import Locked from '@/components/generic/Billing/Locked';
import { useRouter } from 'next/navigation';
import { setLoading } from '@/redux/features/loading-slice';
import General from '@/components/helpers/General';
import { Color, Objector } from '@esmalley/ts-utils';
import {
  Skeleton, Table, Tbody, Td, Thead, Tr, Typography, useTheme,
} from '@esmalley/react-material-ui';


const TableView = ({ sorted_games, team_id }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isLoadingPredictions = useAppSelector((state) => state.teamReducer.schedulePredictionsLoading);

  const bestColor = General.getBestColor();
  const worstColor = General.getWorstColor();


  const router = useRouter();
  const [isPending, startTransition] = useTransition();


  const headCells = [
    {
      id: 'start_date',
      label: 'Date',
    },
    {
      id: 'team',
      label: 'Opponent',
    },
    {
      id: 'score',
      label: 'Score',
    },
    {
      id: 'prediction',
      label: 'Prediction',
    },
  ];

  const handleGameClick = (game) => {
    dispatch(setLoading(true));
    startTransition(() => {
      router.push(Url.game({ organization_id: game.organization_id, game }));
    });
  };

  const trStyle = {
    '&:hover td': {
      backgroundColor: theme.mode === 'light' ? theme.info.light : theme.info.dark,
    },
    '&:hover': {
      cursor: 'pointer',
    },
  };

  const rowContainers: React.JSX.Element[] = [];
  for (let i = 0; i < sorted_games.length; i++) {
    const game = sorted_games[i];

    const Game = new HelperGame({
      game,
    });

    const won = (game.home_score > game.away_score && game.home_team_id === team_id) || (game.home_score < game.away_score && game.away_team_id === team_id);
    const otherSide = game.home_team_id === team_id ? 'away' : 'home';

    const tableCells: React.JSX.Element[] = [];

    let tdColor = (i % 2 === 0 ? theme.grey[800] : theme.grey[900]);

    if (theme.mode === 'light') {
      tdColor = i % 2 === 0 ? theme.grey[200] : theme.grey[300];
    }



    for (let j = 0; j < headCells.length; j++) {
      const column = headCells[j];

      if (column.id === 'start_date') {
        tableCells.push(<Td key = {j} style = {{ padding: '6px' }}>{`${Game.getStartDate(null)} - ${Game.getStartTime()}`}</Td>);
      } else if (column.id === 'team') {
        tableCells.push(<Td key = {j} style = {{ padding: '6px' }}>{game.home_team_id === team_id ? 'vs' : '@'} {Game.getTeamName(otherSide)}</Td>);
      } else if (column.id === 'score') {
        let scoreText = '-';
        if (Game.isFinal()) {
          scoreText = `${(won ? 'W ' : 'L ') + game.home_score}-${game.away_score}`;
        } else if (Game.isInProgress()) {
          scoreText = 'Live';
        }
        tableCells.push(<Td key = {j} style = {{ padding: '6px' }}>{scoreText}</Td>);
      } else if (column.id === 'prediction') {
        const predictionContainer: React.JSX.Element[] = [];
        const hasAccessToPercentages = !(!game.prediction || (game.prediction.home_percentage === null && game.prediction.home_percentage === null));

        if (isLoadingPredictions) {
          predictionContainer.push(<Skeleton style = {{ backgroundColor: theme.grey[500] }} key = {i} />);
        } else if (!hasAccessToPercentages) {
          predictionContainer.push(<Locked iconFontSize={null} key = {i} />);
        } else {
          const winPercentage = (game.home_team_id === team_id ? +(game.prediction.home_percentage * 100).toFixed(0) : +(game.prediction.away_percentage * 100).toFixed(0));
          predictionContainer.push(<Typography key = {'win_percent'} type = 'caption' style = {{ color: Color.lerpColor(worstColor, bestColor, winPercentage / 100) }}>{winPercentage}%</Typography>);
        }
        tableCells.push(<Td key = {j} style = {{ padding: '6px', width: 75 }}>{predictionContainer}</Td>);
      }
    }

    rowContainers.push(
      <Tr
        style = {Objector.extender({}, trStyle, { backgroundColor: tdColor })}
        key={game.game_id}
        onClick={() => { handleGameClick(game); }}
      >
        {tableCells}
      </Tr>,
    );
  }

  return (
    <>
      <Table>
        <Thead>
          <Tr>
            {headCells.map((headCell) => {
              const tdStyle = {
                padding: '4px 5px',
                whiteSpace: 'nowrap',
                backgroundColor: theme.mode === 'light' ? theme.grey[200] : theme.grey[900],
              };

              return (
                <Td
                  style = {tdStyle}
                  key={headCell.id}
                >
                  {headCell.label}
                </Td>
              );
            })}
          </Tr>
        </Thead>
        <Tbody>
          {rowContainers}
        </Tbody>
      </Table>
    </>
  );
};

export default TableView;
