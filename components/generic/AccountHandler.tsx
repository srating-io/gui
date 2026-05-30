'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';


import { useAppDispatch } from '@/redux/hooks';
import { useClientAPI } from '@/components/clientAPI';
import { setLoading } from '@/redux/features/loading-slice';
import { setDataKey as setDataKeyUser } from '@/redux/features/user-slice';
import { setDataKey as setDataKeyGames } from '@/redux/features/games-slice';
import { Button, Inputs, Modal, TextInput, Typography, useTheme } from '@esmalley/react-material-ui';


const AccountHandler = (
  {
    open,
    closeHandler,
    loginCallback,
    message,
    title,
  } :
  {
    open: boolean;
    closeHandler: (e) => void;
    loginCallback?: (e) => void;
    message?: string;
    title?: string;
  },
) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [triggerValidation, setTriggerValidation] = useState(false);

  const [register, setRegister] = useState<boolean>(false);
  const [requestedLogin, setRequestedLogin] = useState<boolean>(false);

  const [email, setEmail] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  const [password, setPassword] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);

  const [passwordConfirm, setPasswordConfirm] = useState<string | undefined>(undefined);
  const [passwordErrorConfirm, setPasswordErrorConfirm] = useState<string | undefined>(undefined);

  const [forgotPassword, setForgotPassword] = useState<boolean>(false);
  const [tempLogin, setTempLogin] = useState<boolean>(false);

  const [loginCode, setLoginCode] = useState<string | undefined>(undefined);
  const [loginCodeError, setLoginCodeError] = useState<string | undefined>(undefined);

  const loginInputHandler = new Inputs();
  const registerInputHandler = new Inputs();
  const forgotInputHandler = new Inputs();
  const tempInputHandler = new Inputs();

  const checkEmail = (text) => {
    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    return regex.test(text);
  };

  const handleLogin = (e) => {
    setTriggerValidation(false);

    if (loginInputHandler.getErrors().length) {
      setTriggerValidation(true);
      return;
    }

    if (!email || !checkEmail(email)) {
      setEmailError('Valid email required');
      // setTriggerValidation(true);
      return;
    }

    if (!password) {
      setPasswordError('Password required');
      // setTriggerValidation(true);
      return;
    }

    dispatch(setLoading(true));

    useClientAPI({
      class: 'user',
      function: 'login',
      arguments: {
        username: email,
        password,
      },
    }).then((session_id) => {
      if (!session_id) {
        dispatch(setLoading(false));
        setPasswordError('Incorrect password');
        // setTriggerValidation(true);
      } else if (session_id && session_id.error) {
        dispatch(setLoading(false));
        setPasswordError('Something went wrong, try again later');
        // setTriggerValidation(true);
      } else {
        dispatch(setDataKeyUser({ key: 'session_id', value: session_id }));
        dispatch(setDataKeyUser({ key: 'isValidSession', value: true }));
        dispatch(setDataKeyGames({ key: 'dates_checked', value: {} }));
        closeHandler(e);

        if (loginCallback) {
          dispatch(setLoading(false));
          loginCallback(e);
        } else {
          // this fires too fast for local store to get updated sometimes... >.>
          // just wait a second then reload I guess lol
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    }).catch((err) => {
      dispatch(setLoading(false));
      setPasswordError('Incorrect password');
      // setTriggerValidation(true);
    });
  };

  const handleRegister = (e) => {
    setTriggerValidation(false);

    if (registerInputHandler.getErrors().length) {
      setTriggerValidation(true);
      return;
    }

    if (!email || !checkEmail(email)) {
      setEmailError('Valid email required');
      return;
    }


    if (!password) {
      setPasswordError('Password required');
      return;
    }


    if (!passwordConfirm) {
      setPasswordErrorConfirm('Password required');
      return;
    }


    if (password !== passwordConfirm) {
      setPasswordErrorConfirm('Password does not match');
      setPasswordError('Password does not match');
      return;
    } if (password.length < 7) {
      setPasswordError('Password must be at least 7 characters');
      setPasswordErrorConfirm('Password must be at least 7 characters');
      return;
    }

    dispatch(setLoading(true));

    useClientAPI({
      class: 'user',
      function: 'register',
      arguments: {
        username: email,
        password,
        confirm_password: passwordConfirm,
      },
    }).then((response) => {
      if (response && response.error) {
        dispatch(setLoading(false));
        setEmailError(response.error);
      } else if (response) {
        dispatch(setDataKeyUser({ key: 'session_id', value: response }));
        dispatch(setDataKeyUser({ key: 'isValidSession', value: true }));
        closeHandler(e);

        if (loginCallback) {
          loginCallback(e);
        } else {
          startTransition(() => {
            router.push('/account');
          });
        }
      }
    }).catch((e) => {
      dispatch(setLoading(false));
      setEmailError('Something went wrong, try again later');
    });
  };

  const sendLoginCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    setTriggerValidation(false);

    if (forgotInputHandler.getErrors().length) {
      setTriggerValidation(true);
      return;
    }

    if (!email || !checkEmail(email)) {
      setEmailError('Valid email required');
      return;
    }

    dispatch(setLoading(true));

    useClientAPI({
      class: 'user',
      function: 'forgotPassword',
      arguments: {
        email,
      },
    }).then((response) => {
      dispatch(setLoading(false));
      if (response === true) {
        setForgotPassword(false);
        setTempLogin(true);
      } else if (response && response.error) {
        setEmailError(response.error);
      } else {
        setEmailError('Something went wrong, try again later');
      }
    }).catch((e) => {
      setEmailError('Something went wrong, try again later');
    });
  };

  const useLoginCode = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    e.nativeEvent.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    setTriggerValidation(false);

    if (tempInputHandler.getErrors().length) {
      setTriggerValidation(true);
      return;
    }

    if (!email || !checkEmail(email)) {
      setEmailError('Valid email required');
      return;
    }

    if (!loginCode) {
      setLoginCodeError('Code required');
      return;
    }

    dispatch(setLoading(true));

    useClientAPI({
      class: 'user',
      function: 'useLoginCode',
      arguments: {
        email,
        code: loginCode,
      },
    }).then((response) => {
      if (response === false) {
        dispatch(setLoading(false));
        setLoginCodeError('Code incorrect / expired');
      } else if (response && response.error) {
        dispatch(setLoading(false));
        setLoginCodeError(response.error);
      } else {
        setForgotPassword(false);
        setTempLogin(false);
        dispatch(setDataKeyUser({ key: 'session_id', value: response }));
        dispatch(setDataKeyUser({ key: 'isValidSession', value: true }));
        // sessionStorage.clear();
        closeHandler(e);
        startTransition(() => {
          router.push('/account?view=settings');
        });
      }
    }).catch((e) => {
      dispatch(setLoading(false));
      setLoginCodeError('Something went wrong, try again later');
    });
  };

  const handleEmail = (value) => {
    setEmailError(undefined);
    setPasswordError(undefined);
    setPasswordErrorConfirm(undefined);
    // setTriggerValidation(true)
    setEmail(value || '');
  };

  const handlePassword = (value) => {
    setEmailError(undefined);
    setPasswordError(undefined);
    setPasswordErrorConfirm(undefined);
    // setTriggerValidation(true)
    setPassword(value || '');
  };

  const handlePasswordConfirm = (value) => {
    setEmailError(undefined);
    setPasswordError(undefined);
    setPasswordErrorConfirm(undefined);
    setPasswordConfirm(value || '');
  };

  const handleEnter = (e) => {
    if (e.keyCode === 13) {
      if (register) {
        handleRegister(e);
      } else if (forgotPassword) {
        handleLogin(e);
      } else if (tempLogin) {
        useLoginCode(e);
      } else {
        handleLogin(e);
      }
    }
  };

  const handleLoginCode = (value) => {
    setEmailError(undefined);
    setLoginCodeError(undefined);
    setLoginCode(value || '');
  };

  let boxContents: React.JSX.Element | null = null;

  let buttons: React.JSX.Element | null = null;

  if (tempLogin) {
    boxContents = (
      <div>
        <Typography type = 'body1' style = {{ color: theme.text.secondary, marginTop: 10 }}>Login with temporary code</Typography>
        <TextInput
          inputHandler={tempInputHandler}
          triggerValidation={triggerValidation}
          required
          disabled
          value = {email}
          error = {!!emailError}
          errorMessage = {emailError}
          onChange = {handleEmail}
          onKeyDown = {handleEnter}
          id="name"
          placeholder="Email Address"
          type="email"
          variant="standard"
        />
        <TextInput
          inputHandler={tempInputHandler}
          triggerValidation={triggerValidation}
          autoFocus
          required
          value = {loginCode}
          error = {!!loginCodeError}
          errorMessage = {loginCodeError}
          onChange = {handleLoginCode}
          onKeyDown = {handleEnter}
          id="login-code"
          placeholder="Code"
          type="number"
          variant="standard"
        />
      </div>
    );

    buttons = (
      <>
        <Button onClick = {(e) => { setTempLogin(false); setForgotPassword(false); }} title = {'Back'} ink value = 'back' />
        <Button onClick = {useLoginCode} title = {'Sign in'} value = 'sign-in' />
      </>
    );
  } else if (forgotPassword) {
    boxContents = (
      <div style = {{ minWidth: 320 }}>
        <Typography type = 'body1' style = {{ color: theme.text.secondary, marginTop: 10 }}>Send a Forgot Password email</Typography>
        <TextInput
          inputHandler={forgotInputHandler}
          triggerValidation={triggerValidation}
          autoFocus
          required
          value = {email}
          error = {!!emailError}
          errorMessage = {emailError}
          onChange = {handleEmail}
          onKeyDown = {handleEnter}
          id="name"
          placeholder="Email Address"
          type="email"
          variant="standard"
        />
      </div>
    );

    buttons = (
      <>
        <Button onClick = {(e) => { setTempLogin(false); setForgotPassword(false); }} title = {'Back'} ink value = 'back' />
        <Button onClick = {sendLoginCode} title = {'Send temporary code'} value = 'temp-code' />
      </>
    );
  } else if (register) {
    boxContents = (
      <div>
        <Typography type = 'body1' style = {{ color: theme.text.secondary, marginTop: 10 }}>Create an account</Typography>
        <TextInput
          inputHandler={registerInputHandler}
          triggerValidation={triggerValidation}
          autoFocus
          required
          value = {email}
          error = {!!emailError}
          errorMessage = {emailError}
          onChange = {handleEmail}
          onKeyDown = {handleEnter}
          id="name"
          placeholder="Email Address"
          type="email"
          variant="standard"
        />
        <TextInput
          inputHandler={registerInputHandler}
          triggerValidation={triggerValidation}
          required
          value = {password}
          error = {!!passwordError}
          errorMessage = {passwordError}
          onChange = {handlePassword}
          placeholder="Password"
          type="password"
          variant="standard"
        />
        <TextInput
          inputHandler={registerInputHandler}
          triggerValidation={triggerValidation}
          required
          value = {passwordConfirm}
          error = {!!passwordErrorConfirm}
          errorMessage = {passwordErrorConfirm}
          onChange = {handlePasswordConfirm}
          onKeyDown = {handleEnter}
          placeholder="Confirm password"
          type="password"
          variant="standard"
        />
        <Typography type = 'body2' style = {{ color: theme.text.secondary, marginTop: 10 }}>Have an account? <a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick = {(e) => { setRegister(false); }}>Sign in</a></Typography>
      </div>
    );

    buttons = (
      <Button onClick = {handleRegister} title = {'Create account'} value = 'create' />
    );
  } else {
    boxContents = (
      <div>
        <Typography type = 'body1' style = {{ color: theme.text.secondary, paddingBottom: 12 }}>{(message || 'Sign in to your account')}</Typography>
        <TextInput
          inputHandler={loginInputHandler}
          triggerValidation={triggerValidation}
          autoFocus
          required
          value = {email}
          error = {!!emailError}
          errorMessage = {emailError}
          onChange = {handleEmail}
          id="name"
          placeholder="Email Address"
          type="email"
          variant="standard"
          />
        <TextInput
          inputHandler={loginInputHandler}
          triggerValidation={triggerValidation}
          required
          value = {password}
          error = {!!passwordError}
          errorMessage = {passwordError}
          onChange = {handlePassword}
          onKeyDown = {handleEnter}
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          variant="standard"
        />
        <div style = {{ marginTop: 10 }}>
          <Typography type = 'a' onClick = {(e) => { setForgotPassword(true); }}>Forgot Password?</Typography>
        </div>
        <div style = {{ marginTop: 10 }}>
          <Typography type = 'body1' style = {{ color: theme.text.secondary }}>No account? <a style = {{ cursor: 'pointer', color: theme.link.primary }} onClick = {(e) => { setRegister(true); }}>Create account</a></Typography>
        </div>
      </div>
    );

    buttons = (
      <Button onClick = {handleLogin} title = {'Sign in'} value = 'sign-in' />
    );
  }

  return (
    <Modal
      open={open}
      onClose={closeHandler}
    >
      <Typography type = 'h6'>{title || 'Account'}</Typography>
      {boxContents}
      <div style = {{ textAlign: 'right', marginTop: 10 }}>
        {buttons}
      </div>
    </Modal>
  );
};

export default AccountHandler;

