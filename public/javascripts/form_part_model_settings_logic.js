$(document).ready(function () {
  setupOnChangeLlistener();
});

function setupOnChangeLlistener() {
  $(".ranking-model-select").change(function () {
    const $this = $(this);

    $this.parent().parent().parent().children(".model-properties").hide();
    $this
      .parent()
      .parent()
      .parent()
      .children(".model-type-" + $this.val())
      .show();
  });
}
