'use client';

import RankTable from '@/components/generic/RankTable';
import TableColumns from '@/components/helpers/TableColumns';
import { useNavigation } from '@/components/hooks/useNavigation';
import { useAppSelector } from '@/redux/hooks';
import { Objector } from '@esmalley/ts-utils';
import SentimentVeryDissatisfiedIcon from '@esmalley/react-material-icons/SentimentVeryDissatisfied';
import { Paper, Typography, useTheme } from '@esmalley/react-material-ui';
import { Fantasy } from '@srating-io/types';

/**
 * The league leaderboard. The entry page shows the same table, so the rows can be supplied as
 * props from whichever slice the caller is on; left out, they come from the league slice as before.
 */
const Ranking = (
  {
    fantasy_group: fantasy_group_prop,
    fantasy_rankings: fantasy_rankings_prop,
    fantasy_entrys: fantasy_entrys_prop,
    highlight_fantasy_entry_id,
  }:
  {
    fantasy_group?: Fantasy.FantasyGroup;
    fantasy_rankings?: Fantasy.FantasyRankings;
    fantasy_entrys?: Fantasy.FantasyEntrys;
    highlight_fantasy_entry_id?: string;
  } = {},
) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const group_fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const group_fantasy_rankings = useAppSelector((state) => state.fantasyGroupReducer.fantasy_rankings);
  const group_fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);

  const fantasy_group = fantasy_group_prop || group_fantasy_group;
  const fantasy_rankings = fantasy_rankings_prop || group_fantasy_rankings;
  const fantasy_entrys = fantasy_entrys_prop || group_fantasy_entrys;

  type Row = Fantasy.FantasyRanking & {name: string; rank_delta_combo: string;}

  const rows: Row[] = [];
  for (const fantasy_ranking_id in fantasy_rankings) {
    const row = Objector.deepClone(fantasy_rankings[fantasy_ranking_id]) as Row;

    row.rank_delta_combo = `${row.rank_delta_one || '-'}/${row.rank_delta_seven || '-'}`;
    row.name = 'UNK';

    if (row.fantasy_entry_id && row.fantasy_entry_id in fantasy_entrys) {
      const fantasy_entry = fantasy_entrys[row.fantasy_entry_id];

      row.name = fantasy_entry.name;
    }

    // `RankTable` cannot style one row, so the entry being viewed is marked in its own name cell.
    if (highlight_fantasy_entry_id && row.fantasy_entry_id === highlight_fantasy_entry_id) {
      row.name = `${row.name} (you)`;
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
