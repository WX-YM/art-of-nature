const ARCHIVE_WORD_PATTERN = /\barchive\b/gi;
const GALLERY_NUMERAL_SUFFIX_PATTERN = /\s+[IVXLCDM]+$/;

export function replaceArchiveUiCopy(value: string) {
  return value.replace(ARCHIVE_WORD_PATTERN, (match) => (match[0] === 'A' ? 'Gallery' : 'gallery'));
}

export function stripGalleryRomanSuffix(value: string) {
  return value.replace(GALLERY_NUMERAL_SUFFIX_PATTERN, '');
}
