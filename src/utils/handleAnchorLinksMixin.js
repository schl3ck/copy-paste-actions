import Vue from "vue";

export default Vue.extend({
  mounted() {
    this.$el.querySelectorAll('a[href^="#"]').forEach(
      /** @param {HTMLAnchorElement} element */
      (element) => {
        const id = element.getAttribute("href").substr(1);
        if (id.length > 0) {
          element.setAttribute("href", "#");
          element.addEventListener("click", (event) => {
            event.preventDefault();
            let top = document.getElementById(id).offsetTop;
            if (this.$store.state.showMainTitle) {
              top -= document.getElementById("mainTitle").offsetHeight;
            }
            document.getElementById("app").scrollTo({
              left: 0,
              top: top,
              behavior: "auto",
            });
          });
        } else if (element.hasAttribute("data-page")) {
          const page = element.getAttribute("data-page");
          element.addEventListener("click", (event) => {
            event.preventDefault();
            this.$router.push({ name: page });
          });
        } else if (element.hasAttribute("data-pref")) {
          const pref = element.getAttribute("data-pref");
          element.addEventListener("click", (event) => {
            event.preventDefault();
            this.$router.push({
              name: "Preferences",
              params: { scrollToPref: pref },
            });
          });
        }
      },
    );
  },
});
