<script>
export default {
  name: "MenuItem",
  functional: true,
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    iconColor: {
      type: String,
      default: "black"
    }
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
      "muted"
    ].includes(props.iconColor)
      ? "text-" + props.iconColor
      : "";
    const iconColorStyle = props.iconColorClass
      ? ""
      : "color: " + props.iconColor;

    return createElement(
      "div",
      {
        class: "card-body"
      },
      [
        createElement(
          "div",
          {
            class: "d-flex align-items-center"
          },
          [
            createElement("FontAwesomeIcon", {
              props: {
                icon: props.icon
              },
              class: `card-img mr-3 fa-3x ${iconColorClass}`,
              style: iconColorStyle
            }),
            createElement("div", [
              createElement(
                "h5",
                {
                  class: "card-title"
                },
                [
                  props.title,
                  createElement(
                    "span",
                    {
                      class: "sr-only"
                    },
                    ["."]
                  )
                ]
              ),
              createElement(
                "div",
                {
                  class: "card-text"
                },
                props.description
              )
            ]) // /div
          ]
        ) // /div.d-flex.align-items-center
      ]
    ); // /div.card-body
  }
};
</script>

<style lang="scss" scoped>
.card-img {
  width: 3rem;
  max-width: 3rem;
}
</style>
