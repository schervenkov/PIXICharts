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
			barsOffset: 10,
			leftOffset: 30,
			bottomOffset: 20,
			chartTitle: null,
			font: 'Arial',
			valueFormat: function(val) { return val; }
		});

		this.labels = {};
		this.colors = {};
		this.data = {};

		// getColor util
		this.getColor = charts.colors();

		this.tempChildren = [];

		// background element
		this.background = this.addChild( new PIXI.Graphics() );
		this.setBackgroundColor( this.config.backgroundColor );

		// create chart container
		this.chartContainer = this.addChild(new PIXI.Container());
		this.chart = this.chartContainer.addChild(new PIXI.Graphics());
		this.chartLines = this.chartContainer.addChild(new PIXI.Graphics());
	};

	BarChart.prototype = Object.create( PIXI.Container.prototype );

	charts.extend(BarChart.prototype, {
		_drawSector: function( xPos, maxValue, key ) {
			var totalSectors = Object.keys(this.data).length;
			var sectorWidth = (this.config.width - (totalSectors-1) * this.config.barsOffset - this.config.leftOffset) / totalSectors;

			var sectorHeight = this.config.height * (this.data[key] / maxValue) - this.config.bottomOffset;
			var yPos = this.config.height - sectorHeight - this.config.bottomOffset;

			this.chart
					.beginFill(this.colors[key])
					.drawRect(xPos, yPos, sectorWidth, sectorHeight)
					.endFill();

			this._drawValue(key, {
				x: xPos + (sectorWidth / 2),
				y: yPos + (sectorHeight / 2)
			});

			return xPos + sectorWidth + this.config.barsOffset;
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

		_drawLines: function( minValue, maxValue ) {
			this.chartLines
					.lineStyle(1, 0x000000)
					.moveTo(this.config.leftOffset, 0)
					.lineTo(this.config.leftOffset, this.config.height)
					.moveTo(0, this.config.height - this.config.bottomOffset)
					.lineTo(this.config.width, this.config.height - this.config.bottomOffset);

			// 20px per sector
			var sectorHeight = 20;
			var sectors = (this.config.height - this.config.bottomOffset) / sectorHeight;
			var valuePerSector = Math.round(maxValue / sectors);

			for (var sectorVal = 0, i = 0; sectorVal <= maxValue; sectorVal += valuePerSector) {
				var y = this.config.height - (i * sectorHeight + this.config.bottomOffset);
				this.chartLines
						.lineStyle(1, 0x000000)
						.moveTo( this.config.leftOffset - 5, y )
						.lineTo( this.config.leftOffset + 5, y );

				if (sectorVal > 0) {
					var text = this.chartLines.parent.addChild(new PIXI.Text( this.config.valueFormat(sectorVal), {
						font: '10px ' + this.config.font,
						fill: 0x000000
					}));
					text.anchor.set(0, 0.5);
					text.position.set(0, y);
				}

				i++;
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

			var nextSectorX = this.config.leftOffset;
			var maxValue = null,
				minValue = null;

			for (var key in this.data) {
				if ( !this.data.hasOwnProperty(key) ) continue;
				if ( maxValue === null || this.data[key] > maxValue ) {
					maxValue = this.data[key];
				}
				if ( minValue === null || this.data[key] < minValue ) {
					minValue = this.data[key];
				}
			}

			for (var key in this.data) {
				if ( !this.data.hasOwnProperty(key) ) continue;
				if (!this.colors[key]) {
					this.setColor(key, this.getColor());
				}
				nextSectorX = this._drawSector(nextSectorX, maxValue, key);
			}

			this._drawLines(minValue, maxValue);
		}
	});

	// expose BarChart into the charts object
	charts.Bar = BarChart;
})( PIXICharts, PIXI );