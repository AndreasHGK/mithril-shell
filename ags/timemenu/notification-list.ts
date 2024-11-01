import Notification from "./notification";

const notificationService = await Service.import("notifications");
const notifications = notificationService.bind("notifications");

const Placeholder = () =>
  Widget.Box({
    visible: notifications.as((n) => n.length === 0),
    className: "placeholder",
    hpack: "center",
    vpack: "center",
    children: [Widget.Icon("notifications-disabled-symbolic"), Widget.Label("Your inbox is empty")],
  });

const NotificationList = () => {
  const map: Map<number, ReturnType<typeof Notification>> = new Map();
  let listBox = Widget.Box({
    vertical: true,
    children: notificationService.notifications.map((info) => {
      const notification = Notification(info);
      map.set(info.id, notification);
      return notification;
    }),
  });

  listBox = listBox
    .hook(notificationService, (_, id: number) => map.delete(id), "closed")
    .hook(
      notificationService,
      (_, id: number) => {
        const info = notificationService.getNotification(id);
        if (info === undefined) return;
        const notification = Notification(info);
        map.set(id, notification);
        listBox.children = [notification, ...listBox.children];
      },
      "notified",
    );

  return Widget.Scrollable({
    className: "scrollable",
    visible: notifications.as((n) => n.length > 0),
    vexpand: true,
    hscroll: "never",
    child: listBox,
  });
};

export default () =>
  Widget.Box({
    className: "list",
    children: [Placeholder(), NotificationList()],
  });
