'use client';

import ButtonSwitch from '../ButtonSwitch';
import { setDataKey } from '@/redux/features/ranking-slice';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

/**
 * Table or chart, said out loud.
 *
 * The chart view used to live behind the options menu, which is the right home for a setting a
 * reader already knows exists and the wrong one for a whole second way of reading the page. Anyone
 * arriving for the first time saw a table, had no reason to open a gear icon, and left without
 * learning that the same rows can be plotted - so the most interesting thing the ranking page can
 * do was reachable only by the people who least needed telling.
 *
 * A labelled switch costs a little room at the top of the toolbar and removes the need to know. It
 * also names what is on the other side, which an icon on its own would not: "chart" is a promise a
 * reader can decide whether they want.
 */
const ViewSwitch = ({ view }: { view: string }) => {
  const dispatch = useAppDispatch();
  const chartView = useAppSelector((state) => state.rankingReducer.chartView);

  // team is the only view whose rows carry two measures worth crossing, so it is the only one with
  // a chart to switch to - the hooks above run either way, which is what keeps the order stable
  if (view !== 'team') {
    return null;
  }

  const handleClick = (value: string) => {
    const wantsChart = value === 'Chart';

    if (wantsChart === chartView) {
      return;
    }

    dispatch(setDataKey({ key: 'chartView', value: wantsChart }));

    // the chart tabs only exist inside chart view, so the url stops naming one on the way back to
    // the table rather than carrying a dead param around the rest of the site
    if (!wantsChart) {
      dispatch(setDataKey({ key: 'chart', value: null }));
    }
  };

  return (
    <ButtonSwitch
      leftTitle = 'Table'
      rightTitle = 'Chart'
      selected = {chartView ? 'Chart' : 'Table'}
      handleClick = {handleClick}
      fontSize = '0.75rem'
      style = {{ width: 'auto', margin: '0px 8px 0px 0px' }}
    />
  );
};

export default ViewSwitch;
