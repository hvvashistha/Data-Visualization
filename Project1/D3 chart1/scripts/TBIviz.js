jQuery(function() {
    $("body").width(window.innerWidth).height(window.innerHeight);

    var dataset = [];
    var ageGroup = {};
    var margin = 20;
    var height = $("#viz").height() - (2 * margin);
    var width = $("#viz").width() - (2 * margin);
    var genders = ["male", "female"];
    var ageBuckets = ["0 to 4", "5 to 14", "15 to 17", "18 to 24", "25 to 34", "35 to 44", "45 to 64", "65 and over"];
    var diagnosis = ["Stress", "PTSD", "Speech", "Anxiety", "Depression", "Headache", "Sleep", "Audiology", "Vision", "Neurologic", "Alzheimer", "Cognitive", "PCS", "Endocrine", "Skull_inj", "NON_skull_inj"];
    var maxY = 0;

    //Aggregation based on Age group, gender and trauma type
    TBIset().forEach(function(d) {
        if (d.Gender.indexOf("Defaulted") === -1) {
            ageGroup[d.Age_Group] = ageGroup[d.Age_Group] || { ageGroup: d.Age_Group, subGroup: { male: {}, female: {} } };
            var gDiag = ageGroup[d.Age_Group].subGroup[d.Gender.toLowerCase()];
            diagnosis.forEach(function(attr) {
                gDiag[attr] = (gDiag[attr] || 0) + d[attr];
                maxY = Math.max(maxY, gDiag[attr]);
            });
        }
    });

    ageBuckets.forEach(function(d) {
        dataset.push(ageGroup[d]);
    });

    var x = d3.scale.ordinal()
        .domain(ageBuckets)
        .rangeBands([0, width], 0.1);

    var y = d3.scale.ordinal()
        .domain(genders)
        .rangeRoundBands([height, 0]);

    //D3 based generic color scale. Can select a better color scheme.
    var cScale = d3.scale.category20();

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .orient("left");

    var xAxis = d3.svg.axis()
        .scale(x)
        .outerTickSize(1)
        .orient("bottom");

    var svg = d3.select("#vizCanvas");

    var svgCanvas = svg.append("g")
        .attr("class", "svgCanvas")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    //Y axis lanes for better differentiation
    genders.forEach(function(d) {
        svgCanvas.append("rect")
            .attr("class", "genderlane")
            .attr("x", 0)
            .attr("y", y(d))
            .attr("width", width)
            .attr("height", y.rangeBand());
    });

    //Render Axes
    svgCanvas.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svgCanvas.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("text")
        .attr("dy", "-.5em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle");

    //Segregate into age buckets
    var ageGroupsObjects = svgCanvas.selectAll(".age-group")
        .data(dataset, function(d) {
            return d.ageGroup;
        })
        .enter()
        .append("g")
        .attr("class", function(d) {
            return "age-groups " + d.ageGroup.replace(/\ /g, "");
        })
        .attr("transform", function(d) {
            return "translate(" + x(d.ageGroup) + ", 0)";
        });

    //Segregate by gender type
    var genderObjects = ageGroupsObjects.selectAll(".genders")
        .data(function(d) {
            var group = [];
            for (var gender in d.subGroup) {
                group.push({
                    gender: gender,
                    diagnosis: d.subGroup[gender]
                });
            };
            return group;
        }, function(d) {
            return d.gender;
        })
        .enter()
        .append("g")
        .attr("class", function(d) {
            return "genders " + d.gender;
        })
        .attr("transform", function(d) {
            return "translate(0," + y(d.gender) + ")";
        });

    //Segregate by Trauma type
    var diagnosisEnter = genderObjects.selectAll(".diagnosis")
        .data(function(d) {
            var groupDiag = [];
            var diagInfo = {
                count: 0,
                maxOccurence: 0,
                minOccurence: 0
            };

            for (var diag in d.diagnosis) {
                if (d.diagnosis[diag] > 0) {
                    groupDiag.push({
                        name: diag,
                        numberOfOccurenece: d.diagnosis[diag],
                        diagInfo: diagInfo
                    });

                    diagInfo.count++;
                    diagInfo.maxOccurence = Math.max(diagInfo.maxOccurence, d.diagnosis[diag]);
                    diagInfo.minOccurence = Math.min(diagInfo.minOccurence, d.diagnosis[diag]);
                }
            };

            //Custom scale for each occurrence due to variations in data
            var yDiagScale = d3.scale.linear()
                .domain([0, diagInfo.count])
                .range([y.rangeBand() - (Math.max(Math.sqrt(diagInfo.minOccurence), 9) * 2),
                    Math.max(Math.sqrt(diagInfo.maxOccurence), 2) * 2
                ]);

            diagInfo["diagScale"] = yDiagScale;

            groupDiag.sort(function(a, b) {
                var diff = a.numberOfOccurenece - b.numberOfOccurenece;
                return diff == 0 ? 0 : diff / Math.abs(diff);
            });

            return groupDiag;
        }, function(d) {
            return d.name;
        })
        .enter()
        .sort(function(a, b) {
            var diff = a.numberOfOccurenece - b.numberOfOccurenece;
            return diff == 0 ? 0 : diff / Math.abs(diff);
        });

    //Diagnosis Bubbles
    diagnosisEnter
        .append("circle")
        .attr("class", function(d) {
            return "diagnosis bubble " + d.name;
        })
        .attr("cx", function(d) {
            return x.rangeBand() / 2;
        })
        .attr("cy", function(d, i) {
            return d.diagInfo.diagScale(i);
        })
        .attr("r", function(d) {
            return Math.max(Math.sqrt(d.numberOfOccurenece), 2) * 2;
        })
        .attr("fill", function(d) {
            return cScale(d.name)
        });

    //Diagnosis bubble outlines
    diagnosisEnter
        .append("circle")
        .attr("class", function(d) {
            return "diagnosis bubbleOutliner " + d.name;
        })
        .attr("cx", function(d) {
            return x.rangeBand() / 2;
        })
        .attr("cy", function(d, i) {
            return d.diagInfo.diagScale(i);
        })
        .attr("r", function(d) {
            return (Math.max(Math.sqrt(d.numberOfOccurenece), 2) * 2) + 2;
        })
        .attr("fill", function(d) {
            return "transparent"
        })
        .attr("stroke", function(d) {
            return d3.hsl(cScale(d.name)).darker(1);
        });

    //Generate Legend
    var legendsContainer = d3.select(".legends");

    var legend = d3.select(".legends").selectAll(".legend")
        .data(function() {
            return diagnosis.sort().map(function(d) {
                return { name: d };
            });
        })
        .enter()
        .append("div")
        .attr("class", function(d) {
            return "legend diagnosis " + d.name;
        });

    legend.append("div")
        .attr("class", "tile")
        .style("background", function(d) {
            return cScale(d.name);
        })
        .text(" ");

    legend.append("div")
        .attr("class", "text")
        .text(function(d) {
            return d.name;
        });

    //Create interaction
    d3.selectAll("." + diagnosis.join(",."))
        .on("mouseover", function(d) {
            $(".diagnosis").addClass("hover");
            $("." + d.name).addClass("active");
        })
        .on("mouseout", function(d) {
            $(".diagnosis").removeClass("hover");
            $("." + d.name).removeClass("active");
        });
});
