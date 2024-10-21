import { Icon } from "lib/types";
import { dynamicChildren } from "lib/widgets";
import { Binding } from "types/service";

const audio = await Service.import("audio");

// A quicksettings slider element constructor.
const Slider = (props: {
  icon: Icon,
  min: number,
  max: number,
  value?: number | Binding<any, any, number>,
  on_change?: (value: { value: number }) => void,
}) => Widget.Box({
  vertical: false,
  className: "slider",
  hexpand: true,
  children: [
    Widget.Icon({
      size: 16,
      icon: props.icon,
    }),
    Widget.Slider({
      draw_value: false,
      hexpand: true,
      value: props.value ?? 0,
      min: props.min,
      max: props.max,
      on_change: props.on_change ?? ((_value) => { }),
    }),
  ],
});

export const sliders = () => Widget.Box({
  vertical: true,
  className: "sliders",
  children: dynamicChildren([
    {
      widget: Slider({
        value: audio.speaker.bind("volume"),
        icon: "audio-volume-high-symbolic",
        min: 0,
        max: 1,
        on_change: ({ value }) => {
          audio.speaker.volume = value;
        },
      }),
      visible: audio.speaker.bind("id").as(id => id !== null),
    },
    {
      widget: Slider({
        value: audio.microphone.bind("volume"),
        icon: "audio-input-microphone-symbolic",
        min: 0,
        max: 1,
        on_change: ({ value }) => {
          audio.microphone.volume = value;
        },
      }),
      visible: audio.microphone.bind("id").as(id => id !== null),
    },
  ]),
});
