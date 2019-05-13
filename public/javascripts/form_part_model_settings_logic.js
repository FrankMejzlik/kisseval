
$( document ).ready(function() 
{
  setupOnChangeLlistener();
});
  
function setupOnChangeLlistener() 
{
  $(".ranking-model-select").change(function() 
    {
    const $this = $(this);

    $this.parent().parent().parent().children(".model-properties").hide();
    $this.parent().parent().parent().children(".model-type-" + $this.val()).show();

  });
}

function fillInCurrentSettings()
{
  // General
  $('[name="0][numResults]"]').val(ranker.settings.numResults).change();
  $('[name="0][aggregation]"]').val(ranker.settings.aggregation).change();
  $('[name="0][aggregationParameter]"]').val(ranker.settings.aggregationParameter).change();
  $('[name="0][rankingModel]"]').val(ranker.settings.rankingModel).change();
  $('[name="0][keywordFrequency]"]').val(ranker.settings.keywordFrequency).change();
  $('[name="0][dataSource]"]').val(ranker.settings.dataSource).change();

  // Boolean
  $('[name="0][boolean_trueTreshold]"]').val(ranker.settings.boolean_trueTreshold).change();
  $('[name="0][boolean_inBucketRanking]"]').val(ranker.settings.boolean_inBucketRanking).change();

  // Viret
  $('[name="0][viret_trueTreshold]"]').val(ranker.settings.viret_trueTreshold).change();
  $('[name="0][viret_queryOperations]"]').val(ranker.settings.viret_queryOperations).change();
}
