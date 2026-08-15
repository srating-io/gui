'use client';

import React, { Profiler, useEffect, useRef, useState } from 'react';

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
import { Arithmetic, Color, Objector } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import {
  CustomDecorateHeaderRow, CustomDecorateRows, defaultSortOrderType, LinearProgress, Td, Th, Tooltip, Tr, Typography, useTheme, useWindowDimensions, VirtualTable,
} from '@esmalley/react-material-ui';
import { Basketball, Football } from '@srating-io/types';



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

export const decorateRows = <T extends (Basketball.RankingTable | Football.RankingTable), >(
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

        tableCells.push(
          <Td key = {i} style = {cellStyle}>{classSpan}{row[displayColumns[i]]}</Td>,
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
          let max = rows.length;
          if ('max' in row) {
            max = row.max;
          }
          rankSpan = <RankSpan rank = {row[`${displayColumns[i]}_rank`]} useOrdinal = {!('player_id' in row)} max = {max} />;
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
  const positions = useAppSelector((state) => state.displayReducer.positions);

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

  if (data === null) {
    return <ClientSkeleton />;
  }


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

  const tableStyle = {
    maxHeight: height - (tableFullscreen ? 100 : 280) - (width < 380 ? 30 : 0) - (tableFullscreen ? 0 : confHeightModifier) - 40,
    height: height - (tableFullscreen ? 100 : 280) - (width < 380 ? 30 : 0) - (tableFullscreen ? 0 : confHeightModifier) - 40,
  };

  if ((rows.length + 2) * 26 < tableStyle.height) {
    tableStyle.height = (rows.length + 2) * 27;
  }

  if (height < 450) {
    tableStyle.maxHeight = 250;
    tableStyle.height = 250;
  }




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


  return (
    <Profiler id="Ranking.Base.Contents.Client" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
    <Contents>
      <div style = {{ padding: width < 600 ? `${tableFullscreen ? '10px' : '0px'} 10px 0px 10px` : `${tableFullscreen ? '10px' : '0px'} 20px 0px 20px` }}>
        {
          rows.length ?
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
              decorateRows={decorateRows}
              decorateHeaderRow={decorateHeaderRow}
              customHandleSort = {handleSort}
              customSortComparator={getComparator}
              defaultSortOrder = {order as defaultSortOrderType} // todo
              defaultSortOrderBy = {orderBy}
              initialScrollTop={tableScrollTop}
            />
            : <div><Typography type='h6' style = {{ textAlign: 'center' }}>No results :(</Typography></div>
        }
      </div>
    </Contents>
    </Profiler>
  );
};

export { Client, ClientSkeleton };
