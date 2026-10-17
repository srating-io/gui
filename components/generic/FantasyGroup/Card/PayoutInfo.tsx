'use client';

import MoneyIcon from '@esmalley/react-material-icons/Money';
import { getTitle, innerBreakPoint, paperStyle } from '../Card';
import Payment from '@/components/helpers/Payment';
import { useAppSelector } from '@/redux/hooks';
import { Numbers } from '@esmalley/ts-utils';
import { Columns, Paper, Slab, useTheme } from '@esmalley/react-material-ui';
import { Fantasy } from '@srating-io/types';


const PayoutInfo = (
  {
    fantasy_group,
    fantasy_entrys,
  } :
  {
    fantasy_group: Fantasy.FantasyGroup,
    fantasy_entrys: Fantasy.FantasyEntrys,
  },
) => {
  const theme = useTheme();
  const fantasy_payout_rules = useAppSelector((state) => state.dictionaryReducer.fantasy_payout_rule);

  const paid_entries = Object.values(fantasy_entrys).filter((row) => +row.paid === 1).length;
  const current_pool = Payment.get_pool_after_fees(fantasy_group.entry_fee, paid_entries);

  const fantasy_payout_rule = (
    fantasy_group.fantasy_payout_rule_id && fantasy_group.fantasy_payout_rule_id in fantasy_payout_rules ?
      fantasy_payout_rules[fantasy_group.fantasy_payout_rule_id]
      : null
  );

  const payout_split = Payment.get_payout_split(fantasy_payout_rule?.json_payout_structure);

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
            primary={`${current_pool.toFixed(2)}`}
            info={`This is calculated by taking the entry fee - processing fees, per paid entry. Credit card processor: ${(Payment.stripe_percentage * 100).toFixed(2)}% - $0.${Payment.stripe_transaction_cents}. srating.io fee: ${(Payment.srating_percentage * 100).toFixed(2)}%`}
          />
          <Slab
            label='Payout rule'
            primary={fantasy_payout_rule ? fantasy_payout_rule.name : 'Unknown'}
            info={fantasy_payout_rule ? fantasy_payout_rule.description : 'Unknown'}
          />
        </Columns>
        {
          // the split was stored and never shown, so entrants saw a rule name and no numbers
          payout_split.length ?
            <Columns numberOfColumns={payout_split.length > 3 ? 3 : payout_split.length} breakPoint = {innerBreakPoint}>
              {payout_split.map((row) => (
                <Slab
                  key = {row.rank}
                  label={`${Numbers.formatOrdinal(row.rank)} place`}
                  primary={`${(current_pool * row.share).toFixed(2)}`}
                  info={`${(row.share * 100).toFixed(1)}% of the pool. Winners are paid by hand after the league finishes.`}
                />
              ))}
            </Columns>
            : null
        }
      </div>
    </Paper>
  );
};

export default PayoutInfo;
