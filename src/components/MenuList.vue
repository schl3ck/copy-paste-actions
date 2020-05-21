<script>
import MenuItem from "@/components/MenuItem.vue";

export default {
  name: "MenuList",
  functional: true,
  props: {
    /**
     * @type {{title: string, description: string, icon: string, iconColor?: string, click: () => void}[]}
     */
    items: {
      type: Array,
      required: true
    },
    columns: {
      type: Number,
      default: 2
    }
  },
  render(createElement, context) {
    if (!context.props.items) return;

    const cards = context.props.items.map(i => {
      return createElement(
        "button",
        {
          class: "col-md mb-2 card text-left",
          on: {
            click: i.click
          }
        },
        [
          createElement(MenuItem, {
            props: i
          })
        ]
      );
    });

    const nodes = [];
    const columns = context.props.columns;
    let currentChildren = [];

    const addToNodes = () => {
      nodes.push(
        createElement(
          "div",
          {
            class: "row no-gutters"
          },
          currentChildren
        )
      );
    };

    for (let i = 0; i < context.props.items.length; i++) {
      currentChildren.push(cards[i]);
      if (i % columns === columns - 1) {
        addToNodes();
        currentChildren = [];
      }
    }
    if (currentChildren.length > 0) {
      addToNodes();
    }
    return createElement("div", nodes);
  }
};
</script>

<style lang="scss" scoped>
.row {
  margin: 0 -0.25rem;
}
.col-md {
  margin: 0 0.25rem;
}
</style>
