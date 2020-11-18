/**
 *
 * @param {string} contentRef
 * @param {string} toolbarRef
 * @returns {import("vue").ComponentOptions}
 */
export default function handleButtonToolbarMixin(contentRef, toolbarRef) {
  return {
    activated() {
      window.addEventListener("resize", this.onToolbarResize);
      this.onToolbarResize();
    },
    deactivated() {
      window.removeEventListener("resize", this.onToolbarResize);
    },
    destroyed() {
      window.removeEventListener("resize", this.onToolbarResize);
    },
    methods: {
      onToolbarResize() {
        const height = this.$refs[toolbarRef].clientHeight;
        this.$refs[
          contentRef
        ].style.paddingBottom = `calc(${height}px + 0.25rem)`;
      },
    },
  };
}
