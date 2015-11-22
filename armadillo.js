$('#searchbar').click(function() {
	$('#sidebar').toggleClass("active");
});	

$( "#sidebar" ).hover(
    function() {
    $( this ).css("transform", "translateX(0%)");
  }, function() {
    $( this ).css("transform", "translateX(-90%)");
  }
);