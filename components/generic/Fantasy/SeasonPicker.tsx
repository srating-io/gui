'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setDataKey } from '@/redux/features/fantasy-slice';
import OptionPicker, { optionType } from '@/components/generic/OptionPicker';


/**
 * Which season of leagues the home page is showing.
 *
 * The options come from loadHome, so a season is only offered when it actually has a league to
 * show. Until that lands the sport's current season is the only entry, which is also the default.
 */
const SeasonPicker = () => {
  const dispatch = useAppDispatch();
  const current_season = useAppSelector((state) => state.organizationReducer.season);
  const selected_season = useAppSelector((state) => state.fantasyReducer.season);
  const seasons = useAppSelector((state) => state.fantasyReducer.seasons);

  const season = selected_season ?? current_season;

  const available = (seasons && seasons.length ? seasons : [current_season]);

  const options: optionType[] = [...available]
    .sort((a, b) => b - a)
    .map((value) => {
      return {
        value: value.toString(),
        label: `${value - 1} - ${value}`,
      };
    });

  const handleSeason = (value: string | number | null) => {
    if (value === null || +value === season) {
      return;
    }

    dispatch(setDataKey({ key: 'season', value: +value }));
  };

  return (
    <OptionPicker
      buttonName = {season ? season.toString() : 'Season'}
      options = {options}
      selected = {[season ? season.toString() : null]}
      actionHandler = {handleSeason}
      isRadio = {true}
    />
  );
};

export default SeasonPicker;
