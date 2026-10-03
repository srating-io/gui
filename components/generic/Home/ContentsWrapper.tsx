'use client';


export const getColumns = (width: number): number => {
  // `useWindowDimensions` starts at zero and fills in from its own mount effect, so an unmeasured
  // width has to mean "assume desktop". Reading it as the narrow branch would lay every panel on
  // the page out in one column for a frame and then reflow the lot under the reader.
  if (width === 0) {
    return 3;
  }

  if (width < 700) {
    return 1;
  }

  if (width < 1100) {
    return 2;
  }

  return 3;
};

/** The tour's content width, shared so the sections line up with each other down the page. */
export const getMaxWidth = () => 1180;

/**
 * The id the hero's shortcut to the price list scrolls to.
 *
 * Named here rather than written out at both ends because the hero and the page body are two
 * files apart, and a landing page whose own "see pricing" link silently stops working is worse
 * than one that never had it.
 */
export const PRICING_ID = 'pricing';


const ContentsWrapper = (
  { children }:
  { children: React.JSX.Element },
) => {
  return (
   <div>
    {children}
   </div>
  );
};

export default ContentsWrapper;
