<script>
export default {
  name: "IconSearchMinus",
  functional: true,
  render(h) {
    return h("span", [
      h("BIconstack", [
        h("BIcon", {
          props: {
            icon: "search",
            stacked: true
          }
        }),
        h("BIcon", {
          props: {
            icon: "dash",
            stacked: true,
            scale: 0.9,
            "shift-h": -1.5,
            "shift-v": 1.25
          }
        })
      ])
    ]);
  }
};
</script>
