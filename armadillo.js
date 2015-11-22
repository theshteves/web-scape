$(".c-hamburger").click(function(event) {
	$(".c-hamburger").toggleClass('is-active ham-trans');
	$( "#sidebar" ).toggleClass('show-thing');
});

function searchInit(event){
	var site = $('.searchbar').val();
	if (!site.search("/http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/i")) {
		site = 'http://' + site;
	}
	requestUrl(site);
	$('#welcome').fadeOut('100');
	$('.c-hamburger').css('visibility', 'visible').hide().fadeIn('100');
    $('#title').text(site);
	return false;
}

function searchPost(event){
    var site = $('.searchbar2').val();
	if (!site.search("/http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/i")) {
		site = 'http://' + site;
	}
	requestUrl(site);
	$('.searchbar2').val("");
	$(".c-hamburger").toggleClass('is-active ham-trans');
	$( "#sidebar" ).toggleClass('show-thing');
	return false;
}
