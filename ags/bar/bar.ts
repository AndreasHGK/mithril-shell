import { BarWidget } from "./bar-widget.js";
import { StatusIndicators } from "./widgets/status-indicators.js";
import { Time } from "./widgets/time.js";
import { Workspaces } from "./widgets/workspaces.js";

export const Bar = (monitor: number) => Widget.Window({
  monitor,
  name: `bar${monitor}`,
  className: "bar",
  anchor: ['top', 'left', 'right'],
  exclusivity: 'exclusive',
  layer: "top",
  child: Widget.CenterBox({
    start_widget: Widget.Box({
      hpack: "start",
      children: [
        Workspaces(monitor),
      ],
    }),
    center_widget: Widget.Box({
      hpack: "center",
      children: [
        Time(),
      ],
    }),
    end_widget: Widget.Box({
      hpack: "end",
      children: [
        StatusIndicators(),
      ],
    }),
  }),
});
