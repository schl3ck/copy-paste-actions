<script>
export default {
  name: "IconCloudLink",
  render(h) {
    return h("BIconstack", [
      h("BIcon", {
        props: {
          stacked: true,
          icon: "cloud"
        }
      }),
      h("BIcon", {
        props: {
          stacked: true,
          icon: "link",
          scale: 0.5
        }
      })
    ]);
  }
};
</script>
