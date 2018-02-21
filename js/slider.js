$(document).on('ready', function(){

		function moveSlider(e){
			// record the current position and click position
			var pos = $(e.currentTarget).offset()
			,		posX = e.pageX - pos.left
			, 	value = posX*100/$(e.currentTarget).outerWidth();

			// if clicked within range of the slider boundaries
			if(posX >= 0 && posX <= $(e.currentTarget).outerWidth()){
				// move the slider progress bar and indicator
				$('.slider > .progress').css('width', posX+'px');
				$('.slider > .indicator').css('left', posX+'px');

				$('#valueSlider').val(value); // output the value
			}		
		}

	$('.slider').on('mousedown', function(e){

		moveSlider(e);

		$(this).on('mousemove', function(e){
			moveSlider(e);
		})

	}).on('mouseup', function(){
		$(this).off('mousemove');
	})

});