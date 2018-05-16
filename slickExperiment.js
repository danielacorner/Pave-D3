d3.select("body").append("div")
	.attr("id","carousel")
	.style("width","300px")
	.style("height","100px")
	.style("background","lightgrey")
	.html(
		"<div class='carouselTooltip'>"+
		"<div>content1</div>"+
		"<div>content2</div>"+
		"<div>content3</div>"+
		"</div>"
		)

	$(document).ready(function(){
		$('.carouselTooltip').slick({
			autoplay: true
			// more settings at http://kenwheeler.github.io/slick/#settings
		});
	});