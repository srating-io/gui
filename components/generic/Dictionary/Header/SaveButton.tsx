'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/dictionary-slice';
import { Button } from '@esmalley/react-material-ui';
import { useClientAPI } from '@/components/clientAPI';

/**
 * Saves the row being edited in RowDetails. It reads the edited values from the
 * dictionary slice so the button can live in the header while the form does not.
 */
const SaveButton = ({ table }: { table: string }) => {
  const dispatch = useAppDispatch();
  const row = useAppSelector((s) => s.dictionaryReducer.row);
  const form = useAppSelector((s) => s.dictionaryReducer.form);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    dispatch(setDataKey({ key: 'formError', value: '' }));
    try {
      const res = await useClientAPI({
        class: table,
        function: 'update',
        arguments: form,
      });
      if (res && res.error) {
        dispatch(setDataKey({ key: 'formError', value: res.error }));
      }
    } catch (e: unknown) {
      dispatch(setDataKey({ key: 'formError', value: (e as Error).message || 'An error occurred while saving.' }));
    } finally {
      setSaving(false);
    }
  };

  // Nothing to save until the row has loaded
  if (!row || !Object.keys(row).length) {
    return null;
  }

  return (
    <Button
      title={saving ? 'Saving...' : 'Save'}
      value="save"
      onClick={handleSave}
      disabled={saving}
    />
  );
};

export default SaveButton;
