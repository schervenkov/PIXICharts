PIXICharts
===================

***WARNING: The package is in development and the documentation is still incomplete.***

Installation:

    bower install pixicharts --save

then include the script:
		
	<script src="bower_components/pixicharts/pixicharts.min.js"></script>

Every PIXICharts class extends PIXI.Container, so it can be added as a child of another PIXI.Container.

## PieChart ##

	new PIXICharts.Pie( [options] )

where options is object with following keys:
	**width** the width of the chart
	**height** the height of the chart
	...