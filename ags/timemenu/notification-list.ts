import { type Notification as NotificationInfo } from "types/service/notifications";

const notificationService = await Service.import("notifications");
const notifications = notificationService.bind("notifications");

const Notification = (info: NotificationInfo) => {

};

const Placeholder = () => Widget.Box({
  visible: notifications.as(n => n.length === 0),
  children: [
    Widget.Icon("notifications-disabled-symbolic"),
    Widget.Label("Your inbox is empty"),
  ],
});

const NotificationList = () => Widget.Box({
});

export default () => Widget.Box({
  children: [
    Placeholder(),
  ],
});
