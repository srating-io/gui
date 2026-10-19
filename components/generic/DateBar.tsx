'use client';

import React, {
  RefObject, useLayoutEffect, useRef, useState, useTransition,
} from 'react';

import KeyboardArrowLeftIcon from '@esmalley/react-material-icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@esmalley/react-material-icons/KeyboardArrowRight';
import CalendarIcon from '@esmalley/react-material-icons/Event';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useScrollContext } from '@/contexts/scrollContext';
import { useAppDispatch } from '@/redux/hooks';
import { updateGameSort } from '@/redux/features/favorite-slice';
import { setLoading } from '@/redux/features/loading-slice';
import { setDataKey } from '@/redux/features/games-slice';
import { Color, Dates, Style } from '@esmalley/ts-utils';
import { Calendar, IconButton, Plane, useTheme, useWindowDimensions } from '@esmalley/react-material-ui';

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

const DateBar = (
  { dates, date }:
  { dates: string[]; date: string | null; },
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

  const height = getDateBarHeight();

  const backgroundColor = theme.mode === 'dark' ? theme.grey[900] : theme.primary.main;
  const selectedColor = theme.mode === 'light' ? theme.purple[300] : theme.secondary.main;
  const selectedTextColor = theme.mode === 'light' ? '#fff' : theme.info.main;
  const borderBottomSize = theme.mode === 'light' ? '3px' : '2px';

  const dateContainers: React.JSX.Element[] = [];
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

    const dateStyle = {
      fontSize: '12px',
      color: Color.getTextColor('#ffffff', backgroundColor),
      width: 60,
      minWidth: 60,
      cursor: 'pointer',
      height: '100%',
      verticalAlign: 'middle',
      display: 'flex',
      alignItems: 'center',
      borderBottom: `${borderBottomSize} ${backgroundColor} solid`,
      '&:hover': {
        backgroundColor: Color.alphaColor('#fff', 0.25),
      },
    };

    let dateBarRef: RefObject<HTMLDivElement> | null = null;
    if (dates[i] === date) {
      dateBarRef = scrollRefDate as RefObject<HTMLDivElement>;
      dateStyle.borderBottom = `${borderBottomSize} ${selectedColor} solid`;
      dateStyle.color = selectedTextColor;
    }

    // todo make the inner an a tag with the link
    dateContainers.push(
      <div
        ref = {dateBarRef}
        key = {dates[i]}
        className = {Style.getStyleClassName(dateStyle)}
        onClick={() => { updateDate(dates[i]); }}
      >
        <div style = {{ width: '100%' }}>{label}</div>
      </div>,
    );
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


  return (
    <div style = {({ display: 'flex', position: 'fixed', width: '100%', zIndex: 1100, height, backgroundColor, color: Color.getTextColor('#ffffff', backgroundColor) })}>
      <div style = {{ display: 'inline-flex' }}>
        <IconButton onClick={scrollLeft} value = 'scroll-left' icon = {<KeyboardArrowLeftIcon style = {{ fontSize: 24, color: Color.getTextColor('#ffffff', backgroundColor) }} />} />
      </div>
      <div ref = {scrollRefDateBar} style = {{ display: 'inline-flex', overflowX: 'scroll', overflowY: 'hidden', scrollbarWidth: 'none', height: '100%', textAlign: 'center', alignItems: 'center' }}>
        {dateContainers}
      </div>
      <div style = {{ display: 'inline-flex', paddingRight: 8 }}>
        <IconButton onClick={scrollRight} value = 'scroll-right' icon = {<KeyboardArrowRightIcon style = {{ fontSize: 24, color: Color.getTextColor('#ffffff', backgroundColor) }} />} />
        <IconButton onClick={toggleCalendar} value = 'calendar' icon = {<CalendarIcon style = {{ fontSize: 24, color: Color.getTextColor('#ffffff', backgroundColor) }} />} />
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
              updateDate(Dates.format(d, 'Y-m-d'));
              toggleCalendar(null);
            }}
          />
        </Plane>
      </div>
    </div>
  );
};

export default DateBar;


