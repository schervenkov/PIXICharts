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
(function( charts, PIXI ) {
	var BarChart = function( config ) {
		PIXI.Container.call(this);

		// extend the config with default options
		this.config = charts.extend(config || {}, {
			width: 340,
			height: 200,
			autoRedraw: false,
			showLabels: true,
			showValues: true,
			backgroundColor: null,
			offset: 10,
			chartTitle: null,
			font: 'Arial',
			valueFormat: function(val) { return val; }
		});

		this.labels = {};
		this.colors = {};
		this.data = {};

		// getColor util
		this.getColor = charts.colors();

		// background element
		this.background = this.addChild( new PIXI.Graphics() );
		this.setBackgroundColor( this.config.backgroundColor );

		// create chart container
		this.chartContainer = this.addChild(new PIXI.Container());
		this.chart = this.chartContainer.addChild(new PIXI.Graphics);
	};

	BarChart.prototype = Object.create( PIXI.Container.prototype );

	charts.extend(BarChart.prototype, {
		_drawSector: function( xPos, key ) {
			// this._drawValue(key, labelPosition);
			// return nextSectorX;
		},

		// draws the value (if needed) at given point
		_drawValue: function( key, position ) {
			if (!this.config.showValues && !this.config.showLabels) return;
		},

		setBackgroundColor: function( color ) {
			this.background.clear();
			if (!color) {
				return this;
			}

			this.background
					.beginFill(color)
					.drawRect(0, 0, this.config.width, this.config.height)
					.endFill();

			return this;
		},

		setColor: function( key, color ) {
			this.colors[ key ] = color;
			if ( this.config.autoRedraw ) {
				this.redraw();
			}
			return this;
		},

		setLabel: function( key, label ) {
			this.labels[ key ] = label;
			if ( this.config.autoRedraw ) {
				this.redraw();
			}
			return this;
		},

		setData: function( key, value ) {
			this.data[ key ] = value;
			if (!this.labels[key]) {
				this.setLabel(key, key);
			}
			if ( this.config.autoRedraw ) {
				this.redraw();
			}
			return this;
		},

		redraw: function() {
			var nextSectorX = this.config.offset;

			for (var key in this.data) {
				if ( !this.data.hasOwnProperty(key) ) continue;
				total += this.data[key];
			}

			for (var key in this.data) {
				if ( !this.data.hasOwnProperty(key) ) continue;
				if (!this.colors[key]) {
					this.setColor(key, this.getColor());
				}
				nextSectorX = this._drawSector(nextSectorX, key);
			}
		}
	});

	// expose BarChart into the charts object
	charts.Bar = BarChart;
})( PIXICharts, PIXI );
(function( charts, PIXI ) {
	var PieChart = function( config ) {
		PIXI.Container.call(this);

		// extend the config with default options
		this.config = charts.extend(config || {}, {
			width: 340,
			height: 200,
			autoRedraw: false,
			showLabels: false,
			showValues: true,
			legend: true,
			firstSectorAngle: 0,
			backgroundColor: null,
			legendPosition: 'right',
			offset: 10,
			chartTitle: null,
			legendTitle: 'Legend:',
			legendBackgroundColor: 0xAAAAAA,
			font: 'Arial',
			valueFormat: function(val) { return val; },
			legendWidth: 40 // percents
		});

		this.labels = {};
		this.colors = {};
		this.data = {};

		// calculate legend size
		if ( this.config.legend ) {
			this.legendSize = {
				width: this.config.width * (this.config.legendWidth / 100),
				height: this.config.height
			};
		} else { // if there's no legend - set size to 0x0
			this.legendSize = {
				width: 0,
				height: 0
			};
		}

		// auto radius calculation
		if (!this.config.radius) {
			this.config.radius = (Math.min(this.config.width - this.legendSize.width, this.config.height) / 2) - this.config.offset;
		}

		// auto chart position
		if (!this.config.position) {
			this.config.position = {
				x: (this.config.width - this.legendSize.width) / 2,
				y: this.config.height / 2
			};
		}

		// getColor util
		this.getColor = charts.colors();

		// background element
		this.background = this.addChild( new PIXI.Graphics() );
		this.setBackgroundColor( this.config.backgroundColor );

		// chreate chart container
		this.chartContainer = this.addChild(new PIXI.Container());
		this.chart = this.chartContainer.addChild(new PIXI.Graphics);

		this.tempChildren = [];

		if ( this.config.legend ) {
			// create legend container
			this.legend = this.addChild( new PIXI.Container() );

			// set legend background
			if (this.config.legendBackgroundColor) {
				this.legend.addChild(
					new PIXI.Graphics()
						.beginFill(this.config.legendBackgroundColor)
						.drawRect(0, 0, this.legendSize.width, this.legendSize.height)
						.endFill()
				);
			}

			// reposition legend and chart
			if ( this.config.legendPosition == 'left' ) {
				this.legend.position.set(0, 0);
				this.chartContainer.position.set( this.legendSize.width, 0 );
			} else { // right
				this.legend.position.set(this.config.width - this.legendSize.width, 0);
				this.chartContainer.position.set( 0, 0 );
			}
		}
	};

	PieChart.prototype = Object.create( PIXI.Container.prototype );

	charts.extend(PieChart.prototype, {
		_angle: function( angle ) {
			return (angle - 90) * PIXI.DEG_TO_RAD;
		},

		_drawSector: function( startAngle, percent, key ) {
			var endAngle	= 360 * (percent / 100) + startAngle,
				center 		= {
					x: this.config.position.x,
					y: this.config.position.y
				},
				radius		= this.config.radius;

			var labelPosition = {};
			var middleAngle = (endAngle - startAngle) / 2 + startAngle;
			var middleRadius = radius / 2;

			labelPosition.x = center.x + middleRadius * Math.cos( this._angle(middleAngle) );
			labelPosition.y = center.y + middleRadius * Math.sin( this._angle(middleAngle) );

			startAngle = this._angle(startAngle);

			var pointA = {
				x: center.x + radius * Math.cos( startAngle ),
				y: center.y + radius * Math.sin( startAngle )
			};

			this.chart
					.beginFill(this.colors[key], 1)
					.moveTo(center.x, center.y)
					.lineTo(pointA.x, pointA.y)
					.arc(center.x, center.y, radius, startAngle, this._angle(endAngle), false )
					.lineTo(center.x, center.y)
					.endFill();

			this._drawValue(key, labelPosition);

			return endAngle;
		},

		// draws the value (if needed) at given point
		_drawValue: function( key, position ) {
			if (!this.config.showValues && !this.config.showLabels) return;
			var textParts = [];
			if (this.config.showLabels) {
				textParts.push( this.labels[key] ? this.labels[key] : key );
			}
			if (this.config.showValues) {
				textParts.push( this.config.valueFormat(this.data[key]) );
			}

			var text = new PIXI.Text( textParts.join(' '), {
				font: '12px ' + this.config.font,
				fill: 0xFFFFFF
			});

			var bgPadding = 5;

			var background = new PIXI.Graphics()
										.beginFill(0x000000, 0.5)
										.drawRoundedRect(0, 0, text.width + bgPadding * 2, text.height + bgPadding * 2, 5)
										.endFill();

			this.tempChildren.push(this.chartContainer.addChild(background));
			this.tempChildren.push(this.chartContainer.addChild(text));


			position.x = Math.round(position.x);
			position.y = Math.round(position.y);

			text.anchor.set(0.5, 0.5);
			background.position.set(position.x - text.width / 2 - bgPadding, position.y - text.height / 2 - bgPadding);
			text.position.set(position.x, position.y);
		},

		_drawLegend: function() {
			if (!this.config.legend) return;

			var title = this.legend.addChild(new PIXI.Text(this.config.legendTitle, {
				font: '18px Arial'
			}));

			this.tempChildren.push(title);

			title.anchor.set(0.5, 0);
			title.x = (this.config.width * (this.config.legendWidth/100)) / 2;
			title.y = this.config.offset;

			var nextY = title.height + this.config.offset + 20;

			var legendCircle, legendLabel;

			var legendLabel = new PIXI.Text('', {
				font: '12px ' + this.config.font
			});

			for (var key in this.labels) {
				if ( !this.data.hasOwnProperty(key) ) continue;

				legendCircle = new PIXI.Graphics()
											.beginFill( 0xFFFFFF )
											.drawCircle(0, 0, 9)
											.endFill()
											.beginFill( this.colors[key] )
											.drawCircle(0, 0, 8)
											.endFill();

				legendLabel = new PIXI.Text(this.labels[key] || key, {
					font: '12px ' + this.config.font
				});

				this.tempChildren.push(legendCircle);
				this.tempChildren.push(legendLabel);

				legendCircle.x = this.config.offset + 9;
				legendCircle.y = nextY;

				legendLabel.anchor.set(0, 0.5);
				legendLabel.x = this.config.offset + 25;
				legendLabel.y = nextY;

				nextY += 25;

				this.legend.addChild(legendCircle);
				this.legend.addChild(legendLabel);
			}
		},

		setBackgroundColor: function( color ) {
			this.background.clear();
			if (!color) {
				return this;
			}

			this.background
					.beginFill(color)
					.drawRect(0, 0, this.config.width, this.config.height)
					.endFill();

			return this;
		},

		setColor: function( key, color ) {
			this.colors[ key ] = color;
			if ( this.config.autoRedraw ) {
				this.redraw();
			}
			return this;
		},

		setLabel: function( key, label ) {
			this.labels[ key ] = label;
			if ( this.config.autoRedraw ) {
				this.redraw();
			}
			return this;
		},

		setData: function( key, value ) {
			this.data[ key ] = value;
			if (!this.labels[key]) {
				this.setLabel(key, key);
			}
			if ( this.config.autoRedraw ) {
				this.redraw();
			}
			return this;
		},

		clear: function() {
			this.tempChildren.forEach(function(child) {
				if (child.parent) {
					child.parent.removeChild(child);
				}
			});
			this.tempChildren = [];
			this.chart.clear();
		},

		redraw: function() {
			this.clear();

			var total = 0,
				nextSectorStartAngle = this.config.firstSectorAngle;

			for (var key in this.data) {
				if ( !this.data.hasOwnProperty(key) ) continue;
				total += this.data[key];
			}

			for (var key in this.data) {
				if ( !this.data.hasOwnProperty(key) ) continue;
				if (!this.colors[key]) {
					this.setColor(key, this.getColor());
				}
				nextSectorStartAngle = this._drawSector(nextSectorStartAngle, (this.data[key] / total) * 100, key);
			}

			this._drawLegend();
		}
	});

	// expose PieChart into the charts object
	charts.Pie = PieChart;
})( PIXICharts, PIXI );