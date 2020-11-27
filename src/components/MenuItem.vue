<script>
export default {
  name: "MenuItem",
  functional: true,
  props: {
    /** @type {import("vue").PropOptions<MenuList.MenuItem>} */
    icon: {
      type: [String, Object],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    iconColor: {
      type: String,
      default: "",
    },
    iconOptions: {
      type: Object,
      default: null,
    },
  },
  render(createElement, context) {
    const props = context.props;
    const iconColorClass = [
      "success",
      "warning",
      "danger",
      "info",
      "primary",
      "secondary",
      "dark",
      "muted",
    ].includes(props.iconColor)
      ? "text-" + props.iconColor
      : "";
    const iconColorStyle =
      iconColorClass || !props.iconColor ? "" : "color: " + props.iconColor;

    let icon;
    if (typeof props.icon === "object" && "component" in props.icon) {
      icon = createElement(props.icon.component, {
        class: "card-img mr-3 fs-3x",
      });
    } else {
      icon = createElement("BIcon", {
        props: {
          icon: props.icon,
          ...props.iconOptions,
        },
        class: `card-img mr-3 fs-3x ${iconColorClass}`,
        style: iconColorStyle,
      });
    }

    return createElement(
      "div",
      {
        class: "card-body",
      },
      [
        createElement(
          "div",
          {
            class: "d-flex align-items-center h-100",
          },
          [
            icon,
            createElement("div", [
              createElement(
                "h5",
                {
                  class: "card-title",
                },
                [
                  props.title,
                  createElement(
                    "span",
                    {
                      class: "sr-only",
                    },
                    ["."],
                  ),
                ],
              ),
              createElement(
                "div",
                {
                  class: "card-text",
                },
                props.description,
              ),
            ]), // /div
          ],
        ), // /div.d-flex.align-items-center
      ],
    ); // /div.card-body
  },
};
</script>

<style lang="scss" scoped>
.card-img {
  width: 3rem;
  max-width: 3rem;
}
</style>
