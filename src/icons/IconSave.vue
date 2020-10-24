<script>
export default {
  name: "IconSave",
  functional: true,
  render(h) {
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
        h("g", [
          h("path", {
            attrs: {
              "fill-rule": "evenodd",
              d: `M 0 2 a 2 2 0 0 1 2 -2 h 9 a 2 2 0 0 1 1.4142 0.5858 l 3 3
              a 2 2 0 0 1 0.5858 1.4142 v 9 a 2 2 0 0 1 -2 2 h -12
              a 2 2 0 0 1 -2 -2 z
              M 1 2 a 1 1 0 0 1 1 -1 h 9 a 1 1 0 0 1 0.7071 0.2929 l 3 3
              a 1 1 0 0 1 0.2929 0.7071 v 9 a 1 1 0 0 1 -1 1 h -12
              a 1 1 0 0 1 -1 -1 z
              M 11 1 v 4 a 2 2 0 0 1 -2 2 h -5 a 2 2 0 0 1 -2 -2 v -4 h 1
              v 4 a 1 1 0 0 0 1 1 h 5 a 1 1 0 0 0 1 -1 v -4 z
              M 11 11 a 3 3 0 0 1 -6 0 a 3 3 0 0 1 6 0 m -1 0 a 2 2 0 0 1 -4 0
              a 2 2 0 0 1 4 0`,
            },
          }),
        ]),
      ],
    );
  },
};
</script>
