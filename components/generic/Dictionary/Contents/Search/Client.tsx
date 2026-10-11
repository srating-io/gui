'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import {
  TextInput, Table, Thead, Tbody, Tr, Th, Td, useTheme, Typography,
  Tile, useWindowDimensions,
} from '@esmalley/react-material-ui';
import { Textor } from '@esmalley/ts-utils';
import { Storage as StorageIcon } from '@esmalley/react-material-icons/Storage';
import { Search as SearchIcon } from '@esmalley/react-material-icons/Search';
import { headerBarHeight } from '@/components/generic/Header';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { getHeaderHeight } from '../../Header/ClientWrapper';

type Row = Record<string, unknown>;

type Column = {
  label: string;
  style?: React.CSSProperties;
  render: (row: Row) => React.ReactNode;
};

type View = {
  rows: Row[];
  placeholder: string;
  columns: Column[];
  matches: (row: Row, search: string) => boolean;
  key: (row: Row) => string;
  href: (row: Row) => string;
  empty: string;
};

const tables: Row[] = [
  {
    name: 'conference',
    description: 'List of conferences',
  },
  {
    name: 'division',
    description: 'List of divisions',
  },
  {
    name: 'fantasy_payout_rule',
    description: 'List of fantasy payout rules',
  },
  {
    name: 'organization',
    description: 'List of organizations',
  },
  {
    name: 'team',
    description: 'List of teams',
  },
  {
    name: 'coach',
    description: 'List of coaches',
  },
  {
    name: 'terminology',
    description: 'List of terminologies',
  },
];

/**
 * Lists the dictionary tables when no table is selected, otherwise lists that
 * table's rows. Both are a search box over a clickable table, so they share
 * everything but the column set and where a row click navigates.
 */
const Search = ({ table }: { table?: string }) => {
  const router = useRouter();
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const rows = useAppSelector((s) => s.dictionaryReducer.rows);

  const cellStyle: React.CSSProperties = { padding: '12px 16px' };

  const tableView: View = {
    rows: Object.values(rows),
    placeholder: 'Search by name, code, or ID...',
    columns: [
      {
        label: 'ID',
        style: cellStyle,
        render: (row) => (
          <Typography type="caption" style={{ color: theme.text.secondary }}>
            {String(row[`${table}_id`])}
          </Typography>
        ),
      },
      {
        label: 'Code',
        style: cellStyle,
        render: (row) => (
          <Typography type="body2" style={{ color: theme.text.secondary }}>
            {(row.code as string) || '-'}
          </Typography>
        ),
      },
      {
        label: 'Name',
        style: cellStyle,
        render: (row) => (
          <Typography type="body2" style={{ fontWeight: 500 }}>
            {(row.name as string) || 'Unnamed'}
          </Typography>
        ),
      },
    ],
    matches: (row, s) => {
      const code = (row.code as string)?.toLowerCase() || '';
      const name = (row.name as string)?.toLowerCase() || '';
      const id = String(row[`${table}_id`] || '').toLowerCase();
      return code.includes(s) || name.includes(s) || id.includes(s);
    },
    key: (row) => String(row[`${table}_id`]),
    href: (row) => `/dictionary?table=${table}&table_id=${row[`${table}_id`]}`,
    empty: 'No results found.',
  };

  const selectorView: View = {
    rows: tables,
    placeholder: 'Search...',
    columns: [
      {
        label: 'Table',
        render: (row) => (
          <Tile
            primary = {Textor.toSentenceCase((row.name as string).replaceAll('_', ' '))}
            secondary= {row.description as string}
            icon = {<StorageIcon style={{ marginRight: '12px', color: theme.text.secondary, fontSize: 20 }} />}
          />
        ),
      },
    ],
    matches: (row, s) => {
      const name = (row.name as string).toLowerCase();
      return name.includes(s) || Textor.toSentenceCase(row.name as string).toLowerCase().includes(s);
    },
    key: (row) => row.name as string,
    href: (row) => `/dictionary?table=${row.name}`,
    empty: 'No tables found.',
  };

  const view = table ? tableView : selectorView;

  const filteredRows = view.rows.filter((row) => {
    if (!search) return true;
    return view.matches(row, search.toLowerCase());
  });

  const { height, width } = useWindowDimensions();
  const topBarHeight = width < 600 ? 56 : headerBarHeight;
  const headerHeight = getHeaderHeight();
  const footerHeight = footerNavigationHeight;
  const containerPaddingTop = table ? 20 : 0;
  const containerPaddingBottom = 20;
  const searchBarHeight = 46;
  const searchBarMarginBottom = 16;
  const buffer = 8;

  const totalOffset = topBarHeight + headerHeight + footerHeight + containerPaddingTop + containerPaddingBottom + searchBarHeight + searchBarMarginBottom + buffer;

  const availableHeight = height > 0 ? Math.max(height - totalOffset, 200) : undefined;

  const overlayStyle: React.CSSProperties = {
    maxHeight: availableHeight ? `${availableHeight}px` : `calc(100vh - ${totalOffset}px)`,
    overflowY: 'auto',
  };

  const headerBg = theme.mode === 'light' ? theme.grey[300] : (theme.grey[900] || '#212121');

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    backgroundColor: headerBg,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    borderBottom: `1px solid ${theme.mode === 'light' ? theme.grey[400] : theme.grey[700]}`,
  };

  const searchWrapperStyle: React.CSSProperties = {
    position: 'sticky',
    top: topBarHeight + headerHeight,
    zIndex: 10,
    backgroundColor: theme.background.main,
    paddingBottom: `${searchBarMarginBottom}px`,
    width: '100%',
  };

  return (
    <div style={{ padding: table ? '20px' : '0px 20px 20px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={searchWrapperStyle}>
        <TextInput
          placeholder={view.placeholder}
          showError = {false}
          value={search}
          icon={<SearchIcon style = {{ fontSize: 24 }} />}
          variant = "standard"
          onChange={(val) => setSearch(val as string)}
          style={{ width: '100%' }}
        />
      </div>

      <Table overlayStyle={overlayStyle}>
        <Thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: headerBg }}>
          <Tr style={{ backgroundColor: headerBg }}>
            {view.columns.map((column) => (
              <Th key={column.label} style={thStyle}>
                <Typography type="subtitle2" style={{ fontWeight: 600 }}>
                  {column.label}
                </Typography>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {filteredRows.map((row, index) => {
            let rowColor = index % 2 === 0 ? theme.grey[800] : theme.grey[900];
            if (theme.mode === 'light') {
              rowColor = index % 2 === 0 ? theme.grey[200] : theme.grey[300];
            }

            const TableRowCSS = {
              backgroundColor: rowColor,
              cursor: 'pointer',
              '&:hover td': {
                backgroundColor: theme.mode === 'light' ? theme.info.light : theme.info.dark,
              },
            };

            return (
              <Tr
                key={view.key(row)}
                onClick={() => router.push(view.href(row))}
                style={TableRowCSS}
              >
                {view.columns.map((column) => (
                  <Td key={column.label} style={column.style}>
                    {column.render(row)}
                  </Td>
                ))}
              </Tr>
            );
          })}
          {filteredRows.length === 0 && (
            <Tr>
              <Td colSpan={view.columns.length} style={{ textAlign: 'center', padding: '24px' }}>
                <Typography type="body2" style={{ color: theme.text.secondary }}>
                  {view.empty}
                </Typography>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
};

export default Search;
