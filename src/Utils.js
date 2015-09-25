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
		var _colors = [0xefef45, 0xf4d1a4, 0xb3f79e, 0xe5344f, 0xf25489, 0x2a2787, 0x99fcb5, 0x7675d1, 0xb9cc16, 0x7ff9a2, 0x70e04e, 0xbfa9fc, 0xabf28a, 0xf4e181, 0x38e038, 0xb4f9a9, 0xea2e8c, 0x80c10f, 0xf2aa96, 0xed301e, 0xf2a8a2, 0xe8b284, 0xf42cbf, 0xfcecae, 0x95c2ed, 0x2af9bf, 0x4ae8c3, 0xc0fc0c, 0x067ad3, 0xb8f413, 0xb5d2f4, 0xa4bf37, 0xc12a2d, 0xd8836c, 0x0e94a3, 0xf7de02, 0xe5ccff, 0xdff296, 0x95b524, 0xe53961, 0x6da9ce, 0xe04c23, 0xbabafc, 0x8891e0, 0xf7b7ef, 0xea2096, 0xf7b896, 0x448aaa, 0x3d2784, 0xf477e4];
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