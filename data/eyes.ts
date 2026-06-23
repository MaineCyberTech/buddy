export const EYES = [
  'o o',
  'O O',
  '. .',
  '@ @',
  '^ ^',
  '- -',
  '* *',
  '>< ><',
  '0 0',
  'u u',
  'w w',
  'e e',
  'v v',
  'x x',
  '+ +',
  "' '",
  '" "',
  '$ $',
  '% %',
  '& &',
];

export const EYE_MAP = new Map<string, string>();
// Store the visual representation keyed by the array index
EYES.forEach((eye, i) => EYE_MAP.set(String(i), eye));