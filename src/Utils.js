// define global PIXICharts object
if ( !window.PIXICharts ) window.PIXICharts = {};

(function( charts, PIXI ) {
	charts.extend = function( obj1, obj2 ) {
		for (var key in obj2) {
			if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
				obj1[key] = obj2[key];
			}
		}
		return obj1;
	};

	charts.colors = function() {
		var _colors = [0xD26D03, 0x6AC811, 0x718EA6, 0x4E0096, 0x54DB00, 0x77AB45, 0xE0EA1F, 0xB8147A, 0x000332, 0x88553E];
		var _current = -1;
		return function() {
			if (_current >= _colors.length - 1) {
				_current = 0;
			} else {
				_current++;
			}
			return _colors[_current];
		};
	};
})( PIXICharts, PIXI );