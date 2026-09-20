'use client';

import RuleIcon from '@esmalley/react-material-icons/Rule';
import { getTitle, innerBreakPoint, paperStyle } from '../Card';
import { Columns, Paper, Slab, useTheme } from '@esmalley/react-material-ui';
import { Fantasy } from '@srating-io/types';


const BracketInfo = (
  {
    fantasy_group,
  } :
  {
    fantasy_group: Fantasy.FantasyGroup
  },
) => {
  const theme = useTheme();

  const renderStatus = (val: number) => (val === 1 ? 'Yes' : 'No');

  return (
    <Paper style={paperStyle}>
      <div>
        {getTitle(
          <RuleIcon style = {{ color: theme.purple[500], fontSize: 24 }} />,
          'Bracket info',
        )}
        <Columns numberOfColumns={3} breakPoint = {innerBreakPoint}>
          <Slab
            label='Picks locked'
            primary={renderStatus(fantasy_group.locked)}
          />
        </Columns>
      </div>
    </Paper>
  );
};

export default BracketInfo;
