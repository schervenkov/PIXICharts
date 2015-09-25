(function( charts, PIXI ) {
	var PieChart = function( config ) {
		PIXI.Container.call(this);

		this.config = charts.extend(config || {}, {
			width: 340,
			height: 200,
			autoRedraw: true,
			showLabels: true,
			showValues: true,
			legend: false,
			radius: 60,
			position: [100, 100],
			firstSectorAngle: 0
		});

		this.labels = {};
		this.colors = {};
		this.data = {};

		this.getColor = charts.colors();

		this.chart = this.addChild(new PIXI.Graphics());
		if ( this.config.legend ) {
			this.legend = this.addChild(new PIXI.Container());
		}
	};

	PieChart.prototype = Object.create( PIXI.Container.prototype );

	charts.extend(PieChart.prototype, {
		_angle: function( angle ) {
			return (angle - 90) * PIXI.DEG_TO_RAD;
		},

		_drawSector: function( startAngle, percent, color ) {
			var endAngle	= 360 * (percent / 100) + startAngle,
				centerX 	= this.config.position[0],
				centerY 	= this.config.position[1],
				radius		= this.config.radius;

			startAngle = this._angle(startAngle);

			this.chart
					.beginFill(color, 1)
					.moveTo(centerX, centerY)
					.lineTo(
						centerX + radius * Math.cos( startAngle ),
						centerY + radius * Math.sin( startAngle )
					)
					.arc(centerX, centerY, radius, startAngle, this._angle(endAngle), false )
					.lineTo(centerX, centerY)
					.endFill();

			return endAngle;
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
				nextSectorStartAngle = this._drawSector(nextSectorStartAngle, Math.round((this.data[key] / total) * 100), this.colors[key]);
			}
		}
	});

	// expose PieChart into the charts object
	charts.Pie = PieChart;
})( PIXICharts, PIXI );