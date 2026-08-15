'use client';

import RankTable from '@/components/generic/RankTable';
import TableColumns from '@/components/helpers/TableColumns';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useAppSelector } from '@/redux/hooks';
import { Objector } from '@esmalley/ts-utils';
import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import { Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';

const Ranking = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_rankings = useAppSelector((state) => state.fantasyGroupReducer.fantasy_rankings);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);

  type Row = General.FantasyRanking & {name: string; rank_delta_combo: string;}

  const rows: Row[] = [];
  for (const fantasy_ranking_id in fantasy_rankings) {
    const row = Objector.deepClone(fantasy_rankings[fantasy_ranking_id]) as Row;

    row.rank_delta_combo = `${row.rank_delta_one || '-'}/${row.rank_delta_seven || '-'}`;
    row.name = 'UNK';

    if (row.fantasy_entry_id && row.fantasy_entry_id in fantasy_entrys) {
      const fantasy_entry = fantasy_entrys[row.fantasy_entry_id];

      row.name = fantasy_entry.name;
    }

    rows.push(row);
  }


  const headCells = TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'fantasy' });
  const columns = ['rank', 'name', 'rank_delta_combo', 'points'];


  const getContents = () => {
    if (rows.length) {
      return (
        <RankTable
          rows={rows}
          columns={headCells}
          displayColumns={columns}
          rowKey = 'fantasy_ranking_id'
          defaultSortOrder = 'asc'
          defaultSortOrderBy = 'rank'
          sessionStorageKey='fantasy_ranking_leaderboard'
          handleRowClick={(fantasy_ranking_id) => {
            const fantasy_ranking = fantasy_rankings[fantasy_ranking_id];
            navigation.fantasy_entry(`/fantasy_entry/${fantasy_ranking.fantasy_entry_id}`);
          }}
        />
      );
    }

    return (
      <Paper style={{ padding: 16 }}>
        <div style = {{ padding: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', fontStyle: 'italic', color: theme.text.secondary }}>
          <span style = {{ display: 'flex', marginRight: 10 }}><SentimentVeryDissatisfiedIcon style = {{ fontSize: 24 }} /></span>
          <Typography type = 'body1' style = {{ color: theme.text.secondary }}>No rankings yet!</Typography>
        </div>
      </Paper>
    );
  };



  return (
    <div>
      <Typography type = 'h6'>Leaderboard</Typography>
      {getContents()}
    </div>
  );
};

export default Ranking;
