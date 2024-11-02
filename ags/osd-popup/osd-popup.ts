import type GLib from "gi://GLib";
import { volumeIcon } from "lib/icons";
import type { Icon } from "lib/types";
import { conditionalChildren } from "lib/widgets";
import type { Binding } from "types/service";

const audio = await Service.import("audio");

/**
 * A small on screen display popup window that shows some status information such as currently
 * volume. It automatically unhides and hides itself when a change occurs.
 */
export const OsdPopup = (props: {
  name: string;
  icon: Icon;
  value: Binding<any, any, number>;
  label?: string | Binding<any, any, string>;
}) =>
  Widget.Window({
    setup(self) {
      const close_delay = 1000;

      // We need to keep track of the previous value as the binding may be triggered even when the
      // value did not change.
      let prev_value: null | number = null;
      let hider: null | GLib.Source = null;

      // Hacky way to show the window when the value changes: this abuses the fact that bindings can
      // be transformed with a function that will run on change.
      const value_with_listener = props.value.as((value) => {
        // Also check for null as it would otherwise show the window when the binding is created.
        if (value === prev_value || prev_value === null) {
          prev_value = value;
          return value;
        }
        prev_value = value;

        // If the volume is changed multiple times in a row the popup shouldn't disappear after
        // the first delay, so we cancel that promise and create a new one.
        if (hider !== null) {
          clearTimeout(hider);
        }
        hider = setTimeout(() => {
          self.set_visible(false);
        }, close_delay);

        self.set_visible(true);

        return value;
      });

      self.child = Widget.Box({
        children: [
          Widget.Icon({
            icon: props.icon,
            size: 32,
          }),
          Widget.CenterBox({
            vertical: true,
            centerWidget: Widget.Box({
              className: "middle",
              vertical: true,
              children: conditionalChildren([
                props.label
                  ? Widget.Label({
                      label: props.label,
                    })
                  : null,
                Widget.LevelBar({
                  vexpand: false,
                  widthRequest: 150,
                  heightRequest: 6,
                  barMode: "continuous",
                  visible: true,
                  value: value_with_listener,
                }),
              ]),
            }),
          }),
        ],
      });
    },
    visible: false,
    name: `osd-popup-${props.name}`,
    className: "osd-popup",
    anchor: ["bottom"],
    layer: "top",
    exclusivity: "normal",
  });

/** A speaker volume on screen display popup. */
export const VolumePopup = () =>
  OsdPopup({
    name: "volume",
    icon: audio.speaker.bind("volume").as((volume) => volumeIcon(volume)),
    value: audio.speaker.bind("volume"),
  });
