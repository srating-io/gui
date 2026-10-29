'use client';

import React, { useEffect } from 'react';

import ButtonSwitch from '@/components/generic/ButtonSwitch';
import { setDataKey } from '@/redux/features/fantasy_group-slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isPreSeasonPool } from './shared';


const SEASON = 'Season';
const CAREER = 'Career';


/**
 * Season stats or active career stats, for both draft tables.
 *
 * Shared so the draft zone and the pre-draft list cannot disagree about which one is showing, and
 * so the preseason default below is decided in one place. Takes the pool rather than building its
 * own -- that is a deep clone and the table calling this already holds one.
 */
const StatViewSwitch = ({ rows, style = { marginBottom: 10 } }: { rows: object[]; style?: React.CSSProperties }) => {
  const dispatch = useAppDispatch();

  const draft_stat_view = useAppSelector((state) => state.fantasyGroupReducer.draft_stat_view);

  const isCareerActive = draft_stat_view === 'career_active';

  const handleClick = (value: string) => {
    const next = value === CAREER ? 'career_active' : 'season';

    if (next !== draft_stat_view) {
      dispatch(setDataKey({ key: 'draft_stat_view', value: next }));
    }
  };

  // Drafts mostly happen before a ball is thrown, and the preseason ranking run leaves every stat
  // at zero, so open on career rather than on a table of nothing. Only while unset -- once this
  // has a value, including one the user picked, it is never overridden.
  useEffect(() => {
    if (draft_stat_view || !rows.length) {
      return;
    }

    dispatch(setDataKey({ key: 'draft_stat_view', value: isPreSeasonPool(rows) ? 'career_active' : 'season' }));
  }, [draft_stat_view, rows, dispatch]);

  return (
    <ButtonSwitch
      leftTitle = {SEASON}
      rightTitle = {CAREER}
      selected = {isCareerActive ? CAREER : SEASON}
      handleClick = {handleClick}
      fontSize = '0.75rem'
      style = {style}
    />
  );
};

export default StatViewSwitch;
