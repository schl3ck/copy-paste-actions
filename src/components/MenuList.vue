<script>
import MenuItem from "@/components/MenuItem.vue";

export default {
  name: "MenuList",
  /**
   * @type {{title: string, description: string, icon: string, iconColor?: string, click: () => void}}
   */
  props: {
    items: Array,
    columns: Number
  },
  components: {
    MenuItem
  },
  render(createElement) {
    if (!this.items) return;

    const cards = this.items.map(i => {
      return createElement(
        "div",
        {
          class: "col-md"
        },
        [
          createElement("MenuItem", {
            props: i,
            on: {
              click: i.click
            }
          })
        ]
      );
    });

    const nodes = [];
    const columns = this.columns || 2;
    let currentChildren = [];

    const addToNodes = () => {
      nodes.push(
        createElement(
          "div",
          {
            class: "row mb-4"
          },
          currentChildren
        )
      );
    };

    for (let i = 0; i < this.items.length; i++) {
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
