'use client';

import { Profiler, useState } from 'react';
import { footerNavigationHeight } from '@/components/generic/FooterNavigation';
import { headerBarHeight } from '@/components/generic/Header';
import { useClientAPI } from '@/components/clientAPI';
import { useAppDispatch } from '@/redux/hooks';
import { setLoading } from '@/redux/features/loading-slice';
import { setDataKey } from '@/redux/features/user-slice';
import GeneralDetails from '../FantasyGroup/Card/GeneralDetails';
import EntriesAndFees from '../FantasyGroup/Card/EntriesAndFees';
import DraftSettings from '../FantasyGroup/Card/DraftSettings';
import BracketInfo from '../FantasyGroup/Card/BracketInfo';
import PayoutInfo from '../FantasyGroup/Card/PayoutInfo';
import FantasyGroup from '@/components/helpers/FantasyGroup';
import { useNavigation } from '@/components/hooks/useNavigation';
import { Button, Columns, ErrorModal, LinearProgress, Typography, useTheme } from '@esmalley/react-material-ui';
import { Fantasy } from '@srating-io/types';



/**
 * The main wrapper div for all the contents
 */
const Contents = ({ children }): React.JSX.Element => {
  return (
    <div style = {{ padding: 5 }}>
      {children}
    </div>
  );
};


const ClientSkeleton = () => {
  const theme = useTheme();
  const paddingTop = 0;

  const heightToRemove = paddingTop + footerNavigationHeight + headerBarHeight + 84;
  return (
    <Contents>
      <div style = {{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: `calc(100vh - ${heightToRemove}px)`,
      }}>
        <LinearProgress color = {theme.secondary.main} containerStyle={{ width: '50%' }} />
      </div>
    </Contents>
  );
};

const Client = (
  {
    fantasy_group,
    fantasy_entrys,
    fantasy_group_invite_id,
    code,
  }:
  {
    fantasy_group: Fantasy.FantasyGroup;
    fantasy_entrys?: Fantasy.FantasyEntrys;
    fantasy_group_invite_id: string;
    code: string;
  },
) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const dispatch = useAppDispatch();


  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(false);

  const join = () => {
    if (isJoining) {
      return;
    }

    setIsJoining(true);
    dispatch(setLoading(true));

    useClientAPI({
      class: 'fantasy_group_invite',
      function: 'join',
      arguments: {
        fantasy_group_invite_id,
        code,
      },
    }).then((data) => {
      if (
        data &&
        data.session_id &&
        data.fantasy_group_id
      ) {
        dispatch(setDataKey({ key: 'session_id', value: data.session_id }));
        dispatch(setDataKey({ key: 'isValidSession', value: true }));

        navigation.fantasy_group(`/fantasy_group/${data.fantasy_group_id}`);
      } else {
        setIsJoining(false);
        dispatch(setLoading(false));
        setError(true);
      }
    }).catch((err) => {
      setIsJoining(false);
      dispatch(setLoading(false));
      setError(true);
    });
  };

  const FantasyGroupHelper = new FantasyGroup({ fantasy_group });
  const breakPoint = 700;

  return (
    <Profiler id="FantasyGroupInvite.Client" onRender={(id, phase, actualDuration) => {
      console.log(id, phase, actualDuration);
    }}>
    <Contents>
      <div style = {{
        margin: 'auto',
        maxWidth: 1200,
      }}>
        <div style = {{ textAlign: 'center' }}>
          <div>
            <Typography type = 'h5'>You have been invited to join "{fantasy_group.name}"!</Typography>
          </div>
          <Button value = 'join' title = 'Join league!' onClick={join} buttonStyle = {{ backgroundColor: (theme.mode === 'dark' ? theme.info.dark : theme.info.main) }} />
        </div>
        <div>
          <Typography type = 'h6' style={{ marginBottom: 12 }}>League Details</Typography>
          <Columns numberOfColumns={2} breakPoint = {breakPoint} style = {{ gap: 10 }}>
            <GeneralDetails fantasy_group = {fantasy_group} />
            <EntriesAndFees fantasy_group = {fantasy_group} />
            {
              FantasyGroupHelper.isDraft() ?
                <DraftSettings fantasy_group = {fantasy_group} />
                : ''
            }
            {
              FantasyGroupHelper.isNCAABracket() ?
                <BracketInfo fantasy_group = {fantasy_group} />
                : ''
            }
            {
              fantasy_group.fantasy_payout_rule_id ?
                <PayoutInfo fantasy_group = {fantasy_group} fantasy_entrys = {fantasy_entrys || {}} />
                : ''
              }
          </Columns>
        </div>
      </div>
      <ErrorModal
        open = {error}
        title = {'Error joining league'}
        message = {'Oops! Something went wrong, please try again later..'}
        confirm={() => {
          setError(false);
        }}
      />
    </Contents>
    </Profiler>
  );
};

export { Client, ClientSkeleton };
