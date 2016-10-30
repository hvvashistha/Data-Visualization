var hMargins = [40, 40],
    vMargins = [5, 20];
var minHPixelWidth = 4,
    minVPixelWidth = 15;
var cellPadding = 0.5;

// Ref:
// Implementation by Pimp Trizkit : shadeColor2()
// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shade(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

$(function(){
    EHRdataset(function(data){
        var width = innerWidth - $("#viz").offset().left - hMargins[0] - hMargins[1],
            height = innerHeight - $("#viz").offset().top - $(".dash").height() - vMargins[0] - vMargins[1] - 40;

        var yScale = d3.scale.ordinal();

        function color(encounters, step){
            return shade(color.colors(encounters), color.scale(step || 0));
        }

        color.colors = d3.scale.category20();
        color.scale = d3.scale.linear().domain([-data.maxPreTBIDays, data.maxPostTBIDays]).range([-0.85, 0.6]);

        //Remove unwanted colors
        color.colors.range().splice(color.colors.range().indexOf("#7f7f7f"), 1);
        color.colors.range().splice(color.colors.range().indexOf("#c7c7c7"), 1);
        color.colors.range().splice(color.colors.range().indexOf("#c5b0d5"), 1);

        yScale.domain(data.patients.map(function(d){
           return d.patientID;
        }));

        var vItemCount = yScale.domain().length;
        var hItemCount = data.maxLeft + data.maxRight;

        var hPixelPerItem = Math.max(width / hItemCount, minHPixelWidth),
            vPixelPerItem = Math.max(height / vItemCount, minVPixelWidth);

        height = vPixelPerItem * vItemCount;
        width =  hPixelPerItem * hItemCount;

        var rowHeight = vPixelPerItem - (cellPadding * 2);

        yScale.rangeBands([0, height], (cellPadding * 2)/vPixelPerItem);

        var xScale = d3.scale.linear();

        xScale.domain([0, data.maxLeft + data.maxRight])
            .range([0, width]);

        var yAxis = d3.svg.axis()
            .orient("left")
            .ticks(vItemCount)
            .tickFormat(function(d){
                return d;
            })
            .tickSize(0)
            .scale(yScale);

        var xAxis = d3.svg.axis()
            .orient("bottom")
            .ticks(0)
            .scale(xScale);

        var svg = d3.select("#vizCanvas")
            .attr("width", width + hMargins.reduce(function(a,b) {return a + b;}))
            .attr("height", height + vMargins.reduce(function(a,b) {return a + b;}))
            .append("g")
                .attr("class", "drawingCanvas")
                .attr("transform", "translate(" + hMargins[0] + "," + vMargins[0] + ")");

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
                var normalizedData = [];
                var leftAdjust = data.maxLeft - d3.select(this.parentNode).datum().leftItems,
                    rightAdjust = xScale.domain()[1] - (d.encounters.length + leftAdjust);
                for (var i = 0; i < leftAdjust; i++){
                    normalizedData.push({ daysFromTBI: 'la'+i,
                                encounters: [false]
                            });
                }
                normalizedData = normalizedData.concat(d.encounters);
                for (var i = 0; i < rightAdjust; i++){
                    normalizedData.push({ daysFromTBI: 'ra'+i,
                                encounters: [false]
                            });
                }
                return normalizedData;
            }, function(d, i){
                return d.daysFromTBI;
            });

        encountersDays.enter()
            .append("g")
            .attr("class", function(d, i){
                return "encounter day " + i
            });

        encountersDays.attr("transform", function(d, i){
                return "translate(" + xScale(i) + ",0)";
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
            .attr("y", function(d){
                var encounters = d3.select(this.parentElement).datum().encounters;
                var subCellHeight = (vPixelPerItem - cellPadding * 2)/encounters.length;
                return cellPadding + subCellHeight * encounters.indexOf(d);
            })
            .attr("x", 0)
            .attr("width", (hPixelPerItem - cellPadding * 2))
            .attr("height", function(d){
                return (vPixelPerItem - cellPadding * 2)/d3.select(this.parentElement).datum().encounters.length;
            })
            .attr("fill", function(d){
                return d === false ? "#FFF" : color(d, d3.select(this.parentNode).datum().daysFromTBI);
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

        var encounterLegends = d3.select(".legends.primary .legendsBody")
            .selectAll(".legendCell")
            .data(encounters);

        encounterLegends.enter()
            .append("div")
            .attr("class", function(d){
                return "legendCell " + d;
            })
            .each(function(d){
                var parent = d3.select(this);

                parent.append("div")
                    .attr("class", "colorTile cell " + d)
                    .style("background", color(d));

                parent.append("div")
                    .attr("class", "legendText")
                    .text(d);
            });

        encounterLegends.on("mouseover", function(d){
            $(".cell").removeClass("active").addClass("cellHover");
            $(".cell." + d).addClass("active");
        });

        encounterLegends.on("mouseout", function(d){
            $(".cell").removeClass("active cellHover");
        });

        patients.on("mouseover", function(d){
            $(".row").addClass("rowHover").removeClass("active");
            $(this).addClass("active");
        });

        patients.on("mouseout", function(d){
            $(".row").removeClass("active rowHover");
        });

    });
})