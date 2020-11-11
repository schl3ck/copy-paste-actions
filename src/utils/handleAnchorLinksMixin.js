import Vue from "vue";

export default Vue.extend({
  mounted() {
    this.$el.querySelectorAll('a[href^="#"]').forEach(
      /** @param {HTMLAnchorElement} element */
      (element) => {
        const id = element.getAttribute("href").substr(1);
        element.setAttribute("href", "#");
        element.addEventListener("click", (event) => {
          event.preventDefault();
          let top = document.getElementById(id).offsetTop;
          if (this.$store.state.showMainTitle) {
            top -= document.getElementById("mainTitle").offsetHeight;
          }
          window.scrollTo({
            left: 0,
            top: top,
            behavior: "auto",
          });
        });
      },
    );
  },
});
