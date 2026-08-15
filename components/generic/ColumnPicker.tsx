'use client';

import { Chip, TableColumnsType } from '@esmalley/react-material-ui';
import OptionPicker from './OptionPicker';


const ColumnPicker = (
  {
    options,
    selected,
    filled,
    actionHandler,
    firstRunAction,
    isRadio = false,
    autoClose = false,
  }:
  {
    options: TableColumnsType,
    selected: Array<string>,
    filled: boolean,
    actionHandler?: (value: string) => void,
    firstRunAction?: (columnView: string) => void,
    isRadio?: boolean,
    autoClose?: boolean,
  },
) => {
  // console.time('ColumnPicker')


  // useEffect(() => {
  //   console.timeEnd('ColumnPicker')
  // })


  const handleFirstRunAction = () => {
    if (!filled && firstRunAction) {
      firstRunAction('custom');
    }
  };


  const handleClick = (value: string) => {
    handleFirstRunAction();

    if (actionHandler) {
      actionHandler(value);
    }
  };

  const mappedOptions = Object.values(options).map((r) => { return { value: r.id, label: r.getLabel(), sublabel: r.getTooltip(), disabled: r.disabled }; });

  // todo sort these some day


  return (
    <OptionPicker
      renderButton={(handleOpen, open) => {
        return (
          <Chip
            key = {'custom'}
            style = {{ margin: '5px' }}
            title={'+ Custom'}
            filled={filled}
            value = {'custom'}
            onClick={(e) => {
              // First, execute the handleOpen from OptionPicker
              handleOpen(e as React.MouseEvent<HTMLButtonElement>);
            }}
          />
        );
      }}
      options = {mappedOptions}
      selected = {selected.length ? selected : [null]}
      actionHandler = {handleClick}
      isRadio = {isRadio}
      autoClose = {autoClose}
      showMenuCloseButton = {true}
    />
  );
};

export default ColumnPicker;
