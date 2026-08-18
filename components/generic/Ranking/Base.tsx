'use client';

import { Profiler, useEffect, useState } from 'react';
import Legend from './Legend';
import FloatingButtons from './FloatingButtons';
// import CheckIcon from '@esmalley/react-material-icons/Check';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import OptionPicker from '../OptionPicker';
import { updateDataKey } from '@/redux/features/display-slice';
import { updateDataKey as updateDataKeyRanking } from '@/redux/features/ranking-slice';
import AdditionalOptions from './AdditionalOptions';
import Search from './Search';
import LastUpdated from './LastUpdated';
import Organization from '@/components/helpers/Organization';
import ColumnChipPicker from './ColumnChipPicker';
import DownloadOption from './DownloadOption';
import ConferenceChips from '../ConferenceChips';
import ConferencePicker from '../ConferencePicker';
import PositionPicker from './PositionPicker';
import TableColumns from '@/components/helpers/TableColumns';
import ClassYearPicker from './ClassYearPicker';
import { Textor } from '@esmalley/ts-utils';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Chip, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import DataSince from './DataSince';


const Base = (
  { organization_id, division_id, season, view, children }:
  { organization_id: string, division_id: string, season: number, view: string, children: React.JSX.Element | React.JSX.Element[] },
) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const organization_id_x_division_id_x_ranking_seasons = useAppSelector((state) => state.dictionaryReducer.organization_id_x_division_id_x_ranking_seasons);
  const class_years = useAppSelector((state) => state.rankingReducer.class_years);
  const positions = useAppSelector((state) => state.displayReducer.positions);
  const tableFullscreen = useAppSelector((state) => state.rankingReducer.tableFullscreen);
  const columnView = useAppSelector((state) => state.rankingReducer.columnView);
  const customColumns = useAppSelector((state) => state.rankingReducer.customColumns);
  const career = useAppSelector((state) => state.rankingReducer.career);
  const career_active = useAppSelector((state) => state.rankingReducer.career_active);

  const [legendOpen, setLegendOpen] = useState(false);

  const columns = TableColumns.getViewableColumns({ organization_id, view, columnView, customColumns, positions, career: (career === 1 || career_active === 1) });

  let seasons = (
    organization_id in organization_id_x_division_id_x_ranking_seasons &&
    division_id in organization_id_x_division_id_x_ranking_seasons[organization_id] &&
    organization_id_x_division_id_x_ranking_seasons[organization_id][division_id]
  ) || [];

  if (view === 'transfer') {
    seasons = [2026, 2025, 2024];
  }

  const { width } = useWindowDimensions();

  useEffect(() => {
    if (
      Organization.getCFBID() === organization_id &&
      view === 'player' &&
      !positions.length
    ) {
      dispatch(updateDataKey({ key: 'positions', value: 'QB' }));
    }
    // console.timeEnd('Base')
  }, [view]);
  // const breakPoint = 425;

  const rankViewOptions = [
    { value: 'team', label: 'Team rankings' },
    { value: 'conference', label: 'Conference rankings' },
    { value: 'coach', label: 'Coach rankings' },
    { value: 'player', label: 'Player rankings' },
  ];

  const ranking_type_options = [
    {
      value: 'season',
      label: 'Season ranking',
      sublabel: 'Statistics for entire season.',
    },
    {
      value: 'career',
      label: 'Career ranking',
      sublabel: 'Statistics for all players career.',
    },
    {
      value: 'career_active',
      label: 'Career (active) ranking',
      sublabel: 'Statistics for all active players career.',
    },
  ];

  let selected_ranking_type = 'season';
  let ranking_type_title = 'Season ranking';
  if (career) {
    selected_ranking_type = 'career';
    ranking_type_title = width <= 475 ? 'Career' : 'Career ranking';
  } else if (career_active) {
    selected_ranking_type = 'career_active';
    ranking_type_title = width <= 475 ? 'Career active' : 'Career (active) ranking';
  }

  if (Organization.getCBBID() === organization_id) {
    rankViewOptions.push({ value: 'transfer', label: 'Transfer rankings' });
  }

  let sport = 'basketball';
  if (Organization.getCFBID() === organization_id) {
    sport = 'football';
  }


  const positionChips: React.JSX.Element[] = [];
  if (Organization.getCFBID() !== organization_id) {
    for (let i = 0; i < positions.length; i++) {
      positionChips.push(<Chip key = {positions[i]} value = {positions[i]} style = {{ margin: '5px' }} title={positions[i]} onDelete={() => { dispatch(updateDataKey({ key: 'positions', value: positions[i] })); }} />);
    }
  }

  const classChips: React.JSX.Element[] = [];
  for (let i = 0; i < class_years.length; i++) {
    classChips.push(<Chip key = {class_years[i]} value = {class_years[i]} style = {{ margin: '5px' }} title={class_years[i]} onDelete={() => { dispatch(updateDataKeyRanking({ key: 'class_years', value: class_years[i] })); }} />);
  }


  const handleRankView = (newRankView: string) => {
    if (newRankView !== view) {
      // todo move this to the state or navigation component
      localStorage.removeItem(`${organization_id}.RANKING.COLUMNS.${view}`);
      navigation.rankingView({ view: newRankView });
    }
  };

  const handleRankType = (rank_type_value: string) => {
    if (rank_type_value === 'season') {
      navigation.rankingView({ career: 0, career_active: 0 });
    } else if (rank_type_value === 'career') {
      navigation.rankingView({ career: 1, career_active: 0 });
    } else if (rank_type_value === 'career_active') {
      navigation.rankingView({ career: 0, career_active: 1 });
    }
  };


  const handleSeason = (newSeason) => {
    if (newSeason !== season) {
      navigation.rankingView({ season: newSeason });
    }
  };

  const handleLegend = () => {
    setLegendOpen(!legendOpen);
  };

  const seasonOptions = seasons.map((value) => {
    return {
      value: value.toString(),
      label: `${value - 1} - ${value}`,
    };
  });

  let title = `College ${sport} ${view} rankings.`;

  if (Organization.getNBAID() === organization_id) {
    title = `NBA ${view} rankings.`;
  }

  let classYearPicker: null | React.JSX.Element = null;
  if (
    (
      organization_id === Organization.getCBBID() ||
      organization_id === Organization.getCFBID()
    ) &&
    (view === 'transfer' || view === 'player') &&
    width > 700
  ) {
    classYearPicker = <ClassYearPicker selected = {class_years} />;
  }


  return (
    <Profiler id="Ranking.Base" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
    <div>
      <Legend open = {legendOpen} onClose={handleLegend} columns={columns} view={view} organization_id = {organization_id} />
      <FloatingButtons />
      {
        !tableFullscreen ?
            <div style = {{ padding: '5px 10px 0px 10px' }}>
              <div style = {{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                  {view === 'player' ? <OptionPicker buttonName={ranking_type_title} options = {ranking_type_options} selected = {[selected_ranking_type]} actionHandler = {handleRankType} isRadio = {true} /> : ''}
                </div>
                <div style = {{ display: 'flex', justifyContent: 'right', flexWrap: 'wrap' }}>
                  <OptionPicker buttonName = {Textor.toSentenceCase(`${view} rankings`)} options = {rankViewOptions} selected = {[view]} actionHandler = {handleRankView} isRadio = {true} />
                  <OptionPicker buttonName = {season.toString()} options = {seasonOptions} selected = {[season.toString()]} actionHandler = {handleSeason} isRadio = {true} />
                </div>
              </div>
              <Typography type = {width < 500 ? 'h6' : 'h5'}>{title}</Typography>
              <DataSince organization_id={organization_id} view = {view} />
              <LastUpdated view = {view} handleLegend={handleLegend} />
              <ColumnChipPicker view = {view} organization_id={organization_id} />
              <div style = {{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {view === 'player' || view === 'transfer' ? <AdditionalOptions view = {view} /> : ''}
                  {view !== 'conference' ? <ConferencePicker /> : ''}
                  {view === 'player' || view === 'transfer' ? <PositionPicker selected = {positions} isRadio = {Organization.getCFBID() === organization_id} /> : ''}
                  {classYearPicker}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Search view = {view} />
                  {width >= 385 ? <DownloadOption view={view} organization_id={organization_id} division_id={division_id} season={season} /> : ''}
                </div>
              </div>
              <ConferenceChips />
              {positionChips}
              {classChips}
            </div>
          : ''
      }
      {children}
    </div>
    </Profiler>
  );
};

export default Base;
