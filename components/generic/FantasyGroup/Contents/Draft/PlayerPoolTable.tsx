'use client';

import { useMemo, useState } from 'react';

import SearchIcon from '@esmalley/react-material-icons/Search';
import { Columns, Inputs, TextInput, VirtualTable } from '@esmalley/react-material-ui';

import { useAppSelector } from '@/redux/hooks';
import ColumnChipPicker from '@/components/generic/Ranking/ColumnChipPicker';
import { createDecorateRows, decorateHeaderRow, decorateRows } from '@/components/generic/Ranking/Contents/Client';
import Url from '@/components/helpers/Url';
import TeamSearch from './TeamSearch';
import StatViewSwitch from './StatViewSwitch';
import {
  filterPlayerRows,
  getDraftColumns,
  getDraftDisplayColumns,
} from './shared';


type PlayerPoolTableProps = {
  seasonPool: object[];
  pool: object[];
  handleRowClick: (row: object) => void;
  sessionStoragePrefix: string;
  openPlayerInNewTab?: boolean;
};


/**
 * Shared player ranking table and filter bar for the draft zone and pre-draft picks.
 */
const PlayerPoolTable = (
  {
    seasonPool,
    pool,
    handleRowClick,
    sessionStoragePrefix,
    openPlayerInNewTab = false,
  }: PlayerPoolTableProps,
) => {
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const draft_stat_view = useAppSelector((state) => state.fantasyGroupReducer.draft_stat_view);
  const columnView = useAppSelector((state) => state.rankingReducer.columnView);
  const customColumns = useAppSelector((state) => state.rankingReducer.customColumns);

  const isCareerActive = draft_stat_view === 'career_active';

  const [playerSearchValue, setPlayerSearchValue] = useState('');
  const [selectedTeamID, setSelectedTeamID] = useState<string | null>(null);

  const rows = useMemo(() => {
    return filterPlayerRows({
      rows: pool,
      team_id: selectedTeamID,
      search: playerSearchValue,
    });
  }, [pool, selectedTeamID, playerSearchValue]);

  const columns = useMemo(() => {
    return getDraftColumns({
      organization_id: fantasy_group.organization_id,
      career: isCareerActive,
      launchLink: openPlayerInNewTab,
    });
  }, [fantasy_group.organization_id, isCareerActive, openPlayerInNewTab]);

  const displayColumns = useMemo(() => {
    return getDraftDisplayColumns({
      organization_id: fantasy_group.organization_id,
      columnView,
      customColumns,
      career: isCareerActive,
    });
  }, [fantasy_group.organization_id, columnView, customColumns, isCareerActive]);

  const rowRenderer = useMemo(() => {
    if (!openPlayerInNewTab) {
      return decorateRows;
    }

    return createDecorateRows({
      openHrefInNewTab: true,
      getRowHref: (row) => ('player_id' in row ? Url.player({
        organization_id: fantasy_group.organization_id,
        slug: row.slug || row.player_id,
        season: fantasy_group.season,
      }) : ''),
    });
  }, [openPlayerInNewTab, fantasy_group.organization_id, fantasy_group.season]);

  const inputHandler = new Inputs();

  return (
    <div>
      <div style = {{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
        <StatViewSwitch rows = {seasonPool} style = {{ marginBottom: 0 }} />
        <ColumnChipPicker
          organization_id = {fantasy_group.organization_id}
          view = 'player'
          options = {columns}
        />
      </div>
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
      <VirtualTable
        rows={rows}
        columns={columns}
        displayColumns={displayColumns}
        rowKey = 'player_statistic_ranking_id'
        height={300}
        handleRowClick={handleRowClick}
        decorateRows={rowRenderer}
        decorateHeaderRow={decorateHeaderRow}
        defaultSortOrder = 'asc'
        defaultSortOrderBy = {'rank'}
        // keyed per stat view, so a sort saved on a column only one of them has does not carry over
        sessionStorageKey = {`${fantasy_group.organization_id}.${sessionStoragePrefix}.${draft_stat_view}`}
      />
    </div>
  );
};

export default PlayerPoolTable;
