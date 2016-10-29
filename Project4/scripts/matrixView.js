var hMargins = 60;
var vMargins = 20;
var minPixelWidth = 12;
var cellPadding = 1;

$(function(){
    EHRdataset(function(data){
        var width = innerWidth - 2 * hMargins,
            height = innerHeight - 2 * hMargins;

        var yScale = d3.scale.ordinal();
        var color = d3.scale.category20();

        yScale.domain(data.patients.map(function(d){
           return d.patientID;
        }));

        var vItemCount = yScale.domain().length;
        var hItemCount = data.maxLeft + data.maxRight;

        var hPixelPerItem = Math.max(width / hItemCount, minPixelWidth),
            vPixelPerItem = Math.max(height / vItemCount, minPixelWidth);

        if (hPixelPerItem > vPixelPerItem) {
            hPixelPerItem = vPixelPerItem;
        } else if (hPixelPerItem < vPixelPerItem) {
            vPixelPerItem = hPixelPerItem;
        }

        height = vPixelPerItem * vItemCount;
        width =  hPixelPerItem * hItemCount;

        var rowHeight = vPixelPerItem - (cellPadding * 2);

        yScale.rangeBands([0, height], (cellPadding * 2)/vPixelPerItem);

        var xScale = d3.scale.linear();

        xScale.domain([-data.maxLeft, data.maxRight])
            .range([0, width]);

        var yAxis = d3.svg.axis()
            .orient("left")
            .ticks(vItemCount)
            .tickFormat(function(d){
                return d;
            })
            .scale(yScale);

        var xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(xScale);

        var svg = d3.select("#vizCanvas")
            .attr("width", width + 2 * hMargins)
            .attr("height", height + 2 * vMargins)
            .append("g")
                .attr("class", "drawingCanvas")
                .attr("transform", "translate(" + hMargins + "," + vMargins + ")");

        var patients = svg.selectAll(".row")
            .data(data.patients, function(d){
                return d.patientID;
            });

        patients.enter()
            .append("g")
            .attr("class", function(d) {
                return "row " + d.patientID;
            });

        patients.attr("transform", function(d){
                return "translate(0," + yScale(d.patientID) + ")";
            });

        var encountersDays = patients.selectAll(".encounter.day")
            .data(function(d){
                return d.encounters;
            });

        encountersDays.enter()
            .append("g")
            .attr("class", function(d, i){
                return "encounter day " + i
            });

        encountersDays.attr("transform", function(d, i){
                return "translate(" + xScale(i - d3.select(this.parentElement).datum().leftItems) + ",0)";
            });

        var encounterCell = encountersDays.selectAll(".encounter.cell")
            .data(function(d){
                return d.encounters;
            });

        encounterCell.enter()
            .append("rect")
            .attr("class", function(d){
                return "encounter cell " + d;
            });

        encounterCell
            .attr("x", function(d){
                var encounters = d3.select(this.parentElement).datum().encounters;
                var width = (hPixelPerItem - cellPadding * 2)/encounters.length;
                return cellPadding + width * encounters.indexOf(d);
            })
            .attr("y", 0)
            .attr("height", rowHeight)
            .attr("width", function(d){
                return (hPixelPerItem - cellPadding * 2)/d3.select(this.parentElement).datum().encounters.length;
            })
            .attr("fill", function(d){
                return color(d);
            });

        encounterCell.exit().remove();

        encountersDays.exit().remove();

        patients.exit().remove();

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);


        // svg.append("line")
        //     .attr("class", "TBImark")
        //     .attr("x1", xScale(0))
        //     .attr("x2", xScale(0))
        //     .attr("y1", 0)
        //     .attr("y2", height)
        //     .attr("stroke", "#000")
        //     .attr("stroke-width", "1");
    });
})