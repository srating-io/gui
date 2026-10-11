'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/dashboard-slice';
import { useClientAPI } from '@/components/clientAPI';
import {
  Columns, IconButton, Paper, Slab, Typography, useTheme,
} from '@esmalley/react-material-ui';
import BugReportIcon from '@esmalley/react-material-icons/BugReport';
import { Empty, innerBreakPoint } from '../Panel';
import { Dates } from '@esmalley/ts-utils';
import CheckIcon from '@esmalley/react-material-icons/Check';
import UndoIcon from '@esmalley/react-material-icons/Undo';

/**
 * One bug in full.
 *
 * The three big fields are shown as preformatted text rather than parsed into anything: a stack is
 * read, not queried, and the `state` snapshot is whatever shape the slice had at the moment it
 * broke. `json_context` only exists on a server render error, and `state` only on one caught by the
 * global boundary, so both are conditional.
 */

/**
 * The request context, ready for a `pre`.
 *
 * It arrives as an object rather than as text -- `audit_gui.detail` reads through the generic api
 * path, which parses every `json_` column on the way out -- so it is indented here, which is the
 * one part of this panel worth reading as structure rather than as a line.
 *
 * A string is still handled: a row written before the api validated this column can hold text that
 * never parsed, and the api hands those back untouched rather than failing the whole read.
 */
const context = (value: unknown): string => (
  typeof value === 'string' ? value : JSON.stringify(value, null, 2)
);

const when = (value: string | null): string => {
  if (!value) {
    return '';
  }

  return Dates.format(Dates.parse(value, true), 'M jS Y g:i a');
};

/**
 * A long, unwrapped blob. `pre` keeps a stack's own line breaks, which is the entire point of
 * looking at one, and the scroll is horizontal so a long frame does not reflow the page.
 */
const Blob = ({ title, body }: { title: string, body: string }) => {
  const theme = useTheme();

  return (
    <div style = {{ marginTop: 16 }}>
      <Typography type = 'subtitle2' style = {{ color: theme.text.secondary }}>{title}</Typography>
      <pre style = {{
        margin: '4px 0px 0px 0px',
        padding: 12,
        maxHeight: 360,
        overflow: 'auto',
        fontSize: 12,
        lineHeight: 1.5,
        backgroundColor: theme.background.main,
        border: `1px solid ${theme.grey[theme.mode === 'dark' ? 800 : 300]}`,
        borderRadius: 4,
        color: theme.text.primary,
      }}>{body}</pre>
    </div>
  );
};


const ErrorDetail = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const row = useAppSelector((state) => state.dashboardReducer.errorDetail);

  const [saving, setSaving] = useState(false);

  if (!row) {
    return <Empty message = 'That error is not there any more.' />;
  }

  const handleResolve = async () => {
    setSaving(true);

    const response = await useClientAPI({
      class: 'audit_gui',
      function: 'resolve',
      arguments: {
        audit_gui_id: row.audit_gui_id,
        resolved: row.resolved ? 0 : 1,
      },
    });

    setSaving(false);

    if (!response || response.error) {
      return;
    }

    // reflect it locally rather than refetching the row for one flag
    dispatch(setDataKey({ key: 'errorDetail', value: { ...row, resolved: response.resolved } }));
    // the list is now stale, so drop it and let the loader fetch again on the way back
    dispatch(setDataKey({ key: 'errors', value: null }));
  };

  const resolveTitle = (() => {
    if (saving) {
      return 'Saving...';
    }

    return row.resolved ? 'Reopen' : 'Resolve';
  })();

  const actions = [
      <IconButton
        icon = {row.resolved ? <UndoIcon style = {{ fontSize: 24 }} /> : <CheckIcon style = {{ fontSize: 24 }} />}
        type = 'circle'
        title = {resolveTitle}
        value = 'resolve'
        onClick = {handleResolve}
        disabled = {saving}
      />,
  ];

  return (
    <Paper
      buttons={actions}
      titleIcon = {<BugReportIcon style = {{ color: theme.error.main, fontSize: 24 }} />}
      title = {row.name || 'Error'}
      style = {{ padding: 16, marginBottom: 16 }}
    >
      <Columns numberOfColumns={3} breakPoint = {innerBreakPoint}>
        <Slab label = 'Occurrences' primary = {String(row.occurrences)} primaryStyle = {{ fontWeight: 600 }} />
        <Slab label = 'State' primary = {row.resolved ? 'Resolved' : 'Open'} />
        <Slab label = 'Source' primary = {row.source} />
        <Slab label = 'Route' primary = {row.route || '--'} />
        <Slab label = 'Release' primary = {row.release} />
        <Slab label = 'Reference' primary = {row.digest || '--'} info = 'The digest react gave the browser' />
        <Slab label = 'First seen' primary = {when(row.date_of_entry)} />
        <Slab label = 'Last seen' primary = {when(row.last_seen)} />
        <Slab label = 'Fingerprint' primary = {row.fingerprint.slice(0, 12)} info = {row.fingerprint} />
      </Columns>

      {row.message ? <Blob title = 'Message' body = {row.message} /> : ''}
      {row.stack ? <Blob title = 'Stack' body = {row.stack} /> : ''}
      {row.state ? <Blob title = 'Redux state at the time' body = {row.state} /> : ''}
      {row.json_context ? <Blob title = 'Request context' body = {context(row.json_context)} /> : ''}
    </Paper>
  );
};

export default ErrorDetail;
