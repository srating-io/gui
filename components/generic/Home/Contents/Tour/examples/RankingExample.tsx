'use client';

import React, { useMemo, useState, useTransition } from 'react';

import { useAppDispatch } from '@/redux/hooks';

import ArrowForwardIcon from '@esmalley/react-material-icons/ArrowForward';


import { useRouter } from 'next/navigation';
import { setLoading as setLoadingDisplay } from '@/redux/features/loading-slice';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import { createDecorateRows, decorateHeaderRow } from '@/components/generic/Ranking/Contents/Client';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Button, defaultSortOrderType, VirtualTable } from '@esmalley/react-material-ui';
import { SEASON, tableRows } from '../data/table';
import { Basketball } from '@srating-io/types';

/** The size of the division the example rows were ranked in. */
const LEAGUE_SIZE = 364;



/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div>
      {children}
    </div>
  );
};


/**
 * The live ranking table, on canned rows.
 *
 * `heatMap` tints each ranked cell by where the team falls in the league, which is the option the
 * real table carries - and the reason the landing page shows it on by default is that the color
 * is the part a reader cannot get from a screenshot of numbers.
 */
const RankingExample = ({ heatMap = false, showCta = true }: { heatMap?: boolean, showCta?: boolean }) => {
  const navigation = useNavigation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const organization_id = Organization.getCBBID();
  const view = 'team';
  const season = SEASON;

  const dispatch = useAppDispatch();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('rank');

  const tableColumns = ['rank', 'name', 'wins', 'conf_record', 'elo', 'adjusted_efficiency_rating', 'elo_sos', 'offensive_rating', 'defensive_rating'];


  const headCells = TableColumns.getColumns({ organization_id, view });

  const rows = tableRows as unknown as Basketball.RankingTable[];

  const handleSort = (id) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  const handleTeam = (team_id) => {
    navigation.team(`/cbb/team/${team_id}?season=${season}`);
  };

  const handlePath = (e, path) => {
    e.preventDefault();
    dispatch(setLoadingDisplay(true));
    startTransition(() => {
      router.push(path);
    });
  };

  const descendingComparator = (a, b, orderBy) => {
    if ((orderBy in a) && b[orderBy] === null) {
      return 1;
    }
    if (a[orderBy] === null && (orderBy in b)) {
      return -1;
    }

    let a_value = a[orderBy];
    let b_value = b[orderBy];
    if (orderBy === 'wins' || orderBy === 'conf_record') {
      a_value = +a[orderBy].split('-')[0];
      b_value = +b[orderBy].split('-')[0];
    }

    const direction = (headCells[orderBy] && headCells[orderBy].sort) || 'lower';

    if (b_value < a_value) {
      return direction === 'higher' ? 1 : -1;
    }
    if (b_value > a_value) {
      return direction === 'higher' ? -1 : 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  // the excerpt below is the top of the 2024 table, so its rows still carry the ranks they held
  // out of a full division - measuring the tint against the thirty-eight rows on screen would
  // paint most of a top-forty sample as the bottom of the league
  const rowRenderer = useMemo(() => createDecorateRows({ heatMap, max: LEAGUE_SIZE }), [heatMap]);

  if (rows && rows.length) {
    rows.sort(getComparator(order, orderBy));
  }


  return (
    <Contents>
      {
        showCta ?
          <div style = {{ textAlign: 'center' }}><Button ink onClick={(e) => { handlePath(e, '/cbb/ranking'); } } endIcon = {<ArrowForwardIcon style = {{ fontSize: 20 }}/>} title = {'View Full Live Rankings'} value = 'view-full' /></div> :
          ''
      }
      <div>
        <VirtualTable
          rows = {rows}
          columns={headCells}
          displayColumns={tableColumns}
          rowKey = {'team_id'}
          height={300}
          handleRowClick={(row) => {
            if ('team_id' in row) {
              handleTeam(row.team_id);
            }
          }}
          decorateRows={rowRenderer}
          decorateHeaderRow={decorateHeaderRow}
          customHandleSort = {handleSort}
          customSortComparator={getComparator}
          defaultSortOrder = {order as defaultSortOrderType} // todo
          defaultSortOrderBy = {orderBy}
        />
      </div>
    </Contents>
  );
};


export default RankingExample;
