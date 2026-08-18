'use client';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import OptionPicker, { optionType } from './OptionPicker';
import { useEffect } from 'react';
import { updateDataKey } from '@/redux/features/display-slice';
import { getStore } from '@/app/StoreProvider';
import { Objector } from '@esmalley/ts-utils';
import { useWindowDimensions } from '@esmalley/react-material-ui';
import Organization from '../helpers/Organization';

const ConferencePicker = () => {
  // console.time('ConferencePicker')
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.displayReducer.conferences);
  const conferences = useAppSelector((state) => state.dictionaryReducer.conference);
  const organization_id_x_division_id_x_season_x_conference_id_x_true = useAppSelector((state) => state.dictionaryReducer.organization_id_x_division_id_x_season_x_conference_id_x_true);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const division_id = useAppSelector((state) => state.organizationReducer.division_id);
  const season = useAppSelector((state) => state.organizationReducer.season);
  const { width } = useWindowDimensions();


  // useEffect(() => {
  //   console.timeEnd('ConferencePicker')
  // })


  /**
   * Dont touch this
   */
  useEffect(() => {
    const timer = setTimeout(
      () => {
        let run = false;
        const current = new URLSearchParams(window.location.search);
        const urlConferences = current.getAll('conferences');

        const store = getStore();
        const conferences = Objector.deepClone(store.getState().displayReducer.conferences);

        if (conferences && conferences.length) {
          let same = true;
          for (let i = 0; i < conferences.length; i++) {
            if (!urlConferences.includes(conferences[i])) {
              same = false;
              break;
            }
          }

          if (!same || urlConferences.length !== conferences.length) {
            current.delete('conferences');
            for (let i = 0; i < conferences.length; i++) {
              current.append('conferences', conferences[i]);
            }
            run = true;
          }
        } else if (urlConferences && urlConferences.length) {
          current.delete('conferences');
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

  const conferenceOptions: optionType[] = [
    { value: null, label: 'All' },
  ];

  for (const conference_id in conferences) {
    const row = conferences[conference_id];
    if (
      !(organization_id in organization_id_x_division_id_x_season_x_conference_id_x_true) ||
      !(division_id in organization_id_x_division_id_x_season_x_conference_id_x_true[organization_id]) ||
      !(season in organization_id_x_division_id_x_season_x_conference_id_x_true[organization_id][division_id]) ||
      !(conference_id in organization_id_x_division_id_x_season_x_conference_id_x_true[organization_id][division_id][season])
    ) {
      continue;
    }
    if (row.inactive === 0) {
      let label = row.code;
      if (row.code.toLowerCase() === row.name.toLowerCase()) {
        label = row.name;
      }
      conferenceOptions.push({
        value: row.conference_id,
        label,
      });
    }
  }

  // rip PAC-12, you are now garbo
  const priority = [
    'a9f23620-1095-11ef-9686-72fab666226a', // Big 12
    'a933edfd-1095-11ef-9686-72fab666226a', // ACC
    'aa230787-1095-11ef-9686-72fab666226a', // Big east
    'aaa5086f-1095-11ef-9686-72fab666226a', // Big ten
    'ad5f5c4f-1095-11ef-9686-72fab666226a', // SEC
  ];

  conferenceOptions.sort((a, b) => {
    // sort all first
    if (!a.value) {
      return -1;
    }
    if (!b.value) {
      return 1;
    }

    // other
    if (a.value === '006bbb2b-10c2-11ef-9686-72fab666226a') {
      return 1;
    }
    if (b.value === '006bbb2b-10c2-11ef-9686-72fab666226a') {
      return -1;
    }

    // sort priority first
    if (priority.indexOf(a.value) > -1 && priority.indexOf(b.value) === -1) {
      return -1;
    }
    if (priority.indexOf(b.value) > -1 && priority.indexOf(a.value) === -1) {
      return 1;
    }

    // sort alphabetically
    return a.label.localeCompare(b.label);
  });


  const handleClick = (value: string | null) => {
    const v = value || [];
    dispatch(updateDataKey({ key: 'conferences', value: v }));
  };

  let buttonName = organization_id === Organization.getNBAID() ? 'Divisions' : 'Conferences';

  if (width <= 475) {
    buttonName = organization_id === Organization.getNBAID() ? 'Div.' : 'Conf.';
  }



  return (
    <div>
      <OptionPicker buttonName = {buttonName} options = {conferenceOptions} selected = {selected.length ? selected : [null]} actionHandler = {handleClick} isRadio = {false} autoClose={true} />
    </div>
  );
};

export default ConferencePicker;
