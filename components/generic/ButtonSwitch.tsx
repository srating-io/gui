'use client';

import { Typography, useTheme } from '@esmalley/react-material-ui';
import { Color } from '@esmalley/ts-utils';

/**
 * A two way toggle.
 *
 * `selected` matches on the title unless `leftValue` / `rightValue` are given, which the survivor
 * picker needs because two teams can share a code. An empty `selected` leaves both sides unselected.
 */
const ButtonSwitch = (
  {
    leftTitle, rightTitle, selected, handleClick, fontSize = '0.85rem', style = {},
    leftValue, rightValue, leftDisabled = false, rightDisabled = false,
  }:
  {
    leftTitle: string, rightTitle: string, selected: string | null, handleClick: (value: string) => void,
    fontSize?: string, style?: React.CSSProperties,
    leftValue?: string, rightValue?: string, leftDisabled?: boolean, rightDisabled?: boolean,
  },
) => {
  const theme = useTheme();

  const unSelectedColor = theme.mode === 'light' ? theme.grey['300'] : theme.grey['900'];
  const selectedColor = theme.info.dark;

  const leftMatch = leftValue ?? leftTitle;
  const rightMatch = rightValue ?? rightTitle;

  const leftBackgroundColor = (selected === leftMatch ? selectedColor : unSelectedColor);
  const rightBackgroundColor = (selected === rightMatch ? selectedColor : unSelectedColor);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    border: `2px solid ${selectedColor}`,
    borderRadius: '3px',
    display: 'flex',
    justifyContent: 'space-between',
  };

  const buttonStyle: React.CSSProperties = {
    width: '50%',
    textAlign: 'center',
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    padding: 5,
    opacity: 0.9,
  };

  const disabledStyle: React.CSSProperties = { cursor: 'default', opacity: 0.5 };

  const buildSide = (
    { title, match, backgroundColor, disabled }:
    { title: string, match: string, backgroundColor: string, disabled: boolean },
  ) => {
    const color = disabled ? theme.grey['500'] : Color.getTextColor(theme.text.primary, backgroundColor);

    return (
      <div
        style = {({ backgroundColor, ...buttonStyle, ...(disabled ? disabledStyle : {}) })}
        onClick={disabled ? undefined : () => { handleClick(match); }}
      >
        <Typography style = {{ color, fontSize }} type = 'body1'>{title}</Typography>
      </div>
    );
  };

  return (
    <div style = {({ width: '100%', maxWidth: 300, margin: 'auto', ...style })}>
      <div style = {containerStyle}>
        {buildSide({ title: leftTitle, match: leftMatch, backgroundColor: leftBackgroundColor, disabled: leftDisabled })}
        {buildSide({ title: rightTitle, match: rightMatch, backgroundColor: rightBackgroundColor, disabled: rightDisabled })}
      </div>
    </div>
  );
};

export default ButtonSwitch;
