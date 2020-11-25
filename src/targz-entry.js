// This file is used to decompress a base64 encoded gzip and load it as html
// next line is for ESLint
/* globals base64 */

import TarGZ from "./utils/targz";
import { stringFromBinaryString } from "@/utils/binaryStringToUTF8";

window.addEventListener("DOMContentLoaded", function() {
  const errorReport = document.getElementById("errorReport");
  const errorHelper = document.getElementById("errorHelper");

  TarGZ.parse(atob(base64), load, null, error);

  function load(files, h) {
    // rewrite whole page with contents
    document.open();
    document.write(stringFromBinaryString(files[0].data));
    document.close();
  }
  function error(error) {
    errorReport.innerText = error;
    errorHelper.style.display = "block";
  }
});
