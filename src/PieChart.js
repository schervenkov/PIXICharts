(function( charts, PIXI ) {
	var PieChart = function( config ) {
		PIXI.Container.call(this);

		// extend the config with default options
		this.config = charts.extend(config || {}, {
			width: 340,
			height: 200,
			autoRedraw: false,
			showLabels: true,
			showValues: true,
			legend: true,
			firstSectorAngle: 0,
			backgroundColor: null,
			legendPosition: 'right',
			offset: 20,
			chartTitle: null,
			legendTitle: null,
			legendBackgroundColor: 0xAAAAAA,
			font: 'Arial',

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

		// draws the value (if needed) in the center of the three given points
		_drawValue: function( key, position ) {
			if (!this.config.showValues && !this.config.showLabels) return;
			var textParts = [];
			if (this.config.showLabels) {
				textParts.push( this.labels[key] ? this.labels[key] : key );
			}
			if (this.config.showValues) {
				textParts.push( this.data[key] );
			}

			var text = this.chartContainer.addChild(new PIXI.Text( textParts.join(' '), {
				font: '12px ' + this.config.font
			}));
			text.anchor.set(0.5, 0.5);
			text.position.set(position.x, position.y);
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
			if ( this.config.autoRedraw ) {
				this.redraw();
			}
			return this;
		},

		redraw: function() {
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
		}
	});

	// expose PieChart into the charts object
	charts.Pie = PieChart;
})( PIXICharts, PIXI );