'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { resetDataKey, setDataKey } from '@/redux/features/ranking-slice';
import ColumnPicker from '../ColumnPicker';
import Organization from '@/components/helpers/Organization';
import TableColumns from '@/components/helpers/TableColumns';
import { Textor } from '@esmalley/ts-utils';
import { Chip } from '@esmalley/react-material-ui';

export const getAvailableChips = ({ organization_id, view }) => {
  let availableChips = ['composite'];

  if (Organization.getCBBID() === organization_id) {
    if (view !== 'coach') {
      availableChips = availableChips.concat(['offense', 'defense']);
    }
  }

  if (Organization.getNBAID() === organization_id) {
    if (view !== 'coach') {
      availableChips = availableChips.concat(['offense', 'defense']);
    }
  }

  if (Organization.getCFBID() === organization_id) {
    if (view !== 'coach' && view !== 'player') {
      availableChips = availableChips.concat(['offense', 'defense']);
    }
  }

  return availableChips;
};



const ColumnChipPicker = ({ organization_id, view }) => {
  const dispatch = useAppDispatch();
  const columnView = useAppSelector((state) => state.rankingReducer.columnView);
  const customColumns = useAppSelector((state) => state.rankingReducer.customColumns);

  const headCells = TableColumns.getColumns({ organization_id, view });

  const handleCustomColumns = (value: string) => {
    const newColumns = [...customColumns];

    const index = newColumns.indexOf(value);

    if (index !== -1) {
      newColumns.splice(index, 1);
    } else {
      newColumns.push(value);
    }

    dispatch(setDataKey({ key: 'customColumns', value: newColumns }));
  };

  const handleRankingView = (value: string) => {
    dispatch(setDataKey({ key: 'columnView', value }));
    dispatch(resetDataKey('customColumns'));
  };

  const getChips = () => {
    const chips: React.JSX.Element[] = [];

    const availableChips = getAvailableChips({ organization_id, view });

    availableChips.forEach((value) => {
      chips.push(
        <Chip key = {value} style = {{ margin: '5px' }} title={Textor.toSentenceCase(value)} filled={(columnView === value)} value = {value} onClick={() => handleRankingView(value)} />,
      );
    });

    return chips;
  };

  return (
    <div style = {{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {getChips()}
      <ColumnPicker
        key = {view}
        filled = {(columnView === 'custom')}
        options = {headCells}
        selected = {customColumns}
        actionHandler = {handleCustomColumns}
        firstRunAction = {handleRankingView}
      />
    </div>
  );
};

export default ColumnChipPicker;
