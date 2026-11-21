import React, { createContext, useContext, ReactNode, RefObject, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useWindowDimensions } from '@esmalley/react-material-ui';

type ScrollContextType = RefObject<HTMLDivElement | null>;

// Create the context
const ScrollContext = createContext<ScrollContextType | null>(null);

// Create a provider component
interface ScrollProviderProps {
  children: ReactNode;
}

interface ScrollContainerProps {
  children: ReactNode;
}

const ScrollProvider: React.FC<ScrollProviderProps> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <ScrollContext.Provider value={scrollRef}>
      {children}
    </ScrollContext.Provider>
  );
};

// Create a custom hook for using the context
const useScrollContext = (): RefObject<HTMLDivElement | null> => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
};

const ScrollContainer: React.FC<ScrollContainerProps> = ({ children }) => {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const previousPathname = useRef(pathname);


  const scrollRefContext = useScrollContext();

  let scrollerClasses = 'overlay_scroller';

  if (width < 750) {
    scrollerClasses += ' hide_scroll';
  }

  // resets scroll position between pages
  // todo if a page has custom scrolling, this will reset it
  // TODO THIS SHOULD SHOULD NOT BE NEEDED ANYMORE GO UPDATE THE GAMES ROUTER CHANGE TO NOT SCROLL
  // https://nextjs.org/docs/app/api-reference/functions/use-router#disabling-scroll-restoration
  // useEffect(() => {
  //   router.events.on('routeChangeComplete', () => {
  //     if (scrollRef.current) {
  //       scrollRef.current.scrollTop = 0
  //     }
  //   })
  // }, [router.events])

  // compare against the previous pathname, not the first one: against the first, every later
  // search param change on a client-navigated page (a url write, a tab) threw the reader to the top
  useEffect(() => {
    if (
      previousPathname.current !== pathname &&
      scrollRefContext &&
      scrollRefContext.current
    ) {
      scrollRefContext.current.scrollTop = 0;
    }
    previousPathname.current = pathname;
  }, [pathname]);

  return (
    <div ref = {scrollRefContext} className = {scrollerClasses}>
      {children}
    </div>
  );
};

export { ScrollProvider, useScrollContext, ScrollContainer };
