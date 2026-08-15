'use client';

import AttachMoneyIcon from '@esmalley/react-material-icons/AttachMoney';
import { getTitle, innerBreakPoint, paperStyle } from '../Card';
import { Columns, Paper, Slab, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';


const EntriesAndFees = (
  {
    fantasy_group,
  } :
  {
    fantasy_group: General.FantasyGroup
  },
) => {
  const theme = useTheme();

  return (
    <Paper style={paperStyle}>
      <div>
        {getTitle(
          <AttachMoneyIcon style = {{ color: theme.success.main, fontSize: 24 }} />,
          'Entries & Fees',
        )}
        <Columns numberOfColumns={2} breakPoint = {innerBreakPoint}>
          <Slab
            label='Entry Fee'
            primary={fantasy_group.free ? 'Free' : `$${fantasy_group.entry_fee}`}
          />
          {
            fantasy_group.cap ?
              <Slab
                label='Max Capacity'
                primary={`${fantasy_group.entries} users`}
              />
              : ''
          }

          <Slab
            label='Entries allowed per user'
            primary={fantasy_group.entries_per_user}
          />
        </Columns>
      </div>
    </Paper>
  );
};

export default EntriesAndFees;



