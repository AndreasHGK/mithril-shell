import { BarWidget } from "../bar-widget.js";

const time = Variable("", {
  // TODO: Format date in program.
  poll: [1000, 'date +"%-d %b %H:%M"'],
});

export const Time = () =>
  BarWidget({
    child: Widget.Label({
      className: "time",
      label: time.bind(),
    }),
    onClicked: () => Utils.execAsync("swaync-client -t"),
  });
