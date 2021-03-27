<script>
export default {
  name: "IconArrowUpToBar",
  functional: true,
  props: {
    rotate: {
      type: [Number, String],
      default: null,
    },
  },
  render(h, { props }) {
    return h(
      "svg",
      {
        class: ["bi b-icon"],
        attrs: {
          xmlns: "http://www.w3.org/2000/svg",
          width: "1em",
          height: "1em",
          viewBox: "0 0 16 16",
          fill: "currentColor",
        },
      },
      [
        h(
          "g",
          {
            attrs: {
              transform: props.rotate
                ? `translate(8 8) rotate(${props.rotate}) translate(-8 -8)`
                : null,
            },
          },
          [
            h("path", {
              attrs: {
                "fill-rule": "evenodd",
                d: `M 8 13
                  a 0.5 0.5 0 0 0 0.5 -0.5
                  v -6.293
                  l 2.146 2.147
                  a 0.5 0.5 0 0 0 0.708 -0.708
                  l -3 -3
                  a 0.5 0.5 0 0 0 -0.708 0
                  l -3 3
                  a 0.5 0.5 0 1 0 0.708 0.708
                  l 2.146 -2.147
                  v 6.293
                  a 0.5 0.5 0 0 0 0.5 0.5
                  z
                  M 1 2.5
                  a 0.5 0.5 0 0 1 0.5 -0.5
                  h 13
                  a 0.5 0.5 0 0 1 0 1
                  h -13
                  a 0.5 0.5 0 0 1 -0.5 -0.5
                  z`,
              },
            }),
          ],
        ),
      ],
    );
  },
};
</script>
