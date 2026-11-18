import { RELIEVE_UNITS_PER_EM, relieveWords } from "./relieveGlyphs";

// Vertical room for each letter, in font units: from above the tallest capital down past the descenders.
const TOP = -560;
const HEIGHT = 760;

type GlyphWordProps = {
  word: keyof typeof relieveWords;
  className?: string;
};

/**
 * Draws a word in the Relieve script font as SVG outlines instead of text.
 * The size follows the CSS font-size (1em = one em of the font), so it can be styled like text.
 * Each letter is its own element, so the intro can measure and morph them one by one.
 */
export default function GlyphWord({ word, className }: GlyphWordProps) {
  const data = relieveWords[word];
  const em = (units: number) => `${units / RELIEVE_UNITS_PER_EM}em`;

  return (
    <span
      aria-hidden="true"
      className={`relative inline-block align-baseline ${className ?? ""}`}
      style={{ width: em(data.width), height: em(HEIGHT) }}
    >
      {data.letters.map((letter, index) => (
        <span
          key={index}
          data-glyph-index={index}
          className="absolute top-0 block"
          style={{ left: em(letter.x), width: em(letter.advance), height: em(HEIGHT) }}
        >
          <svg
            viewBox={`0 ${TOP} ${letter.advance} ${HEIGHT}`}
            className="block h-full w-full overflow-visible"
            preserveAspectRatio="xMinYMin meet"
          >
            <path d={letter.d} fill="currentColor" />
          </svg>
        </span>
      ))}
    </span>
  );
}
