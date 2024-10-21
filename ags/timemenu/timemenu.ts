import NotificationList from './notification-list';

export default () => Widget.Window({
  visible: false,
  name: "timemenu",
  className: "timemenu",
  anchor: ['top'],
  layer: "top",
  exclusivity: "normal",
  setup: w => w.keybind("Escape", () => App.closeWindow("timemenu")),
  child: Widget.Box({
    vertical: true,
    children: [
      NotificationList(),
    ],
  }),
});
