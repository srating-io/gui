'use client';

import { useAppSelector } from '@/redux/hooks';


import SearchIcon from '@esmalley/react-material-icons/Search';
import { useCallback, useState } from 'react';
import TableColumns from '@/components/helpers/TableColumns';
import { getCachedDataKey } from '@/components/generic/Ranking/Contents/Loader';
import TeamSearch from './TeamSearch';
import { decorateHeaderRow, decorateRows } from '@/components/generic/Ranking/Contents/Client';
import DraftZonePick from './DraftZonePick';
import { Objector } from '@esmalley/ts-utils';
import { Columns, Inputs, LinearProgress, TextInput, Typography, useTheme, VirtualTable } from '@esmalley/react-material-ui';


const DraftZone = () => {
  const theme = useTheme();
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const loadingRankingData = useAppSelector((state) => state.rankingReducer.loadingView);
  const rankingData = useAppSelector((state) => state.cacheReducer.rankingData);

  const [playerSearchValue, setPlayerSearchValue] = useState('');
  const [selectedRow, setSelectedRow] = useState<object | null>(null);
  const [selectedTeamID, setSelectedTeamID] = useState<string | null>(null);


  const cached_key = getCachedDataKey({ organization_id: fantasy_group.organization_id, division_id: fantasy_group.division_id, season: fantasy_group.season, view: 'player', career: 0, career_active: 0 });

  const data: object = (
    rankingData &&
    cached_key in rankingData &&
    rankingData[cached_key].data
  ) ? Objector.deepClone(rankingData[cached_key].data) : {};

  let rows: object[] = [];
  for (const id in data) {
    const row = data[id];

    if (selectedTeamID && row.team_id !== selectedTeamID) {
      continue;
    }

    row.rank_delta_combo = `${row.rank_delta_one || '-'}/${row.rank_delta_seven || '-'}`;
    row.name = row.player ? (`${row.player.first_name} ${row.player.last_name}`) : null;

    row.number = (row.player_team_season && row.player_team_season.number) || (row.player && row.player.number) || null;
    row.position = (row.player_team_season && row.player_team_season.position) || (row.player && row.player.position) || null;
    row.height = (row.player_team_season && row.player_team_season.height) || (row.player && row.player.height) || null;
    row.weight = (row.player_team_season && row.player_team_season.weight) || (row.player && row.player.weight) || null;
    row.class_year = (row.player_team_season && row.player_team_season.class_year) || null;

    rows.push(row);
  }

  if (playerSearchValue) {
    const regex = new RegExp(playerSearchValue, 'i');
    rows = rows.filter((row) => {
      if ('name' in row && regex.test(row.name as string)) {
        return true;
      }


      return false;
    });
  }

  const columns = TableColumns.getColumns({ organization_id: fantasy_group.organization_id, view: 'player' });
  const displayColumns = TableColumns.getViewableColumns({ organization_id: fantasy_group.organization_id, view: 'player', columnView: 'composite', customColumns: [], positions: [], career: false });


  const inputHandler = new Inputs();


  const getContents = useCallback(() => {
    return (
      <VirtualTable
        rows={rows}
        columns={columns}
        displayColumns={displayColumns}
        rowKey = 'player_statistic_ranking_id'
        height={300}
        handleRowClick={(row) => {
          setSelectedRow(row);
        }}
        decorateRows={decorateRows}
        decorateHeaderRow={decorateHeaderRow}
        defaultSortOrder = 'asc'
        defaultSortOrderBy = {'rank'}
        sessionStorageKey = {`${fantasy_group.organization_id}.FANTASY.DRAFT`}
        // secondaryKey = 'secondary'
      />
    );
  }, [rows, columns, displayColumns]);




  const getContainer = () => {
    if (loadingRankingData) {
      return (
        <div style = {{ display: 'flex', justifyContent: 'center', height: 40, alignItems: 'center' }}>
          <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
        </div>
      );
    }

    return (
      <div>
        <DraftZonePick selectedRow = {selectedRow} onPick = {() => setSelectedRow(null)} />
        <Columns breakPoint={320}>
          <TeamSearch
            inputHandler={inputHandler}
            fantasy_group={fantasy_group}
            handleSelect={(val) => setSelectedTeamID(val)}
          />
          <TextInput
            inputHandler={inputHandler}
            placeholder='Player search'
            variant='filled'
            icon = {<SearchIcon style = {{ fontSize: 20 }} />}
            style = {{ borderRadius: 5 }}
            onChange = {(val) => setPlayerSearchValue(val as string)}
          />
        </Columns>
        {getContents()}
      </div>
    );
  };

  return (
    <div>
      <Typography type = 'h6'>Draft zone</Typography>
      {getContainer()}
    </div>
  );
};

export default DraftZone;
