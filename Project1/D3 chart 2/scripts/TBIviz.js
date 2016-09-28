jQuery(function() {
    $("body").width(window.innerWidth).height(window.innerHeight);

    var dataset = [];
    var patient = {};
    var marginH = 40;
    var marginV = 60;
    var height = $("#viz").height() - marginV;
    var width = $("#viz").width() - marginH;
    var diagnosis = ["Anxiety", "Depression"];
    var maxX = 0;

    //Aggregation based on Age group, gender and trauma type
    TBIset().forEach(function(d) {
            patient[d.PatientID] = patient[d.PatientID] || { patientID: d.PatientID, disorder: {}, number: 0 };

            diagnosis.forEach(function(attr) {
                patient[d.PatientID].disorder[attr] = (patient[d.PatientID].disorder[attr] || 0) + d[attr];
                maxX = Math.max(maxX, patient[d.PatientID].disorder[attr]);
            });
    });

    maxX = maxX + 10 - (maxX % 10);
    var pNumber = 0;
    for (var id in patient) {
        pNumber++;
        patient[id].number = pNumber;
        dataset.push(patient[id]);
    }

    var y = d3.scale.linear()
        .domain([0, maxX])
        .range([height, 0]);

    var x = d3.scale.ordinal()
        .domain(Object.keys(patient))
        .rangeBands([0, width], 0.5);

    var ix = d3.scale.ordinal()
        .domain(diagnosis)
        .rangeBands([0, x.rangeBand()]);

    //D3 based generic color scale. Can select a better color scheme.
    var cScale = d3.scale.category10();

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(1)
        .orient("left");

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(1)
        .orient("bottom")
        .tickFormat(function(d){
            var n = patient[d].number;
            return "P " + (n<10?'0':'') + (n<100?'0':'') + n;
        });

    var svg = d3.select("#vizCanvas");

    var svgCanvas = svg.append("g")
        .attr("class", "svgCanvas")
        .attr("transform", "translate(" + marginH + ",5)");

    //Render Axes
    var xAxisG = svgCanvas.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    xAxisG.selectAll("text")
        .attr("transform", "rotate(-90)")
        .attr("x", "-5")
        .attr("dy", "0")
        .style("text-anchor", "end");

    xAxisG.append("text")
        .attr("x", x.rangeExtent()[1]/2)
        .attr("y", 50)
        .style("text-anchor", "middle")
        .text("Patient #");

    svgCanvas.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
            .attr("x", -y.range()[0]/2)
            .attr("y", 0)
            .attr("dy", "-2em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text("Number of Encounters");

    var patientGroup = svgCanvas.selectAll(".patient-group")
        .data(dataset, function(d) { return d.patientID; })
        .enter()
        .append("g")
            .attr("class", "patient-group")
            .attr("transform", function(d) { return "translate(" + x(d.patientID) + ",0)"; });

    patientGroup.selectAll(".disorder")
        .data(function(d) {
            var disorderDataset = [];
            for (var type in d.disorder) {
                disorderDataset.push({
                    type: type,
                    encounters: d.disorder[type]
                });
            }
            return disorderDataset;
        }, function (d) {
            return d.type;
        }).enter()
        .append("rect")
            .attr("class", "disorder diagnosis")
            .attr("x", function(d) {
                return ix(d.type);
            })
            .attr("width", function(d) {
                return ix.rangeBand();
            })
            .attr("height", function(d) {
                return y(0) - y(d.encounters);
            })
            .attr("fill", function(d) {
                return cScale(d.type);
            })
            .attr("y", function(d) {
                return y(d.encounters);
            });

    //Generate Legend
    var legendsContainer = d3.select(".legends");

    var legend = d3.select(".legends").selectAll(".legend")
        .data(function() {
            return diagnosis.map(function(d) {
                return { type: d };
            });
        })
        .enter()
        .append("div")
        .attr("class", function(d) {
            return "legend diagnosis " + d.type;
        });

    legend.append("div")
        .attr("class", "tile")
        .style("background", function(d) {
            return cScale(d.type);
        })
        .text(" ");

    legend.append("div")
        .attr("class", "text")
        .text(function(d) {
            return d.type;
        });
});
