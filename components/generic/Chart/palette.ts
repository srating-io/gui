import { Color, ThemeType } from '@esmalley/ts-utils';

/** Where a color sits along a 0..1 ramp, and what the ramp is at that point. */
type Stop = [number, string];

/**
 * The fixed categorical order.
 *
 * The order below is validated - do not reorder it, extend it, or generate an eighth hue. color
 * identifies an entity, so a series keeps its slot when a filter removes its neighbours; assigning
 * by rank would repaint the survivors and mislead anyone who had learned "our team is the blue
 * one".
 *
 * The seven slots were picked by searching the Material scales the theme already serves for a set
 * that clears, on BOTH the dark (#121212) and light (#efefef) surfaces:
 *
 *   - the mode's OKLCH lightness band and the chroma floor,
 *   - adjacent-pair separation under simulated protanopia and deuteranopia (worst pair 15.8,
 *     against a target of 8),
 *   - the normal-vision floor (worst adjacent pair 18.8, against a floor of 15).
 *
 * An eighth slot is not an oversight: every eight-hue candidate failed the normal-vision floor
 * (the best pairing, deepPurple[400] against indigo[300], scores 11.7, which full-color readers
 * cannot reliably separate). Past seven series, fold the tail into an "Other" series, facet into
 * small multiples, or encode by shape as well as hue.
 *
 * Two slots per mode sit below 3:1 against the surface - pink and purple on dark, blue and teal on
 * light. That is a warning rather than a failure, and it carries an obligation: a chart using them
 * keeps its legend or direct labels visible, which is why ChartLegend is not optional past one
 * series.
 *
 * Red is deliberately absent. It is the app's error color, and a red series reads as "this one is
 * bad" rather than as an identity.
 *
 * The scales themselves are mode-independent, so the set a theme yields here is the same one that
 * was validated against both surfaces.
 */
const getCategorical = (theme: ThemeType): string[] => [
  theme.blue[500],
  theme.orange[900],
  theme.pink[800],
  theme.teal[400],
  theme.purple[600],
  theme.green[700],
  theme.indigo[300],
];

/**
 * sRGB to OKLab, and back.
 *
 * Ramps mix in OKLab rather than in sRGB because sRGB is not a perceptual space: the straight
 * line between two colors there dives through whatever happens to sit between their raw channel
 * values, which for any pair far apart in hue is a dead olive-brown. Blue to orange is the worst
 * case and the one the strength ramp needs - halfway between blue[400] and orange[400] in sRGB is
 * #a0a68e, a khaki that belongs to neither end and reads as a hole in the middle of the scale.
 * The same mix in OKLab passes through a warm neutral, which reads as a crossing between them.
 *
 * The ramps that were already short in hue - the rank ramp, and anything with a grey stop in the
 * middle - come out within a shade of where sRGB put them, so moving every ramp onto one
 * interpolator costs those nothing.
 */
const toLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const toGamma = (channel: number): number => (
  255 * (channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055)
);

const toOklab = (hex: string): [number, number, number] => {
  const [red, green, blue] = Color.hexToRgb(hex).map(toLinear);

  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);

  return [
    0.2104542553 * long + 0.7936177850 * medium - 0.0040720468 * short,
    1.9779984951 * long - 2.4285922050 * medium + 0.4505937099 * short,
    0.0259040371 * long + 0.7827717662 * medium - 0.8086757660 * short,
  ];
};

const fromOklab = ([lightness, a, b]: [number, number, number]): string => {
  const long = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (lightness - 0.0894841775 * a - 1.2914855480 * b) ** 3;

  // Color.rgbToHex rounds and clamps, so a mix landing fractionally outside the sRGB gamut - which
  // OKLab can do - pins to the edge of it rather than wrapping round to a wrong color.
  return Color.rgbToHex(
    toGamma(4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short),
    toGamma(-1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short),
    toGamma(-0.0041960863 * long - 0.7034186147 * medium + 1.7076147010 * short),
  );
};

/** Mix two colors perceptually. The amount is clamped, so a t outside 0..1 pins to an end. */
const mix = (from: string, to: string, amount: number): string => {
  const a = toOklab(from);
  const b = toOklab(to);
  const t = Math.max(0, Math.min(1, amount));

  return fromOklab([
    a[0] + ((b[0] - a[0]) * t),
    a[1] + ((b[1] - a[1]) * t),
    a[2] + ((b[2] - a[2]) * t),
  ]);
};

/**
 * Read a ramp at `t`, interpolating between the two stops it falls between.
 *
 * Stops carry their own positions rather than being spread evenly, because where a ramp turns
 * matters as much as which colors it turns between: a crossing given a third of the scale reads
 * as a band in its own right, and the same crossing given a tenth reads as the line between two
 * halves.
 */
const rampAt = (stops: Stop[], t: number): string => {
  const clamped = Math.max(0, Math.min(1, t));

  for (let i = 0; i < stops.length - 1; i++) {
    const [position, color] = stops[i];
    const [nextPosition, nextColor] = stops[i + 1];

    if (clamped <= nextPosition || i === stops.length - 2) {
      return mix(color, nextColor, (clamped - position) / (nextPosition - position));
    }
  }

  return stops[0][1];
};

export type ChartPalette = {
  /** The fixed categorical order. Index by series position, never by rank. */
  categorical: string[];
  /** Pick a categorical slot. */
  series: (index: number) => string;
  /** The sequential ramp for magnitude, read at 0..1. */
  sequential: (t: number) => string;
  /**
   * The sequential ramp as evenly spaced samples, for a CSS or SVG gradient.
   *
   * A legend drawn from the two ends alone is a straight line between them, which for any ramp
   * that turns on the way - every one here but the rank ramp - advertises a scale the chart does
   * not use.
   */
  sequentialSamples: (steps?: number) => string[];
  /** Two hues around a neutral middle, for above and below a baseline. */
  diverging: (t: number) => string;
  /** The "everything else" color behind an emphasised series. */
  muted: string;
  /** Gridlines and axis rules - one shade off the surface, never dashed. */
  grid: string;
  /** The chart surface these colors were validated against. */
  surface: string;
  /** Ink for labels, values and legends. Marks carry identity; text never does. */
  ink: { primary: string; secondary: string };
};

/** Which sequential ramp a chart is asking for. */
export type SequentialType = 'rank' | 'strong';

/**
 * The sequential ramps, as stops.
 *
 * `rank` runs one hue from near-surface to saturated, so more always reads as further from the
 * background rather than as a different color. The dark low end is mixed out of the surface
 * itself, which keeps "near-surface" true if the theme's background ever moves.
 *
 * `strong` is for the quality of an opponent, and it is deliberately the same language the rankings
 * speak: red is a bad team, green is a good one. The alternative was to color the difficulty of
 * the night rather than the team - easy to hard - but that paints the same opponent red here and
 * green on the ranking page, and a reader who moves between the two has to notice which of the two
 * questions is being answered. coloring the team means they never have to.
 *
 * Red to green has one virtue blue to red does not: the hue arc between them is short and runs
 * entirely through warm color - red, orange, amber, lime, green - so no part of the ramp passes
 * near grey. That matters here beyond looks, because grey is already spoken for. A cell with no
 * ranking behind it is painted `grid`, and a ramp that went pale in the middle would make an
 * absence and a measurement look alike.
 *
 * The cost is that red against green is the pairing red-green color blindness takes away, so the
 * ends are given as much lightness between them as the scales allow - about 0.22 of OKLCH L in
 * dark and 0.22 in light - which leaves the two ends orderable by brightness alone even when the
 * hue is gone. The middle is the brightest point either way, which is the ordinary shape of a
 * red-amber-green scale and is why an average opponent reads as the quietest cell on the strip.
 * The direction of the lightness run is chosen per mode so that the strong opponents are always
 * the ones that stand furthest off the surface: bright green on dark, deep green on light.
 */
const getSequentialStops = (theme: ThemeType, type: SequentialType): Stop[] => {
  const dark = theme.mode === 'dark';

  if (type === 'strong') {
    return dark ?
      [
        [0, theme.red[900]],
        [0.27, theme.deepOrange[600]],
        [0.5, theme.amber[500]],
        [0.75, theme.lightGreen[500]],
        [1, theme.green[400]],
      ] :
      [
        [0, theme.red[400]],
        [0.27, theme.orange[600]],
        [0.5, theme.amber[800]],
        [0.75, theme.lightGreen[800]],
        [1, theme.green[900]],
      ];
  }

  return dark ?
    [[0, Color.lerpColor(theme.background.main, theme.green[900], 0.4)], [1, theme.red[300]]] :
    [[0, theme.green[50]], [1, theme.red[900]]];
};

/**
 * Build the palette for the active theme.
 *
 * Dark mode is chosen rather than flipped: it takes its own ramp ends and its own neutral, each
 * measured against the dark surface.
 */
const getChartPalette = (theme: ThemeType, sequentialType: SequentialType = 'rank'): ChartPalette => {
  const dark = theme.mode === 'dark';
  const categorical = getCategorical(theme);
  const sequentialStops = getSequentialStops(theme, sequentialType);

  // diverging needs two hues that read as opposites around a neutral middle. Green against red,
  // never green against teal: two cool hues do not read as opposed. The midpoint has to read as
  // nothing at all, so it is grey rather than a third hue.
  const divergingStops: Stop[] = [
    [0, dark ? theme.green[300] : theme.green[800]],
    [0.5, dark ? theme.grey[700] : theme.grey[300]],
    [1, dark ? theme.red[400] : theme.red[900]],
  ];

  return {
    categorical,
    series: (index: number) => categorical[((index % categorical.length) + categorical.length) % categorical.length],
    sequential: (t: number) => rampAt(sequentialStops, t),
    sequentialSamples: (steps = 12) => Array.from({ length: steps }, (unused, i) => rampAt(sequentialStops, i / (steps - 1))),
    diverging: (t: number) => rampAt(divergingStops, t),
    muted: dark ? theme.grey[700] : theme.grey[400],
    grid: dark ? theme.grey[800] : theme.grey[300],
    surface: theme.background.main,
    ink: {
      primary: theme.text.primary,
      secondary: theme.text.secondary,
    },
  };
};

export { getChartPalette, getCategorical };
