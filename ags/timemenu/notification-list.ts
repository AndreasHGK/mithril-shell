import Notification from "./notification";

const notificationService = await Service.import("notifications");
const notifications = notificationService.bind("notifications");

const Placeholder = () =>
  Widget.Box({
    visible: notifications.as((n) => n.length === 0),
    className: "placeholder",
    hexpand: true,
    vexpand: true,
    hpack: "center",
    vpack: "center",
    children: [Widget.Icon("notifications-disabled-symbolic"), Widget.Label("Your inbox is empty")],
  });

const NotificationList = () => {
  // Keep track of registered notifications.
  const map: Map<number, ReturnType<typeof Notification>> = new Map();
  return Widget.Scrollable({
    className: "scrollable",
    visible: notifications.as((n) => n.length > 0),
    vexpand: true,
    hscroll: "never",
    child: Widget.Box({
      vertical: true,
      children: notificationService.notifications.map((info) => {
        const notification = Notification(info);
        map.set(info.id, notification);
        return notification;
      }),
      setup(self) {
        self
          .hook(notificationService, (_, id: number) => map.delete(id), "closed")
          .hook(
            notificationService,
            (_, id: number) => {
              const info = notificationService.getNotification(id);
              if (info === undefined) return;
              const notification = Notification(info);
              map.set(id, notification);
              self.children = [notification, ...self.children];
            },
            "notified",
          );
      }
    }),
  });
};

export default () =>
  Widget.Box({
    className: "list",
    children: [Placeholder(), NotificationList()],
  });
