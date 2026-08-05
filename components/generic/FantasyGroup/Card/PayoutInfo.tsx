'use client';

import MoneyIcon from '@esmalley/react-material-icons/Money';
import { getTitle, innerBreakPoint, paperStyle } from '../Card';
import Payment from '@/components/helpers/Payment';
import { useAppSelector } from '@/redux/hooks';
import { Columns, Paper, Slab, useTheme } from '@esmalley/react-material-ui';
import { General } from '@srating-io/types';


const PayoutInfo = (
  {
    fantasy_group,
    fantasy_entrys,
  } :
  {
    fantasy_group: General.FantasyGroup,
    fantasy_entrys: General.FantasyEntrys,
  },
) => {
  const theme = useTheme();
  const fantasy_payout_rules = useAppSelector((state) => state.dictionaryReducer.fantasy_payout_rule);

  let current_pool = 0;

  for (const fantasy_entry_id in fantasy_entrys) {
    const row = fantasy_entrys[fantasy_entry_id];

    if (row.paid && fantasy_group.entry_fee) {
      current_pool += Payment.get_amount_after_fees(fantasy_group.entry_fee);
    }
  }

  return (
    <Paper style={paperStyle}>
      <div>
        {getTitle(
          <MoneyIcon style = {{ color: theme.green[500], fontSize: 24 }} />,
          'Payout Info',
        )}
        <Columns numberOfColumns={2} breakPoint = {innerBreakPoint}>
          <Slab
            label='Current pool'
            primary={`$${current_pool}`}
            info={`This is calculated by taking the entry fee - processing fees. Credit card processor: ${(Payment.stripe_percentage * 100).toFixed(2)}% - $0.${Payment.stripe_transaction_cents}. srating.io fee: ${(Payment.srating_percentage * 100).toFixed(2)}%`}
          />
          <Slab
            label='Payout rule'
            primary={fantasy_group.fantasy_payout_rule_id ? fantasy_payout_rules[fantasy_group.fantasy_payout_rule_id].name : 'Unknown'}
            info={fantasy_group.fantasy_payout_rule_id ? fantasy_payout_rules[fantasy_group.fantasy_payout_rule_id].description : 'Unknown'}
          />
        </Columns>
      </div>
    </Paper>
  );
};

export default PayoutInfo;
