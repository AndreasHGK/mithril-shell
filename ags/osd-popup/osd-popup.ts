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
      const closeDelay = 1000;
      // AGS maintainers please look away for the remainder of this function...
      let cancelHide = () => {};

      self.hook(
        props.value.emitter,
        async (self) => {
          cancelHide();
          // If the volume is changed multiple times in a row the popup shouldn't disappear after
          // the first delay, so we cancel that promise and create a new one.
          const hidePromise = new Promise((resolve, _reject) => {
            cancelHide = () => {
              resolve(false);
            };

            setTimeout(() => {
              resolve(true);
            }, closeDelay);
          });

          self.set_visible(true);
          if (await hidePromise) {
            self.set_visible(false);
          }
        },
        "changed",
      );
    },
    visible: false,
    name: `osd-popup-${props.name}`,
    className: "osd-popup",
    anchor: ["bottom"],
    layer: "top",
    exclusivity: "normal",
    child: Widget.Box({
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
                value: props.value,
              }),
            ]),
          }),
        }),
      ],
    }),
  });

/** A speaker volume on screen display popup. */
export const VolumePopup = () =>
  OsdPopup({
    name: "volume",
    icon: audio.speaker.bind("volume").as((volume) => volumeIcon(volume)),
    value: audio.speaker.bind("volume"),
  });
