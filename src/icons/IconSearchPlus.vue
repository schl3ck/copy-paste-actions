<script>
export default {
  name: "IconSearchPlus",
  functional: true,
  render(h) {
    return h("span", [
      h("BIconstack", [
        h("BIcon", {
          props: {
            icon: "search",
            stacked: true,
          },
        }),
        h("BIcon", {
          props: {
            icon: "plus",
            stacked: true,
            scale: 0.9,
            "shift-h": -1.5,
            "shift-v": 1.25,
          },
        }),
      ]),
    ]);
  },
};
</script>
