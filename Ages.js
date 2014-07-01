/*global d3:false */
var w = 800;
var h = 250;
var dataset;
var currentData = [];
var currentYear = "2009";
var graph = {
	paddingLeft: 30,
	paddingTop: 20,
	paddingRight: 10,
	paddingBottom: 20,
	colorGirls: "green",
	colorBoys: "blue"
};
var svg;
var xScale;
var hScale;
var yScale;
var yearScale;

var years = {
	"2009": {next: "2011", exists: 1},
	"2010": {next: "0000", exists: 0},
	"2011": {next: "2012", exists: 1},
	"2012": {next: "2013", exists: 1},
	"2013": {next: "2014", exists: 1},
	"2014": {next: "2009", exists: 1}
};

var yearsArray = ["2009", "2010", "2011", "2012", "2013", "2014"];
var yStops = [0, 10, 20, 30, 40, 50];

d3.csv("Ages.csv", function (error, data) {
	"use strict";
	data.forEach(function (d) {
		d.age = +d.age;
		d.girlsTotal = +d.girlsTotal;
		d.boysTotal = +d.boysTotal;
	});
	dataset = data;

	currentYear = "2009";
	setCurrentData();
	
	setScalesAndAxes();
	generateVis();
});

function setNextYear() {
	"use strict";
	currentYear = years[currentYear].next;
}

function updateYearLabels() {
	var data = svg.select(".yearLabel")
		.selectAll("tspan")
		.data(yearsArray);
	
	data.attr("class", function(d) {
			if (years[d].exists === 0) return "yearInactive";
			return (currentYear === d) ? "yearCurrent" : "yearNormal";
		})
		.attr("fill", function(d) { return (years[d].exists === 0) ? "silver" : "dimgrey"; })
		.transition()
		.attr("fill", function(d) {
			if (years[d].exists === 0) return "silver";
			return currentYear === d ? "black" : "dimgrey";		
		});
	
	data.on("mouseover", function() {
		svg.on("click", null);
	});
	data.on("mouseout", function() {
		svg.on("click", function() { svgClick(); });
	});
	
	data.on("click", function(d) {
		currentYear = d;
		setCurrentData();
		updateYearLabels();
	
		updateBars();		
	});
}

function setCurrentData() {
	"use strict";
	currentData = [];
	dataset.forEach(function (d) {
		if (d.feis === currentYear) { currentData.push(d); }
	});
}

function setScalesAndAxes() {
	"use strict";
	xScale = d3.scale.ordinal()
		.domain(d3.range(d3.min(dataset, function (d) { return d.age; }), d3.max(dataset, function (d) { return d.age; }) + 1))
		.rangeBands([graph.paddingLeft, w - graph.paddingRight], 0.1, 0.2);

	var hDomainRightOrig = d3.max(dataset, function (d) { return d.girlsTotal + d.boysTotal; });
	var hDomainRightNew = Math.ceil(hDomainRightOrig / 10.0) * 10 + 2;
	hScale = d3.scale.linear()
		.domain([0, hDomainRightNew])
		.range([0, h - graph.paddingBottom - graph.paddingTop]);

	yScale = d3.scale.linear()
		.domain([0, hDomainRightNew])
		.range([h - graph.paddingBottom + 0.5, graph.paddingTop]);
	
	yearScale = d3.scale.ordinal()
		.domain(yearsArray)
		.rangeBands([graph.paddingLeft + (w - graph.paddingLeft - graph.paddingRight) / 2, w - graph.paddingRight]);
}
		
function generateVis() {
	"use strict";
	svg = d3.select("body")
		.append("svg")
		.attr("width", w)
		.attr("height", h);

	// Фоновый прямоугольник.
	svg.append("rect").attr({
		height: h,
		width: w,
		fill: "rgb(220,220,240)"
	});
		
	// Промежуточные горизонтальные линии.
	svg.append("g")
		.attr("class", "intLine")
		.selectAll(".hLine")
		.data(yStops)
		.enter()
		.append("line")
		.attr("class", "hLine")
		.attr("x1", graph.paddingLeft)
		.attr("x2", w - graph.paddingRight)
		.attr("y1", function (d) { return yScale(d); })	
		.attr("y2", function (d) { return yScale(d); })		
		.attr("style", "stroke:rgb(200,200,200);stroke-width:1");

	// Ось X.
	svg.append("line").attr({
		x1: graph.paddingLeft,
		x2: w - graph.paddingRight,
		y1: h - graph.paddingBottom + 0.5,
		y2: h - graph.paddingBottom + 0.5,
		style: "stroke:rgb(100,100,100);stroke-width:1"
	});

	// Ось Y.
	svg.append("line").attr({
		x1: graph.paddingLeft,
		x2: graph.paddingLeft,
		y1: graph.paddingTop,
		y2: h - graph.paddingBottom + 0.5,
		style: "stroke:rgb(100,100,100);stroke-width:1"
	});
	
	// Подписи X.
	svg.append("g")
		.attr("class", "label")
		.selectAll(".ageLabel")
		.data(currentData, function (d) { return d.age; })
		.enter()
		.append("text")
		.attr("class", "ageLabel")
		.attr("dx", function (d) { return xScale(d.age) + xScale.rangeBand() / 2; })
		.attr("dy", h - graph.paddingBottom + 10)
		.text(function (d) { return (d.age === 3 || d.age % 5 === 0) ? d.age : " "; });

	// Подписи оси Y.
	svg.append("g")
		.attr("class", "label")
		.selectAll(".yLabel")
		.data(yStops)
		.enter()
		.append("text")
		.attr("class", "yLabel")
		.attr("dx", graph.paddingLeft - 5)
		.attr("dy", function (d) { return yScale(d); })
		.attr("style", "dominant-baseline: central;")
		.text(function (d) { return d; });
		
	// 2009 2010 2011 2012 ...
	svg.append("g")
		.attr("class", "yearLabel")
		.selectAll("text")
		.data(yearsArray)
		.enter()
		.append("text")
		.append("tspan")
		.attr("dx", function(d, i) { return w/2 + i * 60 + 50; })
		.attr("dy", (yScale(40) + yScale(50)) / 2)
		.attr("style", "dominant-baseline: central;")		
		.text(function (d) { return d; });

	updateYearLabels();
	
	// Столбики.
	var bars = svg.append("g");
	
	bars.selectAll(".barG")
		.data(currentData, function (d) { return d.age; })
		.enter()
		.append("rect")
		.attr("class", "barG")
		.attr("x", function (d) { return xScale(d.age); })
		.attr("y", function (d) { return h - graph.paddingBottom - hScale(d.girlsTotal + d.boysTotal); })
		.attr("height", function (d) { return hScale(d.girlsTotal); })
		.attr("width", xScale.rangeBand())
		.attr("fill", graph.colorGirls);

	bars.selectAll(".barB")
		.data(currentData, function (d) { return d.age; })
		.enter()
		.append("rect")
		.attr("class", "barB")
		.attr("x", function (d) { return xScale(d.age); })
		.attr("y", function (d) { return h - graph.paddingBottom - hScale(d.boysTotal); })
		.attr("height", function (d) { return hScale(d.boysTotal); })
		.attr("width", xScale.rangeBand())
		.attr("fill", graph.colorBoys);
		
	svg.on("click", function () { svgClick(); });
}

function svgClick() {
	setNextYear();
	setCurrentData();
	updateYearLabels();
	
	updateBars();
}

function updateBars() {
	"use strict";
	svg.selectAll(".barG")
		.data(currentData, function (d) { return d.age; })
		.transition()
		.attr("y", function (d) { return h - graph.paddingBottom - hScale(d.girlsTotal + d.boysTotal); })
		.attr("height", function (d) { return hScale(d.girlsTotal); });

	svg.selectAll(".barB")
		.data(currentData, function (d) { return d.age; })
		.transition()
		.attr("y", function (d) { return h - graph.paddingBottom - hScale(d.boysTotal); })
		.attr("height", function (d) { return hScale(d.boysTotal); });
}

