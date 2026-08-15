'use client';

import { useTransition } from 'react';


// import FavoritePicker from '@/components/generic/FavoritePicker';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import OptionPicker from '@/components/generic/OptionPicker';
import { setLoading } from '@/redux/features/loading-slice';
import Rank from './Rank';
import { getBreakPoint } from './ClientWrapper';
import Record from './Record';
import { Typography, useWindowDimensions } from '@esmalley/react-material-ui';
import { Basketball, Football } from '@srating-io/types';


const Client = (
  {
    conference_statistic_ranking,
    season,
    conference_id,
    seasons,
  }:
  {
    conference_statistic_ranking: Basketball.ConferenceStatisticRankings | Football.ConferenceStatisticRankings,
    season: number,
    conference_id: string,
    seasons: number[],
  },
) => {
  const dispatch = useAppDispatch();
  const conferences = useAppSelector((state) => state.dictionaryReducer.conference);

  const conference = conferences[conference_id];

  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const { width } = useWindowDimensions();

  const [isPending, startTransition] = useTransition();

  const seasonOptions = seasons.sort((a, b) => b - a).map((value) => {
    return {
      value: value.toString(),
      label: `${value - 1} - ${value}`,
    };
  });

  const handleSeason = (season) => {
    if (searchParams) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('season', season);
      const search = current.toString();
      const query = search ? `?${search}` : '';
      dispatch(setLoading(true));
      startTransition(() => {
        router.push(`${pathName}${query}`);
      });
    }
  };

  return (
    <div style = {{ overflow: 'hidden', paddingLeft: 5, paddingRight: 5 }}>
      <div style = {{ display: 'flex', flexWrap: 'nowrap' }}>
        <Typography style = {{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} type = {(width < getBreakPoint() ? 'h6' : 'h5')}>
          <Rank conference_statistic_ranking={conference_statistic_ranking} />
          {conference.name}
        </Typography>
        <OptionPicker buttonName = {season.toString()} options = {seasonOptions} selected = {[season.toString()]} actionHandler = {handleSeason} isRadio = {true} />
      </div>
      <div style = {{ display: 'flex', justifyContent: 'center' }}>
        <span style = {{ fontSize: '16px', verticalAlign: 'middle' }}>
          <Record />
        </span>
      </div>
    </div>
  );
};

export default Client;
