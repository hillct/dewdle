URL += 'draw';

var canvas;

function sendCanvas() { // set desired width in CANVAS_WIDTH
	var canvas2 = new fabric.Canvas();
	canvas2.loadFromJSON(JSON.stringify(canvas)); // duplicate ui canvas
	if (canvas.width != CANVAS_WIDTH) {
		var scale = CANVAS_WIDTH / canvas.width;
		var obj = canvas2.getObjects();
		for (var i in obj) {
			obj[i].scaleX = obj[i].scaleX * scale;
			obj[i].scaleY = obj[i].scaleY * scale;
			obj[i].left = obj[i].left * scale;
			obj[i].top = obj[i].top * scale;
		}
		canvas2.setWidth(canvas.getWidth() * scale);
		canvas2.setHeight(canvas.getHeight() * scale);
	}

	socket.send(JSON.stringify(canvas2));
}

$(document).ready( function() {
	socket = openSocket(URL);

//////// CANVAS CODE
	$('#drawing-color').val(COLOR_SELECT[0]);	// set default brush color
	$('#drawing-line-width').val(SIZE_SELECT[0]);	// set default brush size
	$('#line-info').html($('#drawing-line-width').val());
	(function() {
		var $ = function(id){return document.getElementById(id)};

		canvas = this.__canvas = new fabric.Canvas('c', {
			isDrawingMode: true
		});
		resizeCanvas();

		fabric.Object.prototype.transparentCorners = false;

		var drawingModeEl = $('drawing-mode'),
			drawingOptionsEl = $('drawing-mode-options'),
			drawingColorEl = $('drawing-color'),
			drawingLineWidthEl = $('drawing-line-width'),
			clearEl = $('clear-canvas');

		clearEl.onclick = function() {
			canvas.clear();
			sendCanvas();
		};

		drawingModeEl.onclick = function() {
			canvas.isDrawingMode = !canvas.isDrawingMode;
			if (canvas.isDrawingMode) {
				drawingModeEl.innerHTML = 'Cancel drawing mode';
				drawingOptionsEl.style.display = '';
			}
			else {
				drawingModeEl.innerHTML = 'Enter drawing mode';
				drawingOptionsEl.style.display = 'none';
			}
		};

		$('drawing-mode-selector').onchange = function() {
			canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);


			if (canvas.freeDrawingBrush) {
				canvas.freeDrawingBrush.color = drawingColorEl.value;
				canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
			}
		};

		drawingColorEl.onchange = function() {
			canvas.freeDrawingBrush.color = this.value;
		};
		drawingLineWidthEl.onchange = function() {
			canvas.freeDrawingBrush.width = (parseInt(drawingLineWidthEl.value, 10)/100)*$('c').width || 1;
			this.previousSibling.innerHTML = this.value;
		};

		if (canvas.freeDrawingBrush) {
			canvas.freeDrawingBrush.color = drawingColorEl.value;
			canvas.freeDrawingBrush.width = (parseInt(drawingLineWidthEl.value, 10)/100)*$('c').width || 1;
			canvas.freeDrawingBrush.shadowBlur = 0;
		}

	})();
//////// EOF CANVAS CODE

	$ = jQuery;
	$('#canvas-contain').on('click', function() {
		sendCanvas();
	});

	$('#fullscreen').on('click', function() {
		goFullscreen();
	});

	if (FORCE_OP_MODE === true) {
		bindSpacebar();
		$('#op-mode').hide();
	} else if (FORCE_OP_MODE === false) {
		$('#op-mode').hide();
	} else {
		$('#op-mode').on('click', function() {
			if (confirm("WARNING: Spacebar will now control UP/DOWN.")) {
				bindSpacebar();
				$('#op-mode').hide();
			} else {
				$(this).blur();		// prevent accidental presses
			}
		});
	}
});

function goFullscreen() {
	if (document.documentElement.requestFullscreen) {
		document.documentElement.requestFullscreen();
	} else if (document.documentElement.msRequestFullscreen) {
		document.documentElement.msRequestFullscreen();
	} else if (document.documentElement.mozRequestFullScreen) {
		document.documentElement.mozRequestFullScreen();
	} else if (document.documentElement.webkitRequestFullscreen) {
		document.documentElement.webkitRequestFullscreen();
	}
}
