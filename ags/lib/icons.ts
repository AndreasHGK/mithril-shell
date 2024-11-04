/** Takes a volume percentage (where 1 is normal max volume) and returns its corresponding icon. */
export function volumeIcon(volume: number): string {
  const icon = [
    [101, "overamplified"],
    [67, "high"],
    [34, "medium"],
    [1, "low"],
    [0, "muted"],
  ].find(([threshold]) => +threshold <= volume * 100)?.[1];

  return `audio-volume-${icon}-symbolic`;
}
