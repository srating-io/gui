'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';


import CheckIcon from '@esmalley/react-material-icons/Check';
import { setDataKey } from '@/redux/features/ranking-slice';
import RankSpan from '../../RankSpan';
import { getRows } from '../DataHandler';
import Organization from '@/components/helpers/Organization';
// import { CBBRankingTable } from '@/types/cbb';
import { getConferenceChips } from '../../ConferenceChips';
import TableColumns from '@/components/helpers/TableColumns';
import ClassSpan from '../../ClassSpan';
import { ChartCorrelationMatrix, ChartHistogram, ChartScatter, CorrelationMeasure, ScatterPoint } from '@/components/generic/Chart';
import { Arithmetic, Color, Objector } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import {
  CustomDecorateHeaderRow, CustomDecorateRows, defaultSortOrderType, LinearProgress, Tab, Td, Th, Tooltip, Tr, Typography, useTheme, useWindowDimensions, VirtualTable,
} from '@esmalley/react-material-ui';
import { Basketball, Football } from '@srating-io/types';
import { maxWidth } from '../../Picks/Tile';



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


const ClientSkeleton = () => {
  const theme = useTheme();
  const heightToRemove = 400;
  return (
    <Contents>
      <div style = {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: `calc(100vh - ${heightToRemove}px)`,
      }}>
        <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
      </div>
    </Contents>
  );
};

/**
 * The charts chart view offers, in tab order.
 *
 * Stacked, the three of them made chart view a scroll, and the scatter - the one most readers came
 * for - shrank to fit alongside questions they only sometimes have. A tab bar keeps whichever one
 * is being read at the height the table had.
 *
 * `short` is what a narrow screen gets: the long titles are the questions each chart answers, which
 * is worth the width when there is width to spend.
 */
const chartTabs = [
  { value: 'scatter', title: 'Offence vs defence', short: 'Scatter' },
  { value: 'distribution', title: 'League distribution', short: 'Spread' },
  // the matrix heads itself "What goes with what", so the tab says the shorter thing rather than
  // printing the same phrase twice, one line apart
  { value: 'correlation', title: 'Correlations', short: 'Correlations' },
];

/** The chart a reader lands on in chart view, and so the one the url does not need to name. */
const defaultChart = 'scatter';

export type DecorateRowsOptions = {
  /**
   * Tints each ranked cell by where its team falls in the league.
   *
   * The rank badge already states the position precisely, but reading a whole column means reading
   * every badge in it. A tint on the cell itself is what lets the eye run down a column and see its
   * shape, which is the one thing a table of numbers cannot otherwise do.
   */
  heatMap?: boolean;
  /**
   * The denominator every rank is measured against, when the rows themselves cannot say.
   *
   * The default - the number of rows on screen - is right for the ranking page, where the table
   * is the league. It is wrong for any caller holding an excerpt: a top-forty sample still carries
   * the ranks it had out of three hundred, and measuring those against forty paints most of that
   * excerpt as the bottom of the league.
   */
  max?: number;
};

/**
 * Builds the row renderer VirtualTable calls.
 *
 * A factory rather than a plain function because VirtualTable fixes the signature it calls with, so
 * anything the renderer needs to know beyond the row itself has to be closed over.
 */
export const createDecorateRows = (
  { heatMap = false, max: maxOverride }: DecorateRowsOptions = {},
) => <T extends (Basketball.RankingTable | Football.RankingTable), >(
  {
    rows,
    startIndex,
    theme,
    width,
    breakPoint,
    rowHeight,
    displayColumns,
    columns,
    handleRowClick,
    rowKey,
  }:
  CustomDecorateRows<T>,
) => {
  // the exact ramp RankSpan paints its badge with, so a cell and the badge sitting in it are one
  // color at one rank rather than two competing readings of it
  const heatBest = theme.mode === 'light' ? theme.success.main : theme.success.dark;
  const heatWorst = theme.mode === 'light' ? theme.error.main : theme.error.dark;

  let minDelta = -1;
  let maxDelta = 1;

  if (rows && rows.length) {
    for (let i = 0; i < rows.length; i++) {
      let delta = 0;
      if (rows[i].rank_delta_one) {
        delta = rows[i].rank_delta_one;
      }

      if (
        rows[i].rank_delta_seven &&
        (
          (delta > 0 && delta < rows[i].rank_delta_seven) ||
          (delta < 0 && delta > rows[i].rank_delta_seven)
        )
      ) {
        delta = rows[i].rank_delta_seven;
      }

      if (delta > 0 && delta > maxDelta) {
        maxDelta = delta;
      }

      if (delta < 0 && delta < minDelta) {
        minDelta = delta;
      }
    }
  }

  let numberOfStickyColumns = 0;
  for (let i = 0; i < displayColumns.length; i++) {
    if (
      displayColumns[i] in columns &&
      'sticky' in columns[displayColumns[i]] &&
      columns[displayColumns[i]].sticky === true
    ) {
      numberOfStickyColumns++;
    }
  }

  const i_x_left = {};

  const elements: React.JSX.Element[] = rows.map((row, index) => {
    const actualIndex = startIndex + index;
    const isEven = actualIndex % 2 === 0;
    let tdColor = isEven ? theme.grey[800] : theme.grey[900];

    if (theme.mode === 'light') {
      tdColor = isEven ? theme.grey[200] : theme.grey[300];
    }

    const tdStyle: React.CSSProperties = {
      padding: '4px 5px',
      backgroundColor: tdColor,
      border: 0,
      borderTop: 0,
      borderLeft: 0,
      borderBottom: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      height: rowHeight,
      maxHeight: rowHeight,
      minHeight: rowHeight,
    };

    if (width <= breakPoint) {
      tdStyle.fontSize = '12px';
    }

    const tableCells: React.JSX.Element[] = [];

    for (let i = 0; i < displayColumns.length; i++) {
      const headCell = columns[displayColumns[i]];
      if (!headCell) {
        console.warn('missing headcell for: ', displayColumns[i]);
        continue;
      }
      const cellStyle = Objector.extender({}, tdStyle, headCell.style || {});

      let tdWidth: number | null = null;
      const tdLeft: number = (i - 1 in i_x_left ? i_x_left[i - 1] : 0);

      if (headCell.id === 'rank') {
        cellStyle.textAlign = 'center';
      }

      if ('widths' in headCell && headCell.widths) {
        tdWidth = headCell.widths.default;

        let lastBreakpoint: number | null = null;
        for (const bp in headCell.widths) {
          if (
            bp !== 'default' &&
            width <= Number(bp) &&
            (
              !lastBreakpoint ||
              lastBreakpoint > width
            )
          ) {
            lastBreakpoint = Number(bp);
            tdWidth = headCell.widths[bp];
          }
        }
      }



      if (tdWidth) {
        cellStyle.width = tdWidth;
        cellStyle.minWidth = tdWidth;
        cellStyle.maxWidth = tdWidth;
      }

      if (headCell.sticky) {
        cellStyle.position = 'sticky';
        cellStyle.overflow = 'hidden';
        cellStyle.whiteSpace = 'nowrap';
        cellStyle.textOverflow = 'ellipsis';
        cellStyle.zIndex = 3;
        cellStyle.left = tdLeft;

        if (!(i in i_x_left)) {
          i_x_left[i] = (tdWidth || 0) + (tdLeft || 0);
        }
      }

      if (i + 1 === numberOfStickyColumns) {
        cellStyle.borderRight = `3px solid ${theme.mode === 'light' ? theme.info.light : theme.info.dark}`;
      }

      if (displayColumns[i].includes('_delta_')) {
        const value = row[displayColumns[i]] !== null ? row[displayColumns[i]] : '-';

        if (displayColumns[i] === 'rank_delta_combo') {
          let rank_delta_one = value.split('/')[0];
          let rank_delta_seven = value.split('/')[1];

          const deltaOneSpanStyle: React.CSSProperties = {};
          const deltaSevenSpanStyle: React.CSSProperties = {};
          if (rank_delta_one !== '-') {
            if (+rank_delta_one > 0) {
              const normalizedNumber = Arithmetic.clamp(Math.abs(+rank_delta_one) / (maxDelta * 0.8), 0, 1);
              deltaOneSpanStyle.color = Color.lerpColor(theme.success.light, theme.success.main, normalizedNumber);
            } else {
              const normalizedNumber = Math.abs(Arithmetic.clamp(Math.abs(+rank_delta_one) / (minDelta * 0.8), -1, 0));
              deltaOneSpanStyle.color = Color.lerpColor(theme.error.main, theme.error.dark, normalizedNumber);
            }
          }
          if (rank_delta_seven !== '-') {
            if (+rank_delta_seven > 0) {
              const normalizedNumber = Arithmetic.clamp(Math.abs(+rank_delta_seven) / (maxDelta * 0.8), 0, 1);
              deltaSevenSpanStyle.color = Color.lerpColor(theme.success.light, theme.success.main, normalizedNumber);
            } else {
              const normalizedNumber = Math.abs(Arithmetic.clamp(Math.abs(+rank_delta_seven) / (minDelta * 0.8), -1, 0));
              deltaSevenSpanStyle.color = Color.lerpColor(theme.error.main, theme.error.dark, normalizedNumber);
            }
          }

          if (rank_delta_one > 0) {
            rank_delta_one = `+${rank_delta_one}`;
          }
          if (rank_delta_seven > 0) {
            rank_delta_seven = `+${rank_delta_seven}`;
          }

          tableCells.push(
            <Td key = {i} style = {cellStyle}><span style={deltaOneSpanStyle}>{rank_delta_one}</span>/<span style = {deltaSevenSpanStyle}>{rank_delta_seven}</span></Td>,
          );
        } else {
          const deltaStyle: React.CSSProperties = {};
          if (row[displayColumns[i]]) {
            if (+row[displayColumns[i]] > 0) {
              const normalizedNumber = Arithmetic.clamp(Math.abs(+row[displayColumns[i]]) / (maxDelta * 0.8), 0, 1);
              deltaStyle.color = Color.lerpColor(theme.success.light, theme.success.main, normalizedNumber);
            } else {
              const normalizedNumber = Math.abs(Arithmetic.clamp(Math.abs(+row[displayColumns[i]]) / (minDelta * 0.8), -1, 0));
              deltaStyle.color = Color.lerpColor(theme.error.main, theme.error.dark, normalizedNumber);
            }
          }

          tableCells.push(<Td key = {i} style = {{ ...cellStyle, ...deltaStyle }}>{(value > 0 ? '+' : '') + value}</Td>);
        }
      } else if (displayColumns[i] === 'committed') {
        tableCells.push(<Td key = {i} style = {cellStyle}>{row[displayColumns[i]] === 1 ? <CheckIcon style = {{ fontSize: 20, color: theme.success.main }} /> : '-'}</Td>);
      } else if (displayColumns[i] === 'name' && ('player_id' in row)) {
        let classSpan: string | React.JSX.Element = '';

        if ('class_year' in row && row.class_year) {
          classSpan = <ClassSpan class_year = {row.class_year as string}/>;
        }

        let secondarySpan: string | React.JSX.Element = '';

        if ('name_secondary' in row && row.name_secondary) {
          secondarySpan = (
            <span style = {{ color: theme.grey[500] }}> {row.name_secondary as string}</span>
          );
        }

        tableCells.push(
          <Td key = {i} style = {cellStyle}>{classSpan}{row[displayColumns[i]]}{secondarySpan}</Td>,
        );
      } else {
        // if (headCell.id === 'rank') {
        //   cellStyle.width = 300;
        //   cellStyle.minWidth = 300;
        // }

        let text = '-';
        let rankSpan: string | React.JSX.Element = '';

        if (row[displayColumns[i]] !== null) {
          // text = `${row[displayColumns[i]]}${displayColumns[i] === 'rank' ? ' (' + (row.rating || '?') + ')' : ''}`;
          text = `${row[displayColumns[i]]}`;
        }

        if (row[`${displayColumns[i]}_rank`] && row[displayColumns[i]] !== null) {
          let max = maxOverride || rows.length;
          if (!maxOverride && 'max' in row) {
            max = row.max;
          }
          const rank = row[`${displayColumns[i]}_rank`];
          rankSpan = <RankSpan rank = {rank} useOrdinal = {!('player_id' in row)} max = {max} />;

          if (heatMap) {
            cellStyle.backgroundColor = Color.lerpColor(heatBest, heatWorst, (rank / max));
            // the badge already settled white as the one legible choice across this whole ramp
            cellStyle.color = '#fff';
          }
        }

        tableCells.push(
          <Td key = {i} style = {cellStyle}>{text}{rankSpan}</Td>,
        );
      }
    }

    const TableRowCSS = {
      '&:hover td': {
        backgroundColor: (theme.mode === 'light' ? theme.info.light : theme.info.dark),
      },
      '&:hover': {
        cursor: 'pointer',
      },
    };

    return (
      <Tr
        style = {TableRowCSS} // the TR component will convert this to a class
        key={row[rowKey]}
        onClick={() => {
          if (handleRowClick) {
            handleRowClick(row);
          }
        }}
      >
        {tableCells}
      </Tr>
    );
  });

  return elements;
};

/** The plain renderer, for the callers that want the table exactly as it has always looked. */
export const decorateRows = createDecorateRows();

export const decorateHeaderRow = (
  {
    displayColumns,
    columns,
    theme,
    width,
    breakPoint,
    order,
    orderBy,
    handleSort,
    useAlternateLabel,
  }:
  CustomDecorateHeaderRow,
) => {
  const i_x_left = {};
  let numberOfStickyColumns = 0;
  for (let i = 0; i < displayColumns.length; i++) {
    if (
      displayColumns[i] in columns &&
      'sticky' in columns[displayColumns[i]] &&
      columns[displayColumns[i]].sticky === true
    ) {
      numberOfStickyColumns++;
    }
  }
  return (
    <Tr>
      {displayColumns.map((column, i) => {
        if (!(column in columns)) {
          return null;
        }
        const headCell = columns[column];

        const tdStyle: React.CSSProperties = {
          padding: '4px 5px',
          border: 0,
          backgroundColor: theme.mode === 'light' ? theme.info.light : theme.info.dark,
          whiteSpace: 'nowrap',
          textAlign: 'left',
          position: 'sticky',
          top: 0,
        };

        let tdWidth: number | null = null;
        const tdLeft: number = (i - 1 in i_x_left ? i_x_left[i - 1] : 0);

        if (headCell.widths) {
          tdWidth = headCell.widths.default;

          let lastBreakpoint: number | null = null;
          for (const bp in headCell.widths) {
            if (
              bp !== 'default' &&
              width <= Number(bp) &&
              (
                !lastBreakpoint ||
                lastBreakpoint > width
              )
            ) {
              lastBreakpoint = Number(bp);
              tdWidth = headCell.widths[bp];
            }
          }
        }

        if (tdWidth) {
          tdStyle.width = tdWidth;
          tdStyle.minWidth = tdWidth;
          tdStyle.maxWidth = tdWidth;
        }

        if (headCell.sticky) {
          tdStyle.zIndex = 4;
          tdStyle.left = tdLeft;

          if (!(i in i_x_left)) {
            i_x_left[i] = (tdWidth || 0) + (tdLeft || 0);
          }
        }

        if (i + 1 === numberOfStickyColumns) {
          tdStyle.borderRight = `3px solid ${theme.mode === 'light' ? theme.info.light : theme.info.dark}`;
        }

        if (width <= breakPoint) {
          tdStyle.fontSize = '13px';
        }

        if (headCell.id === 'conf_record' || headCell.id === 'record') {
          tdStyle.minWidth = 41;
        }

        let showSortArrow = true;
        if (width <= breakPoint && (headCell.id === 'rank' || headCell.id === 'record' || headCell.id === 'conf_record' || headCell.id === 'rank_delta_combo')) {
          showSortArrow = false;
        }

        let label = headCell.getLabel();

        if (useAlternateLabel && headCell.getAltLabel) {
          label = headCell.getAltLabel();
        }

        return (
          <Tooltip key={headCell.id} position = 'top' text={headCell.getTooltip()}>
            <Th
              style = {tdStyle}
              key={headCell.id}
              onClick={() => { handleSort(headCell.id); }}
              sortable = {true}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {label}
            </Th>
          </Tooltip>
        );
      })}
    </Tr>
  );
};

const Client = ({ generated, organization_id, division_id, season, view }) => {
  const navigation = useNavigation();
  const { height, width } = useWindowDimensions();


  const dispatch = useAppDispatch();
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const data = useAppSelector((state) => state.rankingReducer.data);
  const order = useAppSelector((state) => state.rankingReducer.order);
  const orderBy = useAppSelector((state) => state.rankingReducer.orderBy);
  const tableScrollTop = useAppSelector((state) => state.rankingReducer.tableScrollTop);
  const tableFullscreen = useAppSelector((state) => state.rankingReducer.tableFullscreen);
  const chartView = useAppSelector((state) => state.rankingReducer.chartView);
  const chart = useAppSelector((state) => state.rankingReducer.chart);
  const heatMap = useAppSelector((state) => state.rankingReducer.heatMap);
  const positions = useAppSelector((state) => state.displayReducer.positions);
  // not used directly - it is one of the two things the row contents below are built from, and so
  // one of the dependencies the correlation square is held against
  const selectedConferences = useAppSelector((state) => state.displayReducer.conferences);

  const allRows = getRows({ view });

  const filteredRows = useAppSelector((state) => state.rankingReducer.filteredRows);
  const columnView = useAppSelector((state) => state.rankingReducer.columnView);
  const customColumns = useAppSelector((state) => state.rankingReducer.customColumns);
  const career = useAppSelector((state) => state.rankingReducer.career);
  const career_active = useAppSelector((state) => state.rankingReducer.career_active);
  const tableColumns = TableColumns.getViewableColumns({ organization_id, view, columnView, customColumns, positions, career: (career === 1 || career_active === 1) });
  const confChipsLength = getConferenceChips().length;
  const currentPath = Organization.getPath({ organizations, organization_id });
  const [tableHorizontalScroll, setTableHorizontalScroll] = useState(0);
  const tableRef: React.RefObject<HTMLTableElement | null> = useRef(null);


  useEffect(() => {
    if (tableRef.current) {
      setTimeout(() => {
        tableRef.current?.scrollTo({ left: tableHorizontalScroll });
      }, 0);
    }
  }, [tableHorizontalScroll, order, orderBy]);

  const headCells = TableColumns.getColumns({ organization_id, view, career: (career === 1 || career_active === 1) });

  /**
   * Which measures actually go with winning, across the whole league.
   *
   * Everywhere else the app says what a team's numbers are. This says which of those numbers were
   * worth printing: a column that runs with winning describes good teams, and one sitting near
   * zero is a stat the site has shown for years that tells nobody anything. The square also shows
   * redundancy - two measures correlating at .95 are one measure under two names.
   *
   * Held across renders because the chart it feeds measures every pair of these series, and this
   * component reads the window width - without it, dragging the window edge re-correlated the
   * whole square per frame.
   *
   * The dependencies are what the *contents* of `allRows` come from rather than `allRows` itself,
   * which is a fresh array on every render: getRows rebuilds it from `data` and, on the team view
   * this square is restricted to, the conference filter. The rest of the filters it applies only
   * touch player and transfer rows.
   */
  const correlationMeasures: CorrelationMeasure[] = useMemo(() => {
    // the square is only ever drawn on the team view, and the player views carry thousands of
    // rows, so there is no reason to walk them for a chart that cannot appear
    if (view !== 'team') {
      return [];
    }

    let columns = [
      'elo',
      'offensive_rating',
      'defensive_rating',
      'elo_sos',
      'pace',
      'field_goal_percentage',
      'three_point_field_goal_percentage',
      'offensive_rebounds',
      'defensive_rebounds',
      'assists',
      'steals',
      'blocks',
      'turnovers',
    ];

    if (Organization.getCFBID() === organization_id) {
      columns = [
        'elo',
        'points',
        'opponent_points',
        'elo_sos',
        'yards_per_play',
        'opponent_yards_per_play',
        'passing_yards',
        'rushing_yards',
        'passing_touchdowns',
        'passing_interceptions',
      ];
    }

    // read through a variable key: allRows is typed as a union that includes player rows, which
    // carry no record, even though the square only ever runs on the team view
    const numeric = (row, key: string): number => (typeof row[key] === 'number' ? row[key] : NaN);

    // win rate leads, because "does this go with winning" is the question the square is here for
    const winRates: number[] = [];

    for (const row of allRows) {
      const wins = numeric(row, 'wins');
      const losses = numeric(row, 'losses');
      const played = (Number.isFinite(wins) ? wins : 0) + (Number.isFinite(losses) ? losses : 0);

      winRates.push(played ? (wins / played) * 100 : NaN);
    }

    const measures: CorrelationMeasure[] = [{
      key: 'win_rate', label: 'Win%', full: 'Win rate', values: winRates,
    }];

    for (const column of columns) {
      if (!headCells[column]) {
        continue;
      }

      const values = allRows.map((row) => numeric(row, column));

      // a column the sport does not carry comes back all NaN, and an empty square is worse than
      // a smaller one
      if (!values.some((value) => Number.isFinite(value))) {
        continue;
      }

      measures.push({
        key: column,
        label: headCells[column].getAltLabel ? headCells[column].getAltLabel() : headCells[column].getLabel(),
        full: headCells[column].getLabel(),
        values,
      });
    }

    return measures;
  }, [data, selectedConferences, organization_id, view]);

  // rebuilt only when the heat toggle moves; VirtualTable re-renders every visible row when the
  // renderer's identity changes, which is not something a hover or a resize should be paying for
  const rowRenderer = useMemo(() => createDecorateRows({ heatMap }), [heatMap]);

  // both memos sit above this return, not below it: a hook that runs only on the renders where
  // the data has arrived changes the hook count between renders, which React treats as an error
  if (data === null) {
    return <ClientSkeleton />;
  }


  const searching = filteredRows !== null && filteredRows !== false && filteredRows !== true;

  let rows: (Basketball.RankingTable | Football.RankingTable)[] = allRows;

  if (filteredRows !== null && filteredRows !== false && filteredRows !== true) {
    // creates a shallow copy, since redux freezes the array / object
    rows = [...filteredRows];
  }

  const handleSort = (id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (tableRef && tableRef.current?.parentElement) {
      setTableHorizontalScroll(tableRef.current?.parentElement.scrollLeft);
    }
    dispatch(setDataKey({ key: 'order', value: (isAsc ? 'desc' : 'asc') }));
    dispatch(setDataKey({ key: 'orderBy', value: id }));
  };

  const handleTeam = (team_id) => {
    if (tableRef && tableRef.current?.parentElement) {
      dispatch(setDataKey({ key: 'tableScrollTop', value: tableRef.current?.parentElement.scrollTop }));
    }
    navigation.team(`/${currentPath}/team/${team_id}?season=${season}`);
  };

  const handlePlayer = (player_id) => {
    if (tableRef && tableRef.current?.parentElement) {
      dispatch(setDataKey({ key: 'tableScrollTop', value: tableRef.current?.parentElement.scrollTop }));
    }

    navigation.player(`/${currentPath}/player/${player_id}?season=${season}`);
  };

  const handleConference = (conference_id) => {
    if (tableRef && tableRef.current?.parentElement) {
      dispatch(setDataKey({ key: 'tableScrollTop', value: tableRef.current?.parentElement.scrollTop }));
    }
    navigation.conference(`/${currentPath}/conference/${conference_id}?season=${season}`);
  };

  const handleCoach = (coach_id) => {
    if (tableRef && tableRef.current?.parentElement) {
      dispatch(setDataKey({ key: 'tableScrollTop', value: tableRef.current?.parentElement.scrollTop }));
    }
    navigation.coach(`/${currentPath}/coach/${coach_id}?season=${season}`);
  };

  const descendingComparator = (a, b, orderBy) => {
    if ((orderBy in a) && b[orderBy] === null) {
      return 1;
    }
    if (a[orderBy] === null && (orderBy in b)) {
      return -1;
    }

    let a_value = a[orderBy];
    let a_secondary: number | string | null = null;
    let b_value = b[orderBy];
    let b_secondary: number | string | null = null;
    if ((view !== 'coach' && orderBy === 'record') || orderBy === 'conf_record') {
      a_value = +a[orderBy].split('-')[0];
      a_secondary = +a[orderBy].split('-')[1];
      b_value = +b[orderBy].split('-')[0];
      b_secondary = +b[orderBy].split('-')[1];
    }

    const direction = (headCells[orderBy] && headCells[orderBy].sort) || 'lower';

    // if the delta 7 is too high, maybe just default to delta 1 for a more stable sort?
    if (orderBy === 'rank_delta_combo') {
      [a_value, a_secondary] = a[orderBy].split('/');
      a_value = a_value === '-' ? 0 : +a_value;
      // @ts-expect-error - I know a_secondary can be null, +null is 0, still a number
      a_secondary = a_secondary === '-' ? 0 : +a_secondary;

      [b_value, b_secondary] = b[orderBy].split('/');
      b_value = b_value === '-' ? 0 : +b_value;
      // @ts-expect-error - I know b_secondary can be null, +null is 0, still a number
      b_secondary = b_secondary === '-' ? 0 : +b_secondary;


      if (a_secondary > a_value) {
        a_value = a_secondary;
      }
      if (b_secondary > b_value) {
        b_value = b_secondary;
      }

      a_secondary = null;
      b_secondary = null;
    }


    if (
      a_secondary !== null &&
      b_secondary !== null &&
      a_value === b_value
    ) {
      // these ones are reversed because we want the lower one (losses to be ranked higher)
      if (b_secondary < a_secondary) {
        return direction === 'higher' ? -1 : 1;
      }
      if (b_secondary > a_secondary) {
        return direction === 'higher' ? 1 : -1;
      }
    }

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



  let confHeightModifier = 0;
  if (confChipsLength) {
    confHeightModifier = confChipsLength < 4 ? 40 : 80;
  }

  const availableHeight = height - (tableFullscreen ? 100 : 280) - (width < 380 ? 30 : 0) - (tableFullscreen ? 0 : confHeightModifier) - 40;

  const tableStyle = {
    maxHeight: availableHeight,
    height: availableHeight,
  };

  if ((rows.length + 2) * 26 < tableStyle.height) {
    tableStyle.height = (rows.length + 2) * 27;
  }

  if (height < 450) {
    tableStyle.maxHeight = 250;
    tableStyle.height = 250;
  }

  /**
   * The plot takes the room the viewport allows, never the room the rows would have needed.
   *
   * A table of two rows should be two rows tall. The scatter behind a search is still the whole
   * league, so sizing it the same way flattened three hundred teams into a two-row strip.
   */
  const chartHeight = height < 450 ? 250 : availableHeight;




  let rowKey = 'team_id';
  if (view === 'player' || view === 'transfer') {
    if (Organization.isNBA()) {
      rowKey = 'player_statistic_ranking_id';
    } else {
      rowKey = 'player_id';
    }
  } else if (view === 'conference') {
    rowKey = 'conference_id';
  } else if (view === 'coach') {
    rowKey = 'coach_id';
  }

  // the keys should prob be the below, but the above helps me find bugs in data...

  // let rowKey = 'statistic_ranking_id';
  // if (view === 'player' || view === 'transfer') {
  //   rowKey = 'player_statistic_ranking_id';
  // } else if (view === 'conference') {
  //   rowKey = 'conference_statistic_ranking_id';
  // } else if (view === 'coach') {
  //   rowKey = 'coach_statistic_ranking_id';
  // }


  /**
   * The two measures the scatter plots, per sport.
   *
   * Basketball and the NBA carry ratings per 100 possessions, which is already pace-adjusted.
   * Football has no equivalent on the ranking row, so it uses points scored against points allowed,
   * which answers the same question with the data that exists.
   *
   * The y measure is one where lower is better in both cases, so the plot reverses that axis and
   * "up and to the right" means good at both ends of the floor.
   */
  const getScatterAxes = () => {
    if (Organization.getCFBID() === organization_id) {
      return { xKey: 'points', yKey: 'opponent_points', xFallback: 'Points', yFallback: 'Opp. points' };
    }

    return { xKey: 'offensive_rating', yKey: 'defensive_rating', xFallback: 'Offensive rating', yFallback: 'Defensive rating' };
  };

  /**
   * Every team on the plot, with the searched ones picked out.
   *
   * The table narrows to a search because a table is a list of answers. The scatter is not: a mark
   * means "here, against everyone else", so dropping the other teams would delete the thing the
   * reader is measuring against and leave a dot floating in an empty box. The search highlights
   * instead, and the league stays behind it.
   */
  const getScatterPoints = (xKey: string, yKey: string): ScatterPoint[] => {
    const searched: Set<string> = new Set();

    if (searching) {
      for (const row of rows) {
        searched.add(row[rowKey]);
      }
    }

    const points: ScatterPoint[] = [];

    for (const row of allRows) {
      const x = row[xKey];
      const y = row[yKey];

      // a team missing either measure has no position to occupy, so it is left out rather than
      // dropped onto an axis at zero
      if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
        continue;
      }

      points.push({
        id: row[rowKey],
        name: row.name,
        x,
        y,
        xRank: row[`${xKey}_rank`],
        yRank: row[`${yKey}_rank`],
        highlighted: searching && searched.has(row[rowKey]),
      });
    }

    return points;
  };

  const getChart = () => {
    const { xKey, yKey, xFallback, yFallback } = getScatterAxes();
    const xLabel = (headCells[xKey] && headCells[xKey].getLabel()) || xFallback;
    const yLabel = (headCells[yKey] && headCells[yKey].getLabel()) || yFallback;

    return (
      <ChartScatter
        points = {getScatterPoints(xKey, yKey)}
        xLabel = {xLabel}
        yLabel = {yLabel}
        yLowerIsBetter = {true}
        quadrantLabels = {{
          topLeft: 'Defence carries them',
          topRight: 'Strong both ends',
          bottomLeft: 'Struggling both ends',
          bottomRight: 'Offence carries them',
        }}
        onSelect = {(team_id) => { handleTeam(team_id); }}
        height = {chartHeight}
      />
    );
  };

  /**
   * The league's spread on whichever column is currently sorted, with the searched team marked.
   *
   * The scatter above answers where a team sits against two measures. This answers the question
   * the table never does - whether the number it is sorted by is one where the league bunches up
   * or spreads out, and so whether being twentieth on it means much at all.
   *
   * Built from `allRows` rather than `rows`, because the point is the whole league: filtering to
   * one team and drawing that team's distribution would be a chart of a single bar.
   */
  const getDistribution = () => {
    const { xKey } = getScatterAxes();

    // A rank column is a permutation of 1..N, so its histogram is flat by construction - one team
    // per bar, telling the reader only how many teams there are. Since rank is also the default
    // sort, following `orderBy` blindly would show that flat bar to most readers most of the time.
    const isRank = !orderBy || orderBy === 'rank' || orderBy.endsWith('_rank');

    const column = (!isRank && allRows.length && typeof allRows[0][orderBy] === 'number') ? orderBy : xKey;

    const values: number[] = [];

    for (const row of allRows) {
      if (typeof row[column] === 'number' && Number.isFinite(row[column])) {
        values.push(row[column]);
      }
    }

    // one row left after the search is the reader pointing at a team, so that is the one to mark
    const marker = (rows.length === 1 && typeof rows[0][column] === 'number') ?
      { value: rows[0][column], label: rows[0].name } :
      null;

    const label = (headCells[column] && headCells[column].getLabel()) || column;

    return (
      <ChartHistogram
        values = {values}
        marker = {marker}
        xLabel = {label}
        noun = 'teams'
        markerHint = 'search a team to mark it'
      />
    );
  };

  const showChart = chartView && view === 'team';

  /**
   * Which chart the tabs have selected.
   *
   * An unknown value falls back to the default rather than drawing nothing, so a stale or
   * hand-edited `?chart=` cannot leave a reader staring at an empty chart view.
   */
  const selectedChart = chartTabs.some((tab) => tab.value === chart) ? chart : defaultChart;

  const handleChart = (e, value) => {
    if (value !== selectedChart) {
      dispatch(setDataKey({ key: 'chart', value }));
    }
  };

  const getChartTabs = () => {
    return (
      <div style = {{ display: 'flex', justifyContent: 'center', overflowX: 'scroll', overflowY: 'hidden', scrollbarWidth: 'none' }}>
        {chartTabs.map((tab) => {
          return (
            <Tab
              key = {tab.value}
              value = {tab.value}
              title = {width < 600 ? tab.short : tab.title}
              selected = {tab.value === selectedChart}
              onClick = {handleChart}
            />
          );
        })}
      </div>
    );
  };

  const getSelectedChart = () => {
    if (selectedChart === 'distribution') {
      return getDistribution();
    }

    if (selectedChart === 'correlation') {
      return (
        <div style = {{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style = {{ maxWidth: 1000 }}>
            <ChartCorrelationMatrix
              measures = {correlationMeasures}
              caption = {`Across ${allRows.length} teams`}
            />
          </div>
        </div>
      );
    }

    return getChart();
  };

  return (
    <Contents>
      <div style = {{ padding: width < 600 ? `${tableFullscreen ? '10px' : '0px'} 10px 0px 10px` : `${tableFullscreen ? '10px' : '0px'} 20px 0px 20px` }}>
        {
          rows.length && showChart ?
            <>
              {getChartTabs()}
              <div style = {{ marginTop: 10 }}>
                {getSelectedChart()}
              </div>
            </> :
            null
        }
        {
          rows.length && !showChart ?
            <VirtualTable
              ref = {tableRef}
              rows = {rows}
              columns={headCells}
              displayColumns={tableColumns}
              rowKey = {rowKey}
              height={tableStyle.height}
              handleRowClick={(row) => {
                if (view === 'team' && 'team_id' in row) {
                  handleTeam(row.team_id);
                }
                if (
                  (view === 'player' || view === 'transfer') &&
                  'player_id' in row
                ) {
                  handlePlayer(row.player_id);
                }
                if (
                  view === 'conference' &&
                  'conference_id' in row
                ) {
                  handleConference(row.conference_id);
                }
                if (
                  view === 'coach' &&
                  'coach_id' in row
                ) {
                  handleCoach(row.coach_id);
                }
              }}
              decorateRows={rowRenderer}
              decorateHeaderRow={decorateHeaderRow}
              customHandleSort = {handleSort}
              customSortComparator={getComparator}
              defaultSortOrder = {order as defaultSortOrderType} // todo
              defaultSortOrderBy = {orderBy}
              initialScrollTop={tableScrollTop}
            />
            : null
        }
        {
          !rows.length ?
            <div><Typography type='h6' style = {{ textAlign: 'center' }}>No results :(</Typography></div> :
            null
        }
      </div>
    </Contents>
  );
};

export { Client, ClientSkeleton };
