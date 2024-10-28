import type { Binding } from "types/service";
import type { ButtonProps } from "types/widgets/button";

export const BarWidget = (
  props: ButtonProps & {
    active?: Binding<any, any, boolean>;
  },
) => {
  const { child, ...otherProps } = props;

  return Widget.Button({
    className: props.active
      ? props.active.as((active) => `bar-widget${active ? " active" : ""}`)
      : "bar-widget",
    child,
    ...otherProps,
  });
};
