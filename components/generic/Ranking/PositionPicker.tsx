'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import OptionPicker, { optionType } from '../OptionPicker';
import Organization from '@/components/helpers/Organization';
import { updateDataKey } from '@/redux/features/display-slice';
import { useEffect } from 'react';
import { getStore } from '@/app/StoreProvider';
import { Objector } from '@esmalley/ts-utils';
import { useWindowDimensions } from '@esmalley/react-material-ui';


const PositionPicker = ({ selected, isRadio = false }: { selected: string[]; isRadio?: boolean; }) => {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);

  let options: optionType[] = [];

  const breakPoint = width <= 425;

  if (Organization.getNBAID() === organization_id) {
    options = [
      { value: 'all', label: 'All' },
      { value: 'G', label: 'Guard' },
      { value: 'F', label: 'Forward' },
      { value: 'C', label: 'Center' },
      { value: 'C-F', label: 'Center - Forward' },
      { value: 'F-C', label: 'Forward - Center' },
      { value: 'F-G', label: 'Forward - Gaurd' },
      { value: 'G-F', label: 'Guard - Forward' },
    ];
  } else if (Organization.getCBBID() === organization_id) {
    options = [
      { value: 'all', label: 'All' },
      { value: 'G', label: 'Guard' },
      { value: 'F', label: 'Forward' },
      { value: 'C', label: 'Center' },
    ];
  } else if (Organization.getCFBID() === organization_id) {
    options = [
      { value: 'QB', label: (breakPoint ? 'QB' : 'Quarterback') },
      { value: 'rushing', label: (breakPoint ? 'Rush' : 'Rushing') },
      { value: 'receiving', label: (breakPoint ? 'REC.' : 'Receiving') },
    ];
  }

  const selectedOption = (selected && selected.length) ? selected : ['all'];

  /**
   * Dont touch this
   */
  useEffect(() => {
    const timer = setTimeout(
      () => {
        let run = false;
        const current = new URLSearchParams(window.location.search);
        const urlPositions = current.getAll('positions');

        const store = getStore();
        const positions = Objector.deepClone(store.getState().displayReducer.positions);

        if (positions && positions.length) {
          let same = true;
          for (let i = 0; i < positions.length; i++) {
            if (!urlPositions.includes(positions[i])) {
              same = false;
              break;
            }
          }

          if (!same || urlPositions.length !== positions.length) {
            current.delete('positions');
            for (let i = 0; i < positions.length; i++) {
              current.append('positions', positions[i]);
            }
            run = true;
          }
        } else if (urlPositions && urlPositions.length) {
          current.delete('positions');
          run = true;
        }


        if (run) {
          window.history.replaceState(null, '', `?${current.toString()}`);
        }
      },
      0,
    );

    return () => clearTimeout(timer);
  }, []);

  const handlePosition = (value: string) => {
    if (isRadio) {
      dispatch(updateDataKey({ key: 'positions', value: [] }));
      dispatch(updateDataKey({ key: 'positions', value }));
    } else if (value === 'all') {
      dispatch(updateDataKey({ key: 'positions', value: [] }));
    } else {
      dispatch(updateDataKey({ key: 'positions', value }));
    }
  };

  let buttonName = width < 500 ? 'Pos.' : 'Positions';

  if (isRadio && selectedOption && selectedOption.length === 1) {
    options.some((o) => {
      if (o.value === selectedOption[0]) {
        buttonName = o.label;
        return true;
      }
      return false;
    });
  }

  return (
    <>
      <OptionPicker buttonName = {buttonName} options = {options} selected = {selectedOption} actionHandler = {handlePosition} isRadio = {isRadio} />
    </>
  );
};

export default PositionPicker;
