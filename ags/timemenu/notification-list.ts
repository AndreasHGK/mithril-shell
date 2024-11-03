import type { Variable as VariableType } from "types/variable";

import Notification from "./notification";

const notificationService = await Service.import("notifications");

type NotificationMap = VariableType<Map<number, ReturnType<typeof Notification>>>;

const Placeholder = (notifications: NotificationMap) =>
  Widget.Box({
    visible: notifications.bind().as((m) => m.size === 0),
    className: "placeholder",
    hexpand: true,
    vexpand: true,
    hpack: "center",
    vpack: "center",
    children: [Widget.Icon("notifications-disabled-symbolic"), Widget.Label("Your inbox is empty")],
  });

const NotificationList = (notifications: NotificationMap) => {
  const notify = (self: ReturnType<typeof Widget.Box>, id: number | undefined) => {
    if (id === undefined) return;

    const info = notificationService.getNotification(id);
    if (info === undefined) return;

    const notification = Notification(info);
    notifications.setValue(notifications.getValue().set(id, notification));
    self.children = [notification, ...self.children];
  };

  const remove = (id: number | undefined) => {
    if (id === undefined) return;

    const m = notifications.getValue();
    const notification = m.get(id);
    if (notification === undefined) {
      return;
    }

    m.delete(id);
    notification.destroy();
    notifications.setValue(m);
  };

  return Widget.Scrollable({
    className: "scrollable",
    visible: notifications.bind().as((n) => n.size > 0),
    vexpand: true,
    hscroll: "never",
    child: Widget.Box({
      vertical: true,
      children: notificationService.notifications.map((info) => {
        const notification = Notification(info);
        notifications.setValue(notifications.getValue().set(info.id, notification));
        return notification;
      }),
      setup(self) {
        self
          .hook(
            notificationService,
            (_: unknown, id: number | undefined) => notify(self, id),
            "notified",
          )
          .hook(notificationService, (_: unknown, id: number | undefined) => remove(id), "closed");
      },
    }),
  });
};

export default () => {
  // Keep track of registered notifications.
  const notifications: NotificationMap = Variable(new Map());
  return Widget.Box({
    className: "list",
    children: [Placeholder(notifications), NotificationList(notifications)],
  });
};
