import GLib from "gi://GLib";

export function formatTime(value: number, format: string = "%H:%M"): string {
  const result = GLib.DateTime.new_from_unix_local(value).format(format);
  if (result === null) {
    throw new Error(`Failed to format time using \`${format}\` format.`);
  }
  return result;
}
