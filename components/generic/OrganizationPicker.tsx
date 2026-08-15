'use client';

import { useState, useTransition } from 'react';
// import { useWindowDimensions, Dimensions } from '@/components/hooks/useWindowDimensions';


// import CheckIcon from '@esmalley/react-material-icons/Check';
import CheckCircleIcon from '@esmalley/react-material-icons/CheckCircle';
import RadioButtonUncheckedIcon from '@esmalley/react-material-icons/RadioButtonUnchecked';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateOrganizationID } from '@/redux/features/organization-slice';
import { resetDataKey } from '@/redux/features/display-slice';
import { usePathname, useRouter } from 'next/navigation';
import { reset as resetGames } from '@/redux/features/games-slice';
import { reset as resetRanking } from '@/redux/features/ranking-slice';
import Organization from '@/components/helpers/Organization';
import { reset } from '@/redux/features/compare-slice';
import { setLoading } from '@/redux/features/loading-slice';
import { Button, Menu, MenuOption, Tooltip, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

const OrganizationPicker = () => {
  const dispatch = useAppDispatch();
  const organizations = useAppSelector((state) => state.dictionaryReducer.organization) || {};
  const organization_id = useAppSelector((state) => state.organizationReducer.organization_id);
  const selected = useAppSelector((state) => state.organizationReducer.organization_id);
  const user = useAppSelector((state) => state.userReducer.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathName = usePathname();
  const theme = useTheme();

  const { width } = useWindowDimensions();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOrganization = (option: MenuOption) => {
    handleClose();

    const value = option.value as string;

    if (value === organization_id) {
      return;
    }

    // clear the url params while switching... The reset functions will take info from the url params to pre fill state.
    // So these need cleared before switching
    const current = new URLSearchParams(window.location.search);
    // must get the keys first, then delete based off the keys or it will cause bugs
    const keys = [...current.keys()];
    keys.forEach((key) => current.delete(key));

    // this kind of messes up the back button though, w/e
    window.history.replaceState(null, '', `?${current.toString()}`);
    // window.history.pushState(null, '', `?${current.toString()}`);

    dispatch(setLoading(true));
    dispatch(updateOrganizationID(value));
    dispatch(resetGames());
    dispatch(resetRanking());
    dispatch(reset());
    dispatch(resetDataKey('positions'));
    dispatch(resetDataKey('rank'));
    dispatch(resetDataKey('conferences'));
    startTransition(() => {
      const splat = pathName.split('/');

      const path = Organization.getPath({ organizations, organization_id: value });
      const oldPath = Organization.getPath({ organizations, organization_id: selected });

      let newPathName = `/${path}/ranking`;
      if (splat.length === 3) {
        newPathName = pathName.replace(`/${oldPath}/`, `/${path}/`);
      }
      // this will error out, first you would need the search params, then you do even know if it is valid, season doesnt exist or team is not in org, etc
      // so just default back to the ranking page
      // else if (splat.length > 3) {
      //   newPathName = `/${path}/${splat[2]}`;
      // }

      if (pathName !== newPathName) {
        router.push(newPathName);
      } else {
        dispatch(setLoading(false));
      }
    });
  };

  const menuOptions: MenuOption[] = [];

  for (const id in organizations) {
    const isSelected = selected.indexOf(id) > -1;


    // todo remove me
    if (
      id === 'd36a29dc-5453-11f1-8ce7-46e166b0a263' &&
      (!user || user.user_id !== '6b868ece-4450-11ee-a977-56234bcd142f')
    ) {
      continue;
    }

    menuOptions.push({
      value: id,
      selectable: true,
      label: `${organizations[id].code} (${organizations[id].name})`,
      onSelect: handleOrganization,
      icon: (isSelected ? <CheckCircleIcon style = {{ color: theme.success.main, fontSize: 20 }} /> : <RadioButtonUncheckedIcon style = {{ color: theme.primary.main, fontSize: 20 }} />),
    });
  }

  const emoji = width > 375 ? `${Organization.getEmoji({ organization_id })} ` : '';

  const title = selected in organizations ? `${emoji}${organizations[selected].code}` : 'Loading...';


  return (
    <div>
      <Tooltip onClickRemove text='Change to a different sport'>
        <Button
          type = 'select'
          ink
          onClick={handleOpen}
          buttonStyle={(theme.mode === 'light' ? { color: '#fff' } : {})}
          title = {title}
          value = {title}
        />
      </Tooltip>
      <Menu
        anchor={anchorEl}
        open={open}
        onClose={handleClose}
        options={menuOptions}
      />
    </div>
  );
};

export default OrganizationPicker;
