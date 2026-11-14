'use client';

import ArrowBackIcon from '@esmalley/react-material-icons/ArrowBack';
import { useAppDispatch } from '@/redux/hooks';
import { setLoading } from '@/redux/features/loading-slice';
import { IconButton, Tooltip } from '@esmalley/react-material-ui';
import { useEffect, useState } from 'react';


const BackButton = () => {
  const dispatch = useAppDispatch();
  // the server has no idea how deep the visitor's history is, so it starts hidden and the
  // effect below fills it in. Guessing here renders a button the client then removes.
  const [showBack, setShowBack] = useState(false);

  // todo something like this https://gemini.google.com/app/1c517e736725906a
  // add an app wide window.history.state.foo, then can actually track whether or not i need to go back, maybe just put in redux?

  const handleClick = () => {
    dispatch(setLoading(true));
    window.history.back();
  };

  useEffect(() => {
    setShowBack(window.history.length > 1);
  }, []);

  return (
    <>
      <div>
        {
          showBack &&
          <Tooltip onClickRemove text = {'Back'}>
            <IconButton onClick = {handleClick} value = 'back' icon = {<ArrowBackIcon style = {{ fontSize: 24 }} />} />
          </Tooltip>
        }
      </div>
    </>
  );
};

export default BackButton;
