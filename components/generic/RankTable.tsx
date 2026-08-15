'use client';

import { useEffect, useState } from 'react';
import RankSpan from './RankSpan';
import {
  Table, TableColumnsType, Tbody, Td, Tfoot, Th, Thead, Tooltip, Tr, useTheme, useWindowDimensions,
} from '@esmalley/react-material-ui';
import { Objector, Sorter } from '@esmalley/ts-utils';


type defaultSortOrderType = 'asc' | 'desc';

const RankTable = (
  {
    rows,
    footerRow = null,
    columns,
    displayColumns,
    rowKey,
    defaultSortOrder,
    defaultSortOrderBy,
    defaultEmpty = 0,
    sessionStorageKey,
    getRankSpanMax,
    secondaryKey,
    handleRowClick,
    customSortComparator,
    useAlternateLabel = false,
  }:
  {
    rows: object[],
    footerRow?: object | null,
    columns: TableColumnsType,
    displayColumns: string[],
    rowKey: string,
    defaultSortOrder: defaultSortOrderType,
    defaultSortOrderBy: string,
    defaultEmpty?: string | number,
    sessionStorageKey: string,
    getRankSpanMax?: (row: object) => number,
    secondaryKey?: string,
    handleRowClick?: (id: string) => void,
    customSortComparator?: (order: string, orderBy: string, direction?: string) => (a: unknown, b: unknown) => number,
    useAlternateLabel?: boolean;
  },
) => {
  const breakPoint = 425;
  let numberOfStickyColumns = 0;
  const { width } = useWindowDimensions();
  const theme = useTheme();

  const sessionOrder = sessionStorage.getItem(`${sessionStorageKey}.ORDER`) || null;
  const sessionOrderBy = sessionStorage.getItem(`${sessionStorageKey}.ORDERBY`) || null;

  const [order, setOrder] = useState<string>(sessionOrder || defaultSortOrder);
  const [orderBy, setOrderBy] = useState<string>(sessionOrderBy || defaultSortOrderBy);

  const sortedRows = customSortComparator ?
    rows.sort(customSortComparator(order, orderBy, (columns[orderBy] && columns[orderBy].sort))) :
    rows.sort(Sorter.getComparator(order, orderBy, (columns[orderBy] && columns[orderBy].sort)));


  // Update internal state whenever the prop changes
  useEffect(() => {
    if (!sessionOrder) {
      setOrder(defaultSortOrder);
    }

    if (!sessionOrderBy) {
      setOrderBy(defaultSortOrderBy);
    }
  }, [defaultSortOrderBy, defaultSortOrder]);

  for (let i = 0; i < displayColumns.length; i++) {
    if (
      displayColumns[i] in columns &&
      'sticky' in columns[displayColumns[i]] &&
      columns[displayColumns[i]].sticky === true
    ) {
      numberOfStickyColumns++;
    }
  }

  const handleSort = (id: string) => {
    const isAsc = orderBy === id && order === 'asc';
    sessionStorage.setItem(`${sessionStorageKey}.ORDER`, (isAsc ? 'desc' : 'asc'));
    sessionStorage.setItem(`${sessionStorageKey}.ORDERBY`, id);
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  };

  let b = 0;
  const i_x_left = {};

  const getMax = (row) => {
    if (
      'max' in row &&
      row.max
    ) {
      return row.max;
    }

    if (getRankSpanMax) {
      return getRankSpanMax(row);
    }
    return 0;
  };

  const row_containers = sortedRows.slice().map((row) => {
    let tdColor = (b % 2 === 0 ? theme.grey[800] : theme.grey[900]);

    if (theme.mode === 'light') {
      tdColor = b % 2 === 0 ? theme.grey[200] : theme.grey[300];
    }

    b++;

    const tdStyle: React.CSSProperties = {
      padding: '4px 5px',
      backgroundColor: tdColor,
      border: 0,
      borderTop: 0,
      borderLeft: 0,
      borderBottom: 0,
      whiteSpace: 'nowrap',
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

      let secondarySpan: string | React.JSX.Element = '';

      if (secondaryKey && row[`${displayColumns[i]}_${secondaryKey}`]) {
        secondarySpan = (
          <span style = {{ color: theme.grey[500] }}> {row[`${displayColumns[i]}_${secondaryKey}`]}</span>
        );
      } else if (row[`${displayColumns[i]}_rank`]) {
        secondarySpan = <RankSpan key = {i} rank = {row[`${displayColumns[i]}_rank`]} max = {getMax(row)} useOrdinal = {true} />;
      }

      tableCells.push(
        <Td key = {i} style = {cellStyle}>{row[displayColumns[i]] || defaultEmpty}{secondarySpan}</Td>,
      );
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
        style={TableRowCSS}
        key={row[rowKey]}
        onClick={() => {
          if (handleRowClick) {
            handleRowClick(row[rowKey]);
          }
        }}
      >
        {tableCells}
      </Tr>
    );
  });
  return (
    <Table>
      <Thead>
        <Tr>
          {displayColumns.map((column, i) => {
            const headCell = columns[column];
            if (!headCell) {
              console.warn('missing headCell: ', column);
              return <></>;
            }
            const tdStyle: React.CSSProperties = {
              padding: '4px 5px',
              border: 0,
              backgroundColor: theme.mode === 'light' ? theme.info.light : theme.info.dark,
            };

            let tdWidth: number | null = null;
            const tdLeft: number = (i - 1 in i_x_left ? i_x_left[i - 1] : 0);

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
              tdStyle.width = tdWidth;
              tdStyle.minWidth = tdWidth;
              tdStyle.maxWidth = tdWidth;
            }


            if (width <= breakPoint) {
              tdStyle.fontSize = '13px';
            }

            if (headCell.sticky) {
              tdStyle.position = 'sticky';
              tdStyle.zIndex = 3;
              tdStyle.left = tdLeft;

              if (!(i in i_x_left)) {
                i_x_left[i] = (tdWidth || 0) + (tdLeft || 0);
              }
            } else {
              tdStyle.whiteSpace = 'nowrap';
            }

            if (i + 1 === numberOfStickyColumns) {
              tdStyle.borderRight = `3px solid ${theme.mode === 'light' ? theme.info.light : theme.info.dark}`;
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
      </Thead>
      <Tbody>
        {row_containers}
      </Tbody>
      {
        footerRow !== null ?
        <Tfoot>
          <Tr>
            {displayColumns.map((column, i) => {
              const headCell = columns[column];

              const tdColor = theme.mode === 'light' ? theme.grey[300] : theme.grey[900];

              const tdStyle: React.CSSProperties = {
                padding: '4px 5px',
                border: 0,
                backgroundColor: tdColor,
              };

              let tdWidth: number | null = null;
              const tdLeft: number = (i - 1 in i_x_left ? i_x_left[i - 1] : 0);

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
                tdStyle.width = tdWidth;
                tdStyle.minWidth = tdWidth;
                tdStyle.maxWidth = tdWidth;
              }


              if (width <= breakPoint) {
                tdStyle.fontSize = '13px';
              }

              if (headCell.sticky) {
                tdStyle.position = 'sticky';
                tdStyle.zIndex = 3;
                tdStyle.left = tdLeft;

                if (!(i in i_x_left)) {
                  i_x_left[i] = (tdWidth || 0) + (tdLeft || 0);
                }
              } else {
                tdStyle.whiteSpace = 'nowrap';
              }

              if (i + 1 === numberOfStickyColumns) {
                tdStyle.borderRight = `3px solid ${theme.mode === 'light' ? theme.info.light : theme.info.dark}`;
              }

              if (column in footerRow) {
                let secondarySpan: string | React.JSX.Element = '';

                if (secondaryKey && footerRow[`${column}_${secondaryKey}`]) {
                  secondarySpan = (
                    <span style = {{ color: theme.grey[500] }}> {footerRow[`${column}_${secondaryKey}`]}</span>
                  );
                }

                return (
                  <Td key = {column} style = {tdStyle}>{footerRow[column]}{secondarySpan}</Td>
                );
              }

              return null;
            })}
          </Tr>
        </Tfoot>
          : ''
      }
    </Table>
  );
};

export default RankTable;
