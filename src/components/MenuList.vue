<script>
import MenuItem from "@/components/MenuItem.vue";

export default {
  name: "MenuList",
  functional: true,
  props: {
    /**
     * @type {MenuList.MenuItem[]}
     */
    items: {
      type: Array,
      required: true,
    },
    columns: {
      type: Number,
      default: 2,
    },
  },
  render(createElement, context) {
    if (!context.props.items) return;

    const cards = context.props.items.map((i) => {
      const el = createElement(
        "button",
        {
          class: "col-md mb-2 card text-left",
          on: {
            click: (event) => {
              // hack clicked styles
              /** @type {HTMLButtonElement} */
              const btn = el.elm;
              btn.classList.add("btn-clicked");
              setTimeout(() => {
                i.click(event);
                btn.classList.remove("btn-clicked");
              }, 10);
            },
          },
        },
        [
          createElement(MenuItem, {
            props: i,
          }),
        ],
      );
      return el;
    });

    const nodes = [];
    const columns = context.props.columns;
    let currentChildren = [];

    const addToNodes = () => {
      nodes.push(
        createElement(
          "div",
          {
            class: "row no-gutters",
          },
          currentChildren,
        ),
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
  },
};
</script>

<style lang="scss" scoped>
.row {
  margin: 0 -0.25rem;
}
.col-md {
  margin: 0 0.25rem;
}
.btn-clicked {
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  background: #00000020;
}
</style>
