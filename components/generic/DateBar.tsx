'use client';

import React, {
  RefObject, useLayoutEffect, useRef, useState, useTransition,
} from 'react';

import KeyboardArrowLeftIcon from '@esmalley/react-material-icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@esmalley/react-material-icons/KeyboardArrowRight';
import CalendarIcon from '@esmalley/react-material-icons/Event';
import CalendarViewWeekIcon from '@esmalley/react-material-icons/CalendarViewWeek';
import ViewDayIcon from '@esmalley/react-material-icons/ViewDay';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useScrollContext } from '@/contexts/scrollContext';
import { useAppDispatch } from '@/redux/hooks';
import { updateGameSort } from '@/redux/features/favorite-slice';
import { setLoading } from '@/redux/features/loading-slice';
import { setDataKey } from '@/redux/features/games-slice';
import Week, { CFBWeek } from '@/components/helpers/Week';
import { Color, Dates, Style } from '@esmalley/ts-utils';
import { Calendar, IconButton, Plane, Tooltip, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

const getBreakPoint: () => number = () => {
  return 600;
};

const getMarginTop: () => number = () => {
  const { width } = useWindowDimensions();

  if (width <= getBreakPoint()) {
    return 56;
  }

  return 64;
};

const getDateBarHeight: () => number = () => {
  return 40;
};

export { getMarginTop, getBreakPoint, getDateBarHeight };

export type DateBarMode = 'day' | 'week';

const DateBar = (
  { dates, date, mode = 'day', weeks = [], showModeToggle = false }:
  {
    dates: string[];
    date: string | null;
    mode?: DateBarMode;
    /** Built on the server, only read in week mode */
    weeks?: CFBWeek[];
    /**
     * Whether to offer the day / week switch. The surface decides, because Organization.isCFB()
     * reads a store seeded from window.location, so during ssr it claims cfb for every sport.
     */
    showModeToggle?: boolean;
  },
) => {
  const theme = useTheme();

  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  const scrollRefDateBar = useRef<HTMLDivElement>(null);
  const scrollRefDate = useRef<HTMLDivElement>(null);

  const [, startTransition] = useTransition();

  const scrollRef = useScrollContext();

  const dispatch = useAppDispatch();


  // For speed, lookups
  const tabDatesObject = {};

  for (let i = 0; i < dates.length; i++) {
    tabDatesObject[dates[i]] = true;
  }

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calAncor, setCalAncor] = useState(null);

  const updateDate = (value: string) => {
    if (scrollRef && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    if (searchParams?.get('date') !== value) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('date', value);
      const search = current.toString();
      const query = search ? `?${search}` : '';

      dispatch(setDataKey({ key: 'refreshEnabled', value: false }));
      dispatch(setDataKey({ key: 'scrollTop', value: 0 }));
      dispatch(setLoading(true));
      startTransition(() => {
        router.replace(`${pathName}${query}`);
      });
    }
    dispatch(updateGameSort(null));
  };

  /**
   * Switching modes keeps the selected date as the anchor, so the surface can derive the week from
   * it and coming back lands on the same stretch of the season.
   */
  const toggleMode = () => {
    if (scrollRef && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (mode === 'week') {
      current.delete('mode');
    } else {
      current.set('mode', 'week');
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    dispatch(setDataKey({ key: 'refreshEnabled', value: false }));
    dispatch(setDataKey({ key: 'scrollTop', value: 0 }));
    dispatch(setLoading(true));
    dispatch(updateGameSort(null));
    startTransition(() => {
      router.replace(`${pathName}${query}`);
    });
  };

  const height = getDateBarHeight();

  const backgroundColor = theme.mode === 'dark' ? theme.grey[900] : theme.primary.main;
  const selectedColor = theme.mode === 'light' ? theme.purple[300] : theme.secondary.main;
  const selectedTextColor = theme.mode === 'light' ? '#fff' : theme.info.main;
  const borderBottomSize = theme.mode === 'light' ? '3px' : '2px';

  const selectedWeek = mode === 'week' ? Week.findWeekByDate(weeks, date) : null;

  // todo make the inner an a tag with the link
  const buildPill = (
    { key, label, selected, tooltip, onClick, fixedWidth }:
    {
      key: string;
      label: string;
      selected: boolean;
      tooltip: string | null;
      onClick: () => void;
      fixedWidth: boolean;
    },
  ) => {
    // day labels are uniform, week labels are not: 'Champ Wk' does not fit a 60px box
    const widthStyle = fixedWidth ?
      { width: 60, minWidth: 60 } :
      { width: 'auto', minWidth: 72, padding: '0px 8px' };

    const pillStyle = {
      fontSize: '12px',
      color: selected ? selectedTextColor : Color.getTextColor('#ffffff', backgroundColor),
      cursor: 'pointer',
      height: '100%',
      verticalAlign: 'middle',
      display: 'flex',
      alignItems: 'center',
      borderBottom: `${borderBottomSize} ${selected ? selectedColor : backgroundColor} solid`,
      '&:hover': {
        backgroundColor: Color.alphaColor('#fff', 0.25),
      },
      ...widthStyle,
    };

    const pill = (
      <div
        ref = {selected ? (scrollRefDate as RefObject<HTMLDivElement>) : null}
        key = {key}
        className = {Style.getStyleClassName(pillStyle)}
        onClick = {onClick}
      >
        <div style = {{ width: '100%', whiteSpace: 'nowrap' }}>{label}</div>
      </div>
    );

    if (!tooltip) {
      return pill;
    }

    return (
      <Tooltip key = {key} onClickRemove text = {tooltip}>
        {pill}
      </Tooltip>
    );
  };

  const dateContainers: React.JSX.Element[] = [];

  if (mode === 'week') {
    for (let i = 0; i < weeks.length; i++) {
      const week = weeks[i];

      dateContainers.push(buildPill({
        key: week.key,
        label: week.label,
        // match on the bucket, not the date, so the selected pill still scrolls into view
        selected: !!selectedWeek && week.key === selectedWeek.key,
        tooltip: Week.getRangeLabel(week),
        onClick: () => { updateDate(week.dates[0]); },
        fixedWidth: false,
      }));
    }
  } else {
    for (let i = 0; i < dates.length; i++) {
      let label = Dates.format(Dates.parse(dates[i]), 'M j');
      const now = Dates.format(Dates.parse(), 'Y-m-d');

      if (dates[i] === now) {
        label = 'Today';
      } else if (
        dates[i] === Dates.format(Dates.add(Dates.parse(), 1, 'days'), 'Y-m-d') ||
        dates[i] === Dates.format(Dates.add(Dates.parse(), 2, 'days'), 'Y-m-d') ||
        dates[i] === Dates.format(Dates.add(Dates.parse(), 3, 'days'), 'Y-m-d')
      ) {
        label = Dates.format(Dates.parse(`${dates[i]}T12:00:00Z`), 'D');
      }

      dateContainers.push(buildPill({
        key: dates[i],
        label,
        selected: dates[i] === date,
        tooltip: null,
        onClick: () => { updateDate(dates[i]); },
        fixedWidth: true,
      }));
    }
  }

  const scrollToElement = () => {
    scrollRefDate.current?.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  };

  const scrollLeft = () => {
    if (scrollRefDateBar.current) {
      scrollRefDateBar.current.scrollTo({ left: scrollRefDateBar.current.scrollLeft - 100, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRefDateBar.current) {
      scrollRefDateBar.current.scrollTo({ left: scrollRefDateBar.current.scrollLeft + 100, behavior: 'smooth' });
    }
  };

  useLayoutEffect(() => {
    scrollToElement();
  }, [date]);


  const toggleCalendar = (e) => {
    if (calendarOpen) {
      setCalAncor(null);
    } else if (e) {
      setCalAncor(e.currentTarget);
    }
    setCalendarOpen(!calendarOpen);
  };

  const iconStyle = { fontSize: 24, color: Color.getTextColor('#ffffff', backgroundColor) };

  const modeToggle = showModeToggle ? (
    <Tooltip onClickRemove text = {mode === 'week' ? 'Show by day' : 'Show by week'}>
      <IconButton
        value = 'date-bar-mode'
        onClick = {toggleMode}
        icon = {mode === 'week' ? <ViewDayIcon style = {iconStyle} /> : <CalendarViewWeekIcon style = {iconStyle} />}
      />
    </Tooltip>
  ) : null;


  return (
    <div style = {({ display: 'flex', position: 'fixed', width: '100%', zIndex: 1100, height, backgroundColor, color: Color.getTextColor('#ffffff', backgroundColor) })}>
      <div style = {{ display: 'inline-flex' }}>
        {modeToggle}
        <IconButton onClick={scrollLeft} value = 'scroll-left' icon = {<KeyboardArrowLeftIcon style = {iconStyle} />} />
      </div>
      <div ref = {scrollRefDateBar} style = {{ display: 'inline-flex', overflowX: 'scroll', overflowY: 'hidden', scrollbarWidth: 'none', height: '100%', textAlign: 'center', alignItems: 'center' }}>
        {dateContainers}
      </div>
      <div style = {{ display: 'inline-flex', paddingRight: 8 }}>
        <IconButton onClick={scrollRight} value = 'scroll-right' icon = {<KeyboardArrowRightIcon style = {iconStyle} />} />
        <IconButton onClick={toggleCalendar} value = 'calendar' icon = {<CalendarIcon style = {iconStyle} />} />
        <Plane
          open={calendarOpen}
          onClose={toggleCalendar}
          anchor = {calAncor}
        >
          <Calendar
            minDate = {dates[0]}
            maxDate = {dates[dates.length - 1]}
            value = {date}
            shouldDisableDate = {(d: Date) => {
              if (!(Dates.format(Dates.parse(d), 'Y-m-d') in tabDatesObject)) {
                return true;
              }
              return false;
            }}
            onChange = {(d: Date) => {
              const clicked = Dates.format(d, 'Y-m-d');

              // commit the bucket's anchor so the calendar cannot build a url no pill would
              if (mode === 'week') {
                const week = Week.findWeekByDate(weeks, clicked);
                updateDate(week ? week.dates[0] : clicked);
              } else {
                updateDate(clicked);
              }

              toggleCalendar(null);
            }}
          />
        </Plane>
      </div>
    </div>
  );
};

export default DateBar;
