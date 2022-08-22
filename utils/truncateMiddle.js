// Borrowed from https://stackoverflow.com/a/5723274/1375972
export default function truncateMiddle(str) {
  const targetLength = 11;
  const separator = "...";

  const sepLen = separator.length;
  const charsToShow = targetLength - sepLen;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return (
    str.substring(0, frontChars) +
    separator +
    str.substring(str.length - backChars)
  );
}
