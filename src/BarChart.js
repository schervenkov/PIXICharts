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
		_drawSector: function( xPos, maxValue, key ) {
			var totalSectors = Object.keys(this.data).length;
			var sectorWidth = (this.config.width - (totalSectors-1)*this.config.offset) / totalSectors;

			var sectorHeight = this.config.height * (this.data[key] / maxValue);
			var yPos = this.config.height - sectorHeight;

			this.chart
					.beginFill(this.colors[key])
					.drawRect(xPos, yPos, sectorWidth, sectorHeight)
					.endFill();

			this._drawValue(key, {
				x: xPos + (sectorWidth / 2),
				y: yPos + (sectorHeight / 2)
			});

			return xPos + sectorWidth + this.config.offset;
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
			var nextSectorX = 0;
			var maxValue = 0;

			for (var key in this.data) {
				if ( !this.data.hasOwnProperty(key) ) continue;
				if ( this.data[key] > maxValue ) {
					maxValue = this.data[key];
				}
			}

			for (var key in this.data) {
				if ( !this.data.hasOwnProperty(key) ) continue;
				if (!this.colors[key]) {
					this.setColor(key, this.getColor());
				}
				nextSectorX = this._drawSector(nextSectorX, maxValue, key);
			}
		}
	});

	// expose BarChart into the charts object
	charts.Bar = BarChart;
})( PIXICharts, PIXI );