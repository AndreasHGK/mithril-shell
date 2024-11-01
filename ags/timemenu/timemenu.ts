import NotificationList from "./notification-list";
import { PopupWindow } from "window";

export default () =>
  PopupWindow({
    name: "timemenu",
    location: "top-center",

    child: Widget.Box({
      className: "timemenu popup",
      vertical: true,
      hexpand: false,
      vexpand: false,
      children: [NotificationList()],
    }),
  });
