'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import LockIcon from '@esmalley/react-material-icons/Lock';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLoading } from '@/redux/features/loading-slice';
import Organization from '@/components/helpers/Organization';
import { Button, IconButton, Modal, Typography, useTheme } from '@esmalley/react-material-ui';


const Locked = (
  {
    iconFontSize,
    ...props
  }:
  {
    iconFontSize: string | null;
  },
) => {
  const theme = useTheme();
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization);
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const dispatch = useAppDispatch();

  const [openDialog, setOpenDialog] = useState(false);

  const path = Organization.getPath({ organizations, organization_id });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setOpenDialog(true);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    dispatch(setLoading(true));
    setOpenDialog(false);
    startTransition(() => {
      router.push('/pricing');
    });
  };

  const getLiveWinRateHref = () => {
    return `/${path}/projections?view=stats`;
  };

  const handleLiveWinRate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    dispatch(setLoading(true));
    setOpenDialog(false);
    startTransition(() => {
      router.push(getLiveWinRateHref());
    });
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setOpenDialog(false);
  };


  return (
    <>
      <IconButton {...props} onClick={handleClick} value= 'locked' icon = {<LockIcon style={{ fontSize: iconFontSize || '24px', color: theme.error.main }} />} />
      <Modal
        open = {openDialog}
        onClose = {handleClose}
      >
        <Typography style = {{}} type = 'h6'>{'Subscription required'}</Typography>
        <Typography style = {{ margin: '8px 0px' }} type = 'body1'>{'Subscribe for just $5 per month to get access to win percentages and predicted score for every game!'}</Typography>
        {/* <Typography style = {{ margin: '4px 0px' }} type = 'body1'><a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick = {handleLiveWinRate} href = {getLiveWinRateHref()}>View the live win rate</a></Typography> */}
        <div style = {{ textAlign: 'right', marginTop: 20 }}>
          <Button onClick={handleClose} title = {'Maybe Later'} value = 'close' ink = {true} />
          <Button onClick={handleSubscribe} title = {'Subscribe'} value = 'subscribe' autoFocus />
        </div>
      </Modal>
    </>
  );
};

export default Locked;
