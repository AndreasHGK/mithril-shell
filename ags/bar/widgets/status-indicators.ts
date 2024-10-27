import { type Icon } from "lib/types";
import { BarWidget } from "../bar-widget.js";
import { Binding } from "types/service.js";
import Gtk from "types/@girs/gtk-3.0/gtk-3.0.js";

const audio = await Service.import('audio');
const battery = await Service.import('battery')
const bluetooth = await Service.import('bluetooth');
const network = await Service.import('network');

/** An icon giving some information about the current state of the system. */
const StatusIndicator = (props: {
  icon: Icon,
  visible?: Binding<any, any, boolean>,
  children?: Gtk.Widget[],
}) => Widget.Box({
  visible: props.visible ?? true,
  children: [
    Widget.Icon({
      size: 17,
      className: "status-indicator",
      icon: props.icon,
    }),
    ...(props.children ?? []),
  ],
});

export const StatusIndicators = () => {
  const active = Variable(false);

  return BarWidget({
    active: active.bind(),
    child: Widget.Box({
      className: "status-indicators",
      children: [
        StatusIndicator({
          icon: Utils.merge(
            [network.bind('primary'), network.wired.bind('icon_name'), network.wifi.bind('icon_name')],
            (primary, wired, wifi) => {
              if (primary == "wifi") {
                return wifi;
              } else {
                return wired;
              }
            }
          ),
        }),

        StatusIndicator({
          icon: "network-vpn-symbolic",
          visible: network.vpn.bind("activated_connections").as(cons => cons.length > 0),
        }),

        StatusIndicator({
          icon: "bluetooth-active-symbolic",
          visible: bluetooth.bind("connected_devices").as(devices => devices.length > 0),
        }),

        StatusIndicator({
          icon: audio.speaker.bind('volume').as((volume) => {
            const icon = [
              [101, 'overamplified'],
              [67, 'high'],
              [34, 'medium'],
              [1, 'low'],
              [0, 'muted'],
            ].find(([threshold]) => (+threshold) <= (volume * 100))?.[1];

            return `audio-volume-${icon}-symbolic`;
          }),
        }),

        StatusIndicator({
          icon: battery.bind("icon_name"),
          visible: battery.bind("available"),
        }),

        StatusIndicator({
          icon: "system-shutdown-symbolic",
          visible: battery.bind("available").as(avail => !avail),
        }),
      ],
    }),
    onClicked: () => App.toggleWindow('quicksettings'),
  })
    .hook(App, (_self, windowName, visible) => {
      if (windowName !== "quicksettings") {
        return;
      }
      active.value = visible;
    }, 'window-toggled')
};
