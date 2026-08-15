'use client';

import { useState } from 'react';

import Organization from '@/components/helpers/Organization';
import RankTable from '@/components/generic/RankTable';
import HelperTeam from '@/components/helpers/Team';
import TableColumns from '@/components/helpers/TableColumns';
import { getAvailableChips } from '@/components/generic/Ranking/ColumnChipPicker';
import { useAppSelector } from '@/redux/hooks';
import { Objector, Textor } from '@esmalley/ts-utils';
import { Chip } from '@esmalley/react-material-ui';
import { Basketball, Football } from '@srating-io/types';



const TableView = ({ statistic_rankings }) => {
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const division_id = useAppSelector((state) => state.organizationReducer.division_id);
  const season = useAppSelector((state) => state.compareReducer.season);
  const teams = useAppSelector((state) => state.compareReducer.teams);
  const sessionStorageKey = `${organization_id}.COMPARE.TEAM`;
  const numberOfTeams = Organization.getNumberOfTeams({ organization_id, division_id, season });

  const [view, setView] = useState<string>('composite');
  const columns = TableColumns.getViewableColumns({ organization_id, view: 'team', columnView: view, customColumns: [], positions: [], career: false });

  for (let i = columns.length - 1; i >= 0; i--) {
    if (columns[i] === 'rank_delta_combo') {
      columns.splice(i, 1);
    }
  }


  const headCells = Objector.deepClone(TableColumns.getColumns({ organization_id, view: 'team' }));

  headCells.name.widths = {
    default: 50,
    425: 45,
  };

  const availableChips = getAvailableChips({ organization_id, view: 'team' });


  const chips: React.JSX.Element[] = [];

  const handleView = (value: string) => {
    sessionStorage.setItem(`${sessionStorageKey}.VIEW`, value);
    setView(value);
  };

  availableChips.forEach((value) => {
    chips.push(
      <Chip key = {value} style = {{ margin: '5px' }} title={Textor.toSentenceCase(value)} filled={(view === value)} value = {value} onClick={() => handleView(value)} />,
    );
  });

  const rows: Basketball.StatisticRanking[] | Football.StatisticRanking[] = [];

  for (const statistic_ranking_id in statistic_rankings) {
    const row = statistic_rankings[statistic_ranking_id];

    row.record = `${row.wins}-${row.losses}`;
    row.conf_record = `${row.confwins}-${row.conflosses}`;

    const teamHelper = new HelperTeam({ team: teams[row.team_id] });
    row.name = teamHelper.getNameShort();

    rows.push(row);
  }



  return (
    <div style = {{ padding: '0px 5px 20px 5px', textAlign: 'center' }}>
      <div style = {{ display: 'flex', justifyContent: 'center' }}>
        {chips}
      </div>
        <RankTable
          rows={rows}
          columns={headCells}
          displayColumns={columns}
          rowKey = 'team_id'
          defaultSortOrder = 'asc'
          defaultSortOrderBy = 'rank'
          sessionStorageKey = {sessionStorageKey}
          getRankSpanMax = {() => numberOfTeams}
        />
    </div>
  );
};

export default TableView;
