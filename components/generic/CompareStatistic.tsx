'use client';

import { Paper, Skeleton, TableColumn, Tooltip, Typography, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';
import Locked from './Billing/Locked';
import RankSpan from './RankSpan';

export type CompareStatisticRow = {
  leftRow: object;
  rightRow: object;
} & TableColumn;


const CompareStatistic = (
  {
    rows,
    max,
    paper,
    maxWidth = 600,
  }:
  {
    rows: CompareStatisticRow[];
    max: number;
    paper: boolean;
    maxWidth?: number;
  },
) => {
  const { width } = useWindowDimensions();
  const theme = useTheme();

  const fixedLength = width > 500 ? 2 : 1;


  const getColor = (row: CompareStatisticRow, base: string) => {
    const leftValue = getRowValue(row, 'left');
    const rightValue = getRowValue(row, 'right');

    if (row.sort === 'lower') {
      if (+leftValue < +rightValue) {
        return base === 'left' ? theme.success.light : theme.error.light;
      }
      if (+leftValue > +rightValue) {
        return base === 'right' ? theme.success.light : theme.error.light;
      }
    }

    if (row.sort === 'higher') {
      if (+leftValue > +rightValue) {
        return base === 'left' ? theme.success.light : theme.error.light;
      }
      if (+leftValue < +rightValue) {
        return base === 'right' ? theme.success.light : theme.error.light;
      }
    }

    return theme.secondary.light;
  };

  const getPercentage = (row: CompareStatisticRow, side: string) => {
    const leftValue = getRowValue(row, 'left');
    const rightValue = getRowValue(row, 'right');

    const leftRank = getRank(row, 'left');
    const rightRank = getRank(row, 'right');

    if (row.sort === 'lower') {
      const total = +leftValue + +rightValue;

      if (+leftValue < +rightValue) {
        const percentage = side === 'left' ? 100 * (+rightValue / total) : 100 * (+leftValue / total);
        return `${percentage}%`;
      }
      if (+leftValue > +rightValue) {
        const percentage = side === 'right' ? 100 * (+leftValue / total) : 100 * (+rightValue / total);
        return `${percentage}%`;
      }
    }


    if (row.sort === 'higher') {
      let total = +leftValue + +rightValue;

      // compareType rank is just for aEM because it is annoying as fuck and the numbers go all over
      /*
      if (
        row.compareType === 'absolute' &&
        (
          (
            +rightValue < 0 &&
            +leftValue > 0
          ) ||
          (side === 'right' && +leftValue > total) ||
          (side === 'left' && +leftValue > total)
        )
      ) {
        let percentage = ((+leftValue - +rightValue) / Math.abs(+rightValue)) * 100;
        return (side === 'left' ? (percentage >= 100 ? 95 : percentage) : 100 - (percentage >= 100 ? 95 : percentage)) + '%';
      } */
      if (row.compareType === 'rank' && leftRank && rightRank) {
        total = leftRank + rightRank;
        const percentage = side === 'right' ? 100 * (+leftRank / total) : 100 * (+rightRank / total);
        return `${percentage}%`;
      } if (+leftValue > +rightValue) {
        const percentage = side === 'left' ? 100 * (+leftValue / total) : 100 * (+rightValue / total);
        return `${percentage}%`;
      }

      /*
      if (
        row.compareType === 'absolute' &&
        (
          (
            +leftValue < 0 &&
            +rightValue > 0
          ) ||
          (side === 'right' && +rightValue > total) ||
          (side === 'left' && +rightValue > total)
        )
      ) {
        let percentage = ((+rightValue - +leftValue) / Math.abs(+leftValue)) * 100;
        return (side === 'right' ? (percentage >= 100 ? 95 : percentage) : 100 - (percentage >= 100 ? 95 : percentage)) + '%';
      } */
      if (row.compareType === 'rank' && leftRank && rightRank) {
        total = leftRank + rightRank;
        const percentage = side === 'left' ? 100 * (+rightRank / total) : 100 * (+leftRank / total);
        return `${percentage}%`;
      } if (+leftValue < +rightValue) {
        const percentage = side === 'right' ? 100 * (+rightValue / total) : 100 * (+leftValue / total);
        return `${percentage}%`;
      }
    }

    return '50%';
  };

  const getDifference = (row: CompareStatisticRow, side: string) => {
    const leftValue = getRowValue(row, 'left');
    const rightValue = getRowValue(row, 'right');

    if (row.sort === 'lower') {
      if (+leftValue > +rightValue) {
        if (+leftValue === Infinity) {
          return 0;
        }
        return side === 'left' ? 0 : `-${(+leftValue - +rightValue).toFixed(('precision' in row ? row.precision : fixedLength))}`;
      }
      if (+leftValue < +rightValue) {
        if (+rightValue === Infinity) {
          return 0;
        }
        return side === 'right' ? 0 : `-${(+rightValue - +leftValue).toFixed(('precision' in row ? row.precision : fixedLength))}`;
      }
    }

    if (row.sort === 'higher') {
      if (+leftValue > +rightValue) {
        return side === 'left' ? `+${(+leftValue - +rightValue).toFixed(('precision' in row ? row.precision : fixedLength))}` : 0;
      }
      if (+leftValue < +rightValue) {
        return side === 'right' ? `+${(+rightValue - +leftValue).toFixed(('precision' in row ? row.precision : fixedLength))}` : 0;
      }
    }

    return 0;
  };

  const getRowDisplayValue = (row: CompareStatisticRow, side: string) => {
    const thisRow = side === 'left' ? row.leftRow : row.rightRow;
    if (row.getDisplayValue) {
      return row.getDisplayValue(thisRow, side);
    }

    return getRowValue(row, side);
  };

  const getRowValue = (row: CompareStatisticRow, side: string) => {
    const thisRow = side === 'left' ? row.leftRow : row.rightRow;
    if (row.getValue) {
      return row.getValue(thisRow, side);
    }

    if (row.id in thisRow) {
      return thisRow[row.id];
    }

    // console.warn('thisRow missing value');
    return '-';
  };

  const getRank = (row: CompareStatisticRow, side: string) => {
    const thisRow = side === 'left' ? row.leftRow : row.rightRow;
    const key = `${row.id}_rank`;
    if (!(key in thisRow)) {
      return null;
    }

    return thisRow[key];
  };


  const Container = (props_) => {
    if (paper) {
      return <Paper elevation = {3} style = {{ padding: 10, maxWidth, width: '100%', margin: 'auto' }}>{props_.children}</Paper>;
    }

    return <div style = {{ maxWidth, width: '100%', margin: 'auto' }}>{props_.children}</div>;
  };

  const titleStyle: React.CSSProperties = {
    whiteSpace: 'nowrap',
    color: theme.info.light,
  };

  if (width < 500) {
    titleStyle.maxWidth = 100;
    titleStyle.overflow = 'hidden';
    titleStyle.textOverflow = 'ellipsis';
  }
  if (width < 425) {
    titleStyle.maxWidth = 60;
    titleStyle.overflow = 'hidden';
    titleStyle.textOverflow = 'ellipsis';
  }



  const getDecoratedRows = (rows: CompareStatisticRow[]) => {
    const decorated: React.JSX.Element[] = [];

    rows.forEach((row, index) => {
      const radius = '4px';


      const getLabel = () => {
        const l = row.getLabel();
        const t = row.getTooltip();
        return <Tooltip key={t} delay = {500} position = 'top' text={t}><Typography style = {titleStyle} type = 'body2'>{l}</Typography></Tooltip>;
      };

      const getRankSpan = (row: CompareStatisticRow, side: string) => {
        const rank = getRank(row, side);
        if (!rank) {
          return '';
        }

        return (
          <RankSpan rank = {rank} key = {index} max = {max} useOrdinal = {true} />
        );
      };


      if (row.loading) {
        decorated.push(<Skeleton key = {index} style = {{ margin: '10px 0px' }} />);
      } else {
        const leftDifference = getDifference(row, 'left');
        const rightDifference = getDifference(row, 'right');
        const leftPercentage = getPercentage(row, 'left');
        const rightPercentage = getPercentage(row, 'right');

        decorated.push(
          <div key = {index} style = {{ margin: '10px 0px' }}>
            <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style = {{ margin: '0px 20px 0px 5px', minWidth: '100px', textAlign: 'left', overflow: 'hidden' }}>
                {
                row.locked ? <Locked iconFontSize={'18px'} />
                  : <Typography type = 'body2'>{getRowDisplayValue(row, 'left')}{getRankSpan(row, 'left')}<Typography style = {{ margin: `0px ${getRank(row, 'left') ? '5px' : '8px'}`, display: 'inline-block', color: theme.text.secondary }} type = 'caption'>{leftDifference && row.showDifference && width >= 375 ? leftDifference : ''}</Typography></Typography>
                }
              </div>
              <div style = {{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                {getLabel()}
              </div>
              <div style = {{ margin: '0px 5px 0px 20px', minWidth: '100px', textAlign: 'right', overflow: 'hidden' }}>
                {
                row.locked ? <Locked iconFontSize={'18px'} />
                  : <Typography type = 'body2'><Typography style = {{ margin: `0px ${getRank(row, 'right') ? '5px' : '8px'}`, display: 'inline-block', color: theme.text.secondary }} type = 'caption'>{rightDifference && row.showDifference && width >= 375 ? rightDifference : ''}</Typography>{getRankSpan(row, 'right')}{getRowDisplayValue(row, 'right')}</Typography>
                }
              </div>
            </div>
            <div style = {{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
              <div style = {{ flexGrow: '1', margin: '0px 5px', display: 'flex', height: '8px' }}>
                <div style = {{ display: ('sort' in row ? 'block' : 'none'), width: leftPercentage, backgroundColor: getColor(row, 'left'), color: '#fff', textAlign: 'center', borderTopLeftRadius: radius, borderBottomLeftRadius: radius/* theme.palette.getContrastText(getColor(row, 'left')) */ }}>

                </div>
                <div style = {{ display: ('sort' in row ? 'block' : 'none'), width: rightPercentage, backgroundColor: getColor(row, 'right'), color: '#fff', textAlign: 'center', borderTopRightRadius: radius, borderBottomRightRadius: radius/* theme.palette.getContrastText(getColor(row, 'right')) */ }}>

                </div>
              </div>
            </div>
          </div>,
        );
      }
    });


    return decorated;
  };

  return (
    <Container>
      {getDecoratedRows(rows)}
    </Container>
  );
};

export default CompareStatistic;
