// Dataset: http://pathrings.umbc.edu/tumor/tumor.csv

var margins = 50;
var boxPlotSize = 180;
var boxPlotGutter = 60;
var min = 0.001147767;
var max = 70;

var color = d3.scale.ordinal()
            .domain(therapyTypes)
            .range(["#a6cee3", "#1f78b4", "#cab2d6", "#6a3d9a", "#b2df8a", "#33a02c", "#fdbf6f", "#ff7f00", "#fb9a99",
                        "#e31a1c", "#ffff99", "#b15928"]);

var controls = {
    whiskerCollapsed: false
}

jQuery(function() {
    $("body").height(innerHeight);
    tumorData(function(therapy){
        var proteinN  = therapy.length;
        var width = (boxPlotSize * proteinN) + boxPlotGutter * (proteinN - 1);
        var height = Math.ceil($("#viz").height()) + 50 - (2 * margins);
        var enabledTherapyTypes = $.extend([], therapyTypes);

        var svg = d3.select("#vizCanvas")
        .attr("width", width + margins)
        .attr("height", height + margins)
        .append("g")
            .attr("class", "canvas")
            .attr("transform", "translate(" + margins + "," + margins + ")");

        var relationScaleX = d3.scale.ordinal()
            .domain( therapy.map(function(d){ return d.treatment; }) )
            .rangeBands([0, width]);

        var scaleY = d3.scale.log().domain([0.001, 70]).range([height, 0]);
        scaleY["Tumor mass (mg)"] = d3.scale.log().domain([7, 1703]).range([height, 0]);

        var boxPlotScaleX = d3.scale.ordinal()
            .domain(enabledTherapyTypes)
            .rangeBands([0, boxPlotSize], 0.5, 0.5);

        var logTickValues = [];
        var decrements = (+$("body").css("font-size").replace(/[a-z]+/,"") * 1.5);
        decrements = Math.floor(height/decrements);
        decrements = height/decrements;

        for(var i=height; i>=0; i -= decrements){
            logTickValues.push(scaleY.invert(i))
        }

        var yAxis = d3.svg.axis()
            .scale(scaleY)
            .orient("left")
            .ticks(5)
            .tickValues(logTickValues)
            .tickFormat(function(d){
                return (d >= 1 ? d3.format(".0f") : d3.format(".3f"))(d);
            });

        var yAxisContainer = d3.select("#vizCanvas").append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margins + "," + margins + ")");

        yAxisContainer.append("rect")
            .attr("x", -margins)
            .attr("y", -margins)
            .attr("width", margins)
            .attr("height", height + 2 * margins)
            .attr("fill", "white")
            .attr("stroke-width", 0);

        yAxisContainer
            .call(yAxis);

        var xAxis = d3.svg.axis()
            .scale(relationScaleX)
            .orient("top")
            .tickSize(0);

        var xAxisContainer = d3.select("#vizCanvas").append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + (margins/2) + "," + margins + ")");

        function renderXAxis(){
            xAxisContainer.call(xAxis);
            xAxisContainer.selectAll("text")
                .attr("dy", "-1em")
                .attr("x", "-0.5em");
        }

        function renderBoxPlots(svg) {
            var boxPlots = svg.selectAll(".boxPlots")
                .data(therapy, function(d) { return d.treatment; });

            boxPlots.enter().append("g")
                .attr("class", "boxPlots")
                .attr("transform", function(d) {
                    return "translate(" + relationScaleX(d.treatment) + ", 0)";
                })
                .append("rect")
                    .attr("x", 0)
                    .attr("y", scaleY.range()[1])
                    .attr("width", boxPlotSize)
                    .attr("height", scaleY.range()[0] - scaleY.range()[1])
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1)
                    .attr("fill", "transparent");

            boxPlots
                .attr("transform", function(d) {
                    return "translate(" + relationScaleX(d.treatment) + ", 0)";
                });

            boxPlots.selectAll("rect")
                .attr("width", boxPlotSize);

            boxPlots.exit().remove();

            return boxPlots;
        }

        function renderWhiskers(boxPlots) {
            var whiskers = boxPlots.selectAll(".boxWhiskers");

            if(boxPlotSize < 20){
                whiskers.remove();
            } else {
                whiskers = whiskers.data(function(d){
                    return d.data.filter(function(th){
                        return enabledTherapyTypes.indexOf(th.therapy + " " + th.organ) !== -1;
                    });
                }, function(d){
                    return d.therapy + d.organ;
                });

                whiskers.enter()
                    .append("g")
                    .attr("class", function(d){
                        return "boxWhiskers " + d.therapy + " " + d.organ;
                    })
                    .each(function(d) {
                        var whisker = d3.select(this);

                        whisker.append("line")
                            .attr("class", "whiskerExtremes");

                        whisker.append("rect")
                            .attr("class", "whiskerBody");

                        whisker.append("line")
                            .attr("class", "whiskerMedian");
                    });

                whiskers
                    .each(function(d) {
                        var whisker = d3.select(this);
                        var whiskerWidth = Math.min(boxPlotScaleX.rangeBand(), 20);
                        var sorted = $.extend([], d.data).sort(function(a, b){
                            return a - b;
                        });

                        whisker.select(".whiskerExtremes")
                            .attr("x1", boxPlotScaleX(d.therapy + " " + d.organ) + whiskerWidth/2)
                            .attr("y1", scaleY(d3.quantile(sorted, 0.95)))
                            .attr("x2", boxPlotScaleX(d.therapy + " " + d.organ) + whiskerWidth/2)
                            .attr("y2", scaleY(d3.quantile(sorted, 0.05)));

                        whisker.select(".whiskerBody")
                            .attr("x", boxPlotScaleX(d.therapy + " " + d.organ))
                            .attr("y", scaleY(d3.quantile(sorted, 0.75)))
                            .attr("height", scaleY(d3.quantile(sorted, 0.25)) - scaleY(d3.quantile(sorted, 0.75)) )
                            .attr("width", whiskerWidth)
                            .attr("fill", function(d){ return color(d.therapy + " " + d.organ); });

                        whisker.select(".whiskerMedian")
                            .attr("x1", boxPlotScaleX(d.therapy + " " + d.organ))
                            .attr("y1", scaleY(d3.quantile(sorted, 0.5)))
                            .attr("x2", boxPlotScaleX(d.therapy + " " + d.organ) + whiskerWidth)
                            .attr("y2", scaleY(d3.quantile(sorted, 0.5)));
                    });

                whiskers.exit().remove();
            }

            return whiskers;
        }

        function renderLinks(svg){
            var x1,y1,x2,y2;
            var links = svg.selectAll(".links")
                .data(parsedCSV.filter(function(th){
                    return enabledTherapyTypes.indexOf(th.Therapy + " " + th.Organ) !== -1;
                }), function(d){
                    return d["Mouse number"] + d.Therapy + d.Organ;
                });

            links.enter()
                .append("path")
                .attr("class", function(d){
                    return "links " + d.Therapy + " " + d.Organ + " " + d["Mouse number"];
                })
                .attr("stroke", function(d){
                    return color(d.Therapy + " " + d.Organ);
                });

            links
                .attr("d", function(d){
                    x = relationScaleX(treatments[0]) + boxPlotSize;
                    y = scaleY(d[treatments[0]]);

                    var pd = "M"+x+" "+y+" ";

                    for(var i=1; i < treatments.length; i++) {
                        x = relationScaleX(treatments[i]);
                        y = scaleY(d[treatments[i]]);
                        pd += "L"+x+" "+y+" m"+boxPlotSize+" "+0+" ";
                    }
                    return pd;
                });

            links.exit()
                .remove();
        }

        function setLegend(therapyTypes, enabledTherapyTypes){
            var legendRow = d3.select(".legends.primary").selectAll(".legendRow")
                .data(therapyTypes);

            legendRow
                .enter()
                .append("div")
                .each(function(d){
                    var row = d3.select(this);

                    row.append("div")
                        .attr("class", "tile")
                        .style("background-color", function(d) {
                            return color(d);
                        });

                    row.append("div")
                        .attr("class", "legendName")
                        .text(function(d){
                            return d;
                        });
                })

            legendRow
                .attr("class", function(d){
                    return "legendRow " + (enabledTherapyTypes.indexOf(d) === -1 ? "inactive" : "active")
                });

            legendRow
                .exit().remove();

            var secondaryRows = d3.select(".legends.secondary").selectAll(".legendRow");
            secondaryRows.remove();
            secondaryRows = d3.select(".legends.secondary").selectAll(".legendRow")
                .data(parsedCSV.filter(function(th){
                    return enabledTherapyTypes.indexOf(th.Therapy + " " + th.Organ) !== -1;
                }), function(d){
                    return d["Mouse number"] + d.Therapy + d.Organ;
                });

            secondaryRows
                .enter()
                .append("div")
                .attr("class", "legendRow")
                .each(function(d){
                    var row = d3.select(this);

                    row.append("div")
                        .attr("class", "tile")
                        .style("background-color", function(d) {
                            return color(d.Therapy + " " + d.Organ);
                        });

                    row.append("div")
                        .attr("class", "legendName")
                        .text(function(d){
                            return d.Organ + ", Therapy: " + d.Therapy + ", Tumor mass (mg): " + d["Tumor mass (mg)"] ;
                        });
                });

            var legendsContainer = $(".dash");
            legendsContainer.height(innerHeight - legendsContainer.offset().top);

            return legendRow;
        }

        function legendInteraction(){
            var allLegends = d3.selectAll(".legendRow");

            allLegends.on("mouseover", null).on("mouseover", function(d){
                var eClass, gClass;
                if(typeof(d) === "string"){
                    gClass = d;
                } else {
                    eClass = gClass = d.Therapy + " " + d.Organ;
                    eClass = eClass + " " + d["Mouse number"];
                }
                if (enabledTherapyTypes.indexOf(gClass) !== -1){
                    gClass = "." + gClass.replace(/ +/g, '.');
                    if (eClass != null){
                        eClass = "." + eClass.replace(/ +/g, '.');
                    }
                    $(this).addClass("focus");
                    $(".links").css("opacity", "0.05");
                    $(".boxWhiskers").css("opacity", "0.05");
                    $(".links" + (eClass || gClass)).addClass("focus");
                    $(".boxWhiskers" + gClass).addClass("focus");
                }
            });

            allLegends.on("mouseout", null).on("mouseout", function(d){
                var eClass, gClass;
                if(typeof(d) === "string"){
                    gClass = "." + d.replace(/ +/g, '.');
                } else {
                    eClass = gClass = "." + d.Therapy + "." + d.Organ.replace(/ +/g, '.');
                    eClass = eClass + "." + d["Mouse number"];
                }

                $(this).removeClass("focus");
                $(".links").css("opacity", "0.8");
                $(".boxWhiskers").css("opacity", "0.8");
                $(".links" + (eClass || gClass)).removeClass("focus");
                $(".boxWhiskers" + gClass).removeClass("focus");
            });
        }

        renderXAxis();
        var boxPlots = renderBoxPlots(svg);
        renderWhiskers(boxPlots);
        renderLinks(svg);
        var legends = setLegend(therapyTypes, enabledTherapyTypes);

        //Make interactive
        legends.on("click", function(d){
            if(enabledTherapyTypes.indexOf(d) !== -1) {
                enabledTherapyTypes.splice(enabledTherapyTypes.indexOf(d), 1);
            } else {
                enabledTherapyTypes.push(d);
                enabledTherapyTypes.sort();
            }

            boxPlotScaleX.domain(enabledTherapyTypes);
            renderWhiskers(boxPlots);
            renderLinks(svg);
            setLegend(therapyTypes, enabledTherapyTypes);
            legendInteraction();
        });

        legendInteraction();

        d3.select("#viz").on("scroll", function(d){
            yAxisContainer.attr("transform", "translate(" + (this.scrollLeft + 50) + "," + margins + ")")
        });

        d3.select("#collapseWhiskers").on("click", function(d){
            if(boxPlotSize === 1){
                boxPlotSize = 180;
                $(this).text("Collapse Box-Whiskers");
            } else {
                boxPlotSize = 1;
                $(this).text("Show Box-Whiskers");
            }

            width = (boxPlotSize * proteinN) + boxPlotGutter * (proteinN - 1);
            d3.select("#vizCanvas").attr("width", width + margins);
            relationScaleX.rangeBands([0, width]);
            renderXAxis();
            boxPlots = renderBoxPlots(svg);
            renderWhiskers(boxPlots);
            renderLinks(svg);
        });
    });
});