function addAxesAndLegend (svg, xAxis, yAxis, margin, chartWidth, chartHeight) {
  var legendWidth  = 220,
      legendHeight = 60;

  var axes = svg.append('g')
    .attr('clip-path', 'url(#axes-clip)');

  axes.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + chartHeight + ')')
    .call(xAxis);

  axes.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Est. Price ($)');

  var legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + (chartWidth - legendWidth) + ', 0)');
  
    legend.append('rect')
	.attr('class', 'legend-bg')
	.attr('width',  legendWidth)
	.style('fill', 'white')
	.attr('height', legendHeight);

    legend.append('rect')
	.attr('class', 'outer')
	.style('fill', 'A6E1F5')
	.attr('width',  75)
	.attr('height', 10)
	.attr('x', 10)
	.attr('y', 10);

    legend.append('text')
	.attr('x', 115)
	.attr('y', 20)
	.text('Trip duration');

    legend.append('rect')
	.attr('class', 'inner')
	.style('fill', '178DB4')
	.attr('width',  75)
	.attr('height', 10)
	.attr('x', 10)
	.attr('y', 25);
    
    legend.append('text')
	.attr('x', 115)
	.attr('y', 35)
	.text('Est. Wait Time');

}

function drawPaths (svg, x, yhigh, chartHeight, estHigh, estLow, date) {
    var upperInnerArea = d3.svg.area()
	.interpolate('basis')
	.x (function (d, i) { return x(date[i]) })
	.y0(function (d) { return chartHeight; })
	.y1(function (d) { return yhigh(d); });
    
    var lowerInnerArea = d3.svg.area()
	.interpolate('basis')
    	.x (function (d, i) { return x(date[i]) })
	.y0(function (d) { return chartHeight; })
	.y1(function (d) { return yhigh(d); });
    var upperline = d3.svg.line()
	.interpolate("basis")
	.x (function (d, i) { return x(date[i]) })
	.y (function (d) { return yhigh(d); })
    
    svg.append('path')
	.style('fill', 'A6E1F5')
	.style('stroke-width', 0)
	.attr('class', 'area')
	.attr('d', upperInnerArea(estHigh))
	
    svg.append('path')
	.style('fill', '178DB4')
	.style('stroke-width', 0)
	.attr('class', 'area')
	.attr('d', lowerInnerArea(estLow))

    svg.append("path")      
        .attr("class", "line")
        .attr("d", upperline(estHigh))
	.style('stroke', '389DBE')
	.style('stroke-width', 1);
	
    svg.append("path")      
        .attr("class", "line")
        .attr("d", upperline(estLow))
	.style('stroke', '057195')
	.style('stroke-width', 1);
}

function startTransitions (svg, chartWidth, chartHeight, rectClip, x) {
    rectClip.transition()
	.attr('width', chartWidth);
}

function makeChart (estHigh, estLow, date) {
  var svgWidth = 960,
      svgHeight = 500,
      margin = { top: 20, right: 20, bottom: 40, left: 40 },
      chartWidth  = svgWidth  - margin.left - margin.right,
      chartHeight = svgHeight - margin.top  - margin.bottom;

    var x = d3.time.scale().range([0, chartWidth])
        .domain(d3.extent(date, function (d) { return d; }));
    var yhigh = d3.scale.linear().domain([d3.min(estLow), d3.max(estHigh)]).range([chartHeight, 0]);
    
    var xAxis = d3.svg.axis().scale(x).orient('bottom')
    yAxis = d3.svg.axis().scale(yhigh).orient('left')
                
    var svg = d3.select('#vis').append('svg')
	.attr('width',  svgWidth)
	.attr('height', svgHeight)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    addAxesAndLegend(svg, xAxis, yAxis, margin, chartWidth, chartHeight);
    drawPaths(svg, x, yhigh, chartHeight, estHigh, estLow, date);
}
function init(){
    var movingWindowAvg = function (arr, step) {// Window size = 2 * step + 1
	return arr.map(function (_, idx) { 
            var wnd = arr.slice(idx - step, idx + step + 1); 
            var result = d3.sum(wnd) / wnd.length;
	    
            // Check for isNaN, the javascript way
            result = (result == result) ? result : _;
	    
            return result; 
	});
    };
    var estHigh = [];
    var estLow = [];
    var date = [];
    var parseDate = d3.time.format("%Y-%m-%d %H:%M").parse;
    d3.json('data/uber.json', function (error, rawData) {
	if (error) {
	    console.error(error);
	    return;
	}
	//estHigh is duration+waiting time
	rawData.forEach(function(d) {
	    date.push(parseDate(d.timestamp));
	    estHigh.push((+d.duration+d.estimated_waiting_time) / 60.0);
	    estLow.push(+d.estimated_waiting_time / 60.0);
	});
	//smooth data using moving average
	estHigh = movingWindowAvg(estHigh, 7);
	estLow = movingWindowAvg(estLow, 7);
	makeChart(estHigh, estLow, date);
	
    });
    
}
