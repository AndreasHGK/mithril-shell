import { BarWidget } from "../bar-widget.js";

const audio = await Service.import('audio');
const battery = await Service.import('battery')
const bluetooth = await Service.import('bluetooth');
const network = await Service.import('network');

const StatusIndicator = (icon) => Widget.Icon({
  size: 17,
  className: "status-indicator",
  icon,
});

export const StatusIndicators = () => BarWidget({
  child: Widget.Box({
    className: "status-indicators",
    children: [
      StatusIndicator(Utils.merge(
        [network.bind('primary'), network.wired.bind('icon_name'), network.wifi.bind('icon_name')],
        (primary, wired, wifi) => {
          if (primary == "wifi") {
            return wifi;
          } else {
            return wired;
          }
        }
      )),

      Widget
        .Box({
          child: StatusIndicator("bluetooth-active-symbolic"),
        })
        .hook(bluetooth, self => {
          self.visible = bluetooth.connected_devices.length > 0;
        }),

      StatusIndicator(audio.speaker.bind('volume').as((volume) => {
        const icon = [
          [101, 'overamplified'],
          [67, 'high'],
          [34, 'medium'],
          [1, 'low'],
          [0, 'muted'],
        ].find(([threshold]) => (+threshold) <= (volume * 100))?.[1];

        return `audio-volume-${icon}-symbolic`;
      })),

      StatusIndicator(Utils.merge(
        [battery.bind('available'), battery.bind('icon_name')],
        (enabled, icon_name) => {
          if (!enabled) {
            return "system-shutdown-symbolic";
          }

          return icon_name;
        }
      )),
    ],
  }),
  on_clicked: () => App.toggleWindow('quicksettings'),
}); 
