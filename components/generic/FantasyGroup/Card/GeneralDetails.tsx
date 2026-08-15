'use client';

import Organization from '@/components/helpers/Organization';
import InfoIcon from '@esmalley/react-material-icons/Info';
import { getTitle, innerBreakPoint, paperStyle } from '../Card';
import { useAppSelector } from '@/redux/hooks';
import { Dates } from '@esmalley/ts-utils';
import { Columns, Paper, Slab, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';


const GeneralDetails = (
  {
    fantasy_group,
  } :
  {
    fantasy_group: General.FantasyGroup
  },
) => {
  const theme = useTheme();
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);

  return (
    <Paper style={paperStyle}>
      <div>
        {getTitle(
          <InfoIcon style = {{ color: theme.info.main, fontSize: 24 }} />,
          'General Details',
        )}
        <Columns numberOfColumns={3} breakPoint = {innerBreakPoint}>
          <Slab
            label = 'League name'
            primary = {fantasy_group.name}
            primaryStyle = {{ fontWeight: 600 }}
          />
          <Slab
            label='Sport'
            primary={`${Organization.getEmoji({ organization_id })} ${organizations[organization_id].code} ${fantasy_group.season}`}
          />

          <Slab
            label='Privacy'
            primary={fantasy_group.private ? 'Private' : 'Public'}
          />
          {
            fantasy_group.start_date && fantasy_group.end_date ?
              <Slab
                label='League duration'
                primary={`${Dates.format(Dates.parse(fantasy_group.start_date, true), 'M jS g:i a ')} to ${Dates.format(Dates.parse(fantasy_group.end_date, true), 'M jS g:i a')}`}
              />
              : ''
          }
        </Columns>
      </div>
    </Paper>
  );
};

export default GeneralDetails;
