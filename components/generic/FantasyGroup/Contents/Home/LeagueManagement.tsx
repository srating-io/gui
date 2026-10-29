'use client';


import { useAppSelector } from '@/redux/hooks';

import FantasyGroup from '@/components/helpers/FantasyGroup';
import GeneralDetails from '../../Card/GeneralDetails';
import EntriesAndFees from '../../Card/EntriesAndFees';
import DraftSettings from '../../Card/DraftSettings';
import BracketInfo from '../../Card/BracketInfo';
import PayoutInfo from '../../Card/PayoutInfo';
import Anchor from '../../Anchor';
import { FANTASY_ANCHOR } from '../../anchors';
import { Columns, Typography } from '@esmalley/react-material-ui';

const LeagueManagement = () => {
  const fantasy_group = useAppSelector((state) => state.fantasyGroupReducer.fantasy_group);
  const fantasy_entrys = useAppSelector((state) => state.fantasyGroupReducer.fantasy_entrys);

  const FantasyGroupHelper = new FantasyGroup({ fantasy_group });

  const breakPoint = 700;


  return (
    <div>
      <Typography type = 'h6' style={{ marginBottom: 12 }}>League Management</Typography>
      <Columns numberOfColumns={2} breakPoint = {breakPoint} style = {{ gap: 10 }}>
        <GeneralDetails fantasy_group = {fantasy_group} />
        <Anchor id = {FANTASY_ANCHOR.entries_and_fees}>
          <EntriesAndFees fantasy_group = {fantasy_group} />
        </Anchor>
        {
          FantasyGroupHelper.isDraft() ?
            <Anchor id = {FANTASY_ANCHOR.draft_settings}>
              <DraftSettings fantasy_group = {fantasy_group} />
            </Anchor>
            : ''
        }
        {
          FantasyGroupHelper.isNCAABracket() ?
            <Anchor id = {FANTASY_ANCHOR.bracket}>
              <BracketInfo fantasy_group = {fantasy_group} />
            </Anchor>
            : ''
        }
        {
          fantasy_group.fantasy_payout_rule_id ?
            <Anchor id = {FANTASY_ANCHOR.payouts}>
              <PayoutInfo fantasy_group = {fantasy_group} fantasy_entrys = {fantasy_entrys} />
            </Anchor>
            : ''
          }
      </Columns>
    </div>
  );
};

export default LeagueManagement;
