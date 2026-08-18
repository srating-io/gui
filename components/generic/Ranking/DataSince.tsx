'use client';


import { Typography, useTheme } from '@esmalley/react-material-ui';
import { useAppSelector } from '@/redux/hooks';
import Organization from '@/components/helpers/Organization';


const DataSince = ({ organization_id, view }) => {
  const theme = useTheme();
  const career = useAppSelector((state) => state.rankingReducer.career);
  const career_active = useAppSelector((state) => state.rankingReducer.career_active);



  let since = '';

  if (Organization.getCFBID() === organization_id && view === 'coach') {
    since = 'Aug 2000';
  } else if (
    Organization.getNBAID() === organization_id &&
    view === 'player' &&
    (career || career_active)
  ) {
    since = '1977';
  } else if (
    Organization.getCFBID() === organization_id &&
    view === 'player' &&
    (career || career_active)
  ) {
    since = 'Aug 2024';
  } else if (
    Organization.getCBBID() === organization_id &&
    view === 'player' &&
    (career || career_active)
  ) {
    since = 'Nov 2011';
  }


  return (
    <>
      {
        since ?
        <div style = {{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
          <Typography type = 'body1' style = {{ fontStyle: 'italic', color: theme.text.secondary }}>{`Data since: ${since}`}</Typography>
        </div> :
          ''
      }
    </>
  );
};

export default DataSince;
