
var width = 500
var height = 300
var margin = { top: 20, right: 20, bottom: 150, left: 75 };

var totalDatum;
var chart = d3.select(".bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr('pointer-events', "none");



var bubbleChart= d3.select(".bubble")
    .attr("width", width*1.3 + margin.left + margin.right)
    .attr("height", height*1.2 + margin.top + margin.bottom)
    .append("g")
    .attr("id", "bubbleVis")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr('pointer-events', "none")
    .call(d3.zoom().on("zoom", function(event) {
        bubbleChart.attr("transform", event.transform);
    }));

let zoom = d3.zoom()
	.scaleExtent([1, 10])
	.on('zoom', handleZoom);

function handleZoom(e) {
    bubbleChart
        .attr("transform", e.transform);
}


var zoomResetBTN = document.getElementById("zoomResetBTN");

zoomResetBTN.addEventListener("click", d => { 
    bubbleChart.call(zoom.transform, d3.zoomIdentity.translate(margin.left,margin.top).scale(1));
})

var xBubbleChart = d3.scaleLinear()
    .range([0, width*1.4]);

var yBubbleChart = d3.scaleLinear()
    .range([height*1.4, 0]);

var xBubbleAxis = d3.axisBottom(xBubbleChart);
var yBubbleAxis = d3.axisLeft(yBubbleChart);    

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "d3-tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("padding", "15px")
    .style("background", "rgba(0,0,0,0.6)")
    .style("border-radius", "5px")
    .style("color", "#fff")
    .text("a simple tooltip");

var treeType = "Channel"
var category;

var stackplot = d3.select(".stackplot")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height*0.8 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr('pointer-events', "none");

var xChart = d3.scaleBand()
    .range([0, width*.75]);

var yChart = d3.scaleLinear()
    .range([height*.75, 0]);

var yTimeChart = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom(xChart);
var yAxis = d3.axisLeft(yChart);
var yTimeAxis = d3.axisLeft(yTimeChart);
var pieWidth = 300
pieHeight = 150 
pieMargin = 20
var radius = 50
var pieSVG = d3.select('.pie').attr("width", pieWidth).attr("height", pieHeight)
   .append("g")
   .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")");

chart.append("g")
    .attr("class", "y axis")
    .attr("font-family", "Calibri")
    .call(yAxis)

chart.append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("font-family", "Calibri")
    .attr("transform", function (d) {
        return "rotate(-65)";
    });

chart
    .append("text")
    .attr("class", "yAxisText")
    .attr("transform", "translate(-55," + (height + margin.bottom) / 2 + ") rotate(-90)")
    .attr("font-family", "Calibri")
    .text("Number of Trending Videos");

chart
    .append("text")
    .attr("transform", "translate(" + (width*.75 / 2) + "," + (height*.75 + margin.bottom - 10) + ")")
    .attr("font-family", "Calibri")
    .text("Category");
var xTimeScale;
var used_categories = []
var categoryList = {}

function reset(){
    category=undefined;
    //console.log("calling reset")
    barChart("count")
    pieChart("")
    treeMapChart("")
    stack()
    bubble()
}
d3.csv("modified_USA_data.csv").then(function (dataset) {
    totalDatum = dataset
    let parseTime = d3.timeParse("%y.%d.%m")
    totalDatum.forEach(d => {
        d.trending_date = parseTime(d.trending_date)
    })

    for (var val in dataset) {
        val = dataset[val]

        if (!(used_categories.includes(val["categoryId"]))) {
            used_categories.push(val["categoryId"])
            categoryList[val["categoryId"]] = { "bait": 0, "notbait": 0, "total": 0, "name": val["categoryId"] }
        }
        if (val["doesTitleContainClickbait OR isAllCaps"] === '1') {
            categoryList[val["categoryId"]]["bait"] += 1;
        }
        else {
            categoryList[val["categoryId"]]["notbait"] += 1;

        }
        categoryList[val["categoryId"]]["total"] += 1
    }

    xTimeScale = d3.scaleTime()
        .domain(d3.extent(totalDatum.map(d => d.trending_date)))
        .range([0, width])

    var xTimeAxis = d3.axisBottom(xTimeScale)


    stackplot.append("g")
        .attr("class", "yaxis")
        .attr("font-family", "Calibri")
        .call(yTimeAxis)

    stackplot.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xTimeAxis.tickFormat(d3.timeFormat("%Y-%m-%d")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-family", "Calibri")
        .attr("transform", function (d) {
            return "rotate(-65)";
        });

    stackplot
        .append("text")
        .attr("class", "yAxisText")
        .attr("transform", "translate(-55," + (height + margin.bottom) / 2 + ") rotate(-90)")
        .attr("font-family", "Calibri")
        .text("Number of Trending Videos");

    stackplot
        .append("text")
        .attr("transform", "translate(" + (width / 2) + "," + (height + margin.bottom - 60) + ")")
        .attr("font-family", "Calibri")
        .text("Date");
    barChart("count")
    pieChart("")
    treeMapChart("")
    stack()
    bubble()
})


function bubble(user){
    var tempData=totalDatum;
    /*if (user !== undefined && user !== "") {
        tempData = tempData.filter(d => d.channelTitle === user)
    }
    if(category!==undefined){
        tempData=tempData.filter(d=>d.categoryId===category)
    }*/
    var used_ids=[]
    function removeDuplicates(id){
        if(used_ids.includes(id.title+id.channelTitle)){
            return false;
        }
        used_ids.push(id.title+id.channelTitle)
        return true;
    }
    tempData=tempData.filter(removeDuplicates)

    const categories = ["1", "0"]
    const colors = ["#c13a3a", "#66af46"]

    const colorScale = d3.scaleOrdinal()
        .domain(categories)
        .range(colors)

    
    bubbleChart.selectAll("*")
        .remove()
        .exit()
    xBubbleChart.domain([0, d3.max(tempData, d=>+d.view_count)+5000000])
    yBubbleChart.domain([0, d3.max(tempData, d=>+d.likes)])
    bubbleChart.append("g")
    .attr("transform", "translate(0," + height*1.4 + ")")
    .call(d3.axisBottom(xBubbleChart))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function (d) {
        return "rotate(-65)";
    });

    bubbleChart.append("g")
    .call(d3.axisLeft(yBubbleChart));

    var sizeScale=d3.scaleLinear().domain([0, d3.max(tempData, d=>+d.comment_count)]).range([1,10])

    bubbleChart.append('g')
        .selectAll('dot')
        .data(tempData)
        .enter()
        .append("circle")
            .attr("cx", d=>xBubbleChart(d.view_count))
            .attr("cy", d=>yBubbleChart(d.likes))
            .attr("r", d=>sizeScale(d.comment_count))
            .style("fill", d=>colorScale(d["doesTitleContainClickbait OR isAllCaps"]))
            .on("mouseover", function (d, i) {
                tooltip.html(`Title: ${i.title}`).style("visibility", "visible");
                d3.select(this)
                    .attr("opacity", "0.5");
            })
            .on("mousemove", function () {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                tooltip.html(``).style("visibility", "hidden");
                d3.select(this).attr("opacity", "1.0");
            })
        .filter(function (d) {
            return d.categoryId != category
        })
        .each(function() {
            var local = d3.local();
            local.set(this, d3.select(this).style("fill"));
        })
        .style("opacity", 0.15);

    bubbleChart
        .append("text")
        .attr("class", "yAxisText")
        .attr("transform", "translate(-65," + (height + margin.bottom) / 2 + ") rotate(-90)")
        .attr("font-family", "Calibri")
        .text("Number of Likes");
    
    bubbleChart
        .append("text")
        .attr("transform", "translate(" + (width / 2) + "," + (height*1.3 + margin.bottom - 40) + ")")
        .attr("font-family", "Calibri")
        .text("Number of Views");


}

function stack(user) {
    var stackData = []
    var tempData = totalDatum
    //var stackDat=d3.nest().key(d=>d.trending_date).entries(data)
    if (category !== undefined) {
        tempData = tempData.filter(d => d.categoryId === category)
        //var mappedData=Array.from(new Set(tempData.map(d=>d.trending_date.toString())))

    }
    if (user !== undefined && user !== "") {
        tempData = tempData.filter(d => d.channelTitle === user)
    }
    //console.log("Length for stack")
    //console.log(tempData.length)
    var sumStat = d3.group(tempData, d => d.trending_date)
    const categories = ["Clickbait", "Not Clickbait"]
    const colors = ["#c13a3a", "#66af46"]

    const colorScale = d3.scaleOrdinal()
        .domain(categories)
        .range(colors)

    yTimeChart.domain([0, d3.max(sumStat, function (d) { return d[1].length; }) * 1.2])


    var stackedData = d3.stack().keys(categories).value(function (d, key) {
        if (key === "Clickbait") {
            return d[1].filter(newD => newD["doesTitleContainClickbait OR isAllCaps"] === "1").length
        }
        else {
            return d[1].filter(newD => newD["doesTitleContainClickbait OR isAllCaps"] === "0").length

        }
    })(sumStat)

    stackplot.selectAll(".path")
        .remove()
        .exit()

    stackplot.selectAll("plot")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "path")
        .style("fill", d => colorScale(d.key))
        .attr("d", d3.area()
            .x(function (d, i) { return xTimeScale(d.data[0]) })
            .y0(function (d) { return yTimeChart(d[0]) })
            .y1(function (d) { return yTimeChart(d[1]) })
        )
    stackplot.select('.yaxis')
        .call(yTimeAxis)
}

function updateTree(newType) {
    //console.log("updating type")
    treeType = newType;
    treeMapChart(category)
}
var treemap = d3.treemap()
    .size([700, 500])
    .padding(1)
    


var treeWidth = 790;
var treeHeight = 500;
var treeSVG = d3.select(".treemap")
    .attr("width", treeWidth + margin.left + margin.right)
    .attr("height", treeHeight + margin.top + margin.bottom)
    
function handleTreeZoom(e) {
    d3.select('.treemap g')
          .attr('transform', e.transform);
      }
let treeZoom=d3.zoom().on('zoom', handleTreeZoom)
d3.select('.treemap')
    .call(treeZoom);


var treeZoomReset = document.getElementById("treeZoomReset");

treeZoomReset.addEventListener("click", d => { 
    console.log("Button clicked")
    d3.select(".treemap g").call(treeZoom.transform, d3.zoomIdentity);
    d3.select(".treemap").call(treeZoom.transform, d3.zoomIdentity);

})
function pieChart(user) {
    //console.log("called pieCart with user " + user)
    var tempData = totalDatum;
    if (category !== undefined) {
        tempData = tempData.filter(d => d.categoryId === category)
    }
    if (treeType === "Channel" && user !== "") {
        tempData = tempData.filter(d => d.channelTitle === user)

    }

    var pieData = [{ "key": "Clickbait", "value": tempData.filter(d => d["doesTitleContainClickbait OR isAllCaps"] === "1").length }, { "key": "Not Clickbait", "value": tempData.filter(d => d["doesTitleContainClickbait OR isAllCaps"] === '0').length }]
    var pie = d3.pie()
        .value(d => d.value)
    const categories = ["Clickbait", "Not Clickbait"]
    const colors = ["#c13a3a", "#66af46"]

    const colorScale = d3.scaleOrdinal()
        .domain(categories)
        .range(colors)
    var pieFinal = pie(pieData)

    pieSVG.selectAll("*")
        .remove()
        .exit()

    //console.log("radius")
    //console.log(radius)

    pieSVG.selectAll(".pieElement")
        .data(pieFinal)
        .enter()
        .append('path')

        .attr("class", "pieElement")
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill', function (d) { return (colorScale(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1)


    //console.log(category)
    if (user === "" && category === undefined) {
        pieSVG.append("text")
            .attr("x", 0)
            .attr("y", -55)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("color", "black")
            .text("All Videos");
    }
    else if (user === "" && category !== undefined) {
        pieSVG.append("text")
            .attr("x", 0)
            .attr("y", -55)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("color", "black")
            .text(`${category}`);
    }
    else {
        pieSVG.append("text")
            .attr("x", -55)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("color", "black")
            .text(`Channel ${user}`);
    }
}
function treeMapChart(category) {
    var treeDataFilter = [...totalDatum];
    
    if (category !== "") {

        treeDataFilter.forEach(function(d){
            if(d.categoryId===category){
                d["highlighted"]=1.0;
            }
            else{
                d["highlighted"]=0.5;
            }
        })

        //treeDataFilter = treeDataFilter.filter(dataPoint => dataPoint.categoryId === category)

    }

    var treeData = { "title": "All videos for category", "children": [{ "title": "Contains Clickbait", "children": [] }, { "title": "Does not Contain Clickbait", "children": [] }] }
    if (treeType === "Video") {
        treeData["children"][0]["children"] = [...(treeDataFilter.filter(dataPoint => dataPoint["doesTitleContainClickbait OR isAllCaps"] === "0"))]
        treeData["children"][1]["children"] = [...(treeDataFilter.filter(dataPoint => dataPoint["doesTitleContainClickbait OR isAllCaps"] === "1"))]

    }
    else {
        var channelValues = []
        var usedChannels = []
        var categoryList=Array.from([...new Set(treeDataFilter.map(d=>d.categoryId))])
        console.log(categoryList)
        treeDataFilter.forEach(function (d) {
            d.likes = parseInt(d.likes)
            var indexVal = usedChannels.indexOf(d.channelTitle)
            if (indexVal !== -1) {
                //console.log("already exists")
                channelValues[indexVal].channelLikes += d.likes
                if (d["doesTitleContainClickbait OR isAllCaps"] === "1") {
                    channelValues[indexVal]["channelHasClickbait"] = "1"
                }
                if(d.highlighted===1.0){
                    channelValues[indexVal]["highlightedChannel"]=1.0
                }
            }
            else {
                //d.title = d.channelTitle
                d["channelLikes"]=d.likes
                d["channelHasClickbait"]=d["doesTitleContainClickbait OR isAllCaps"]
                d["highlightedChannel"]=d["highlighted"]
                channelValues.push(d)
                usedChannels.push(d.channelTitle)
            }
        })
        treeData["children"][0]["children"] = (channelValues.filter(dataPoint => dataPoint["channelHasClickbait"] === "0"))
        treeData["children"][1]["children"] = (channelValues.filter(dataPoint => dataPoint["channelHasClickbait"] === "1"))

    }
    console.log(treeData);

    const categories = treeData.children.map(d => d["doesTitleContainClickbait OR isAllCaps"])
    const colors = ["#c13a3a", "#66af46"]

    const colorScale = d3.scaleOrdinal()
        .domain(categories)
        .range(colors)
    const hierarchy = d3.hierarchy(treeData).sum(d => parseInt(d.channelLikes)).sort(function(a,b){return categoryList.indexOf(b.data.categoryId) - categoryList.indexOf(a.data.categoryId)})
    const root = treemap(hierarchy)
    //console.log(root)

    //console.log(root.leaves())
    
    
    treeSVG.selectAll("*")
        .remove()
        .exit()
    treeSVG.append("g")

    treeSVG.select("g").selectAll("treeElement")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("class", "treeElement")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale(d.data["channelHasClickbait"]))
        .attr("opacity", function(d){return d.data.highlightedChannel})
        .on("mouseover", function (d, i) {
            tooltip.html(`Title: ${i.data.channelTitle}`).style("visibility", "visible");
            //d3.select(this)
                //.attr("opacity", "0.5");
        })
        .on("mousemove", function () {
            tooltip
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.html(``).style("visibility", "hidden");
            //d3.select(this).attr("opacity", "1.0");
        })
        .on("click", function (d, i) {
            pieChart(i.data.channelTitle)
            stack(i.data.channelTitle)
            bubble(i.data.channelTitle)
        })

    


}
function barChart(typeChart) {

    var data = []

    for (var val in categoryList) {
        if (typeChart === "percent") {
            var temp = Object.assign({}, categoryList[val])
            temp["bait"] = temp["bait"] / temp["total"] * 100
            temp["notbait"] = temp["notbait"] / temp["total"] * 100
            temp["total"] = 100
            data.push(temp)
        }
        else {
            data.push(categoryList[val])

        }
    }
    data.sort((tagOne, tagTwo) => {
        return compareCounts(tagOne, tagTwo)
    })
    //console.log(data)

    xChart.domain(data.map(function (d) { return d.name; }));
    yChart.domain([0, d3.max(data, function (d) { return +d.total; })]);

    var barWidth = width*.75 / data.length;

    var bars = chart.selectAll(".bar")
        .remove()
        .exit()
        .data(data)
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d, i) { return i * barWidth + 1 })
        .attr("y", function (d) { return yChart(d.bait); })
        .attr("height", function (d) { return height*.75 - yChart(d.bait); })
        .attr("width", barWidth - 1)
        .attr("fill", "#c13a3a")
        .on('mouseover', function (event, d) {

            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.5');
        })
        .on('mouseout', function (event, d) {

            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1.0');
        })
        .on('click', function (event, d) {
            //console.log(d)
            category = d.name;
            treeMapChart(d.name)
            pieChart("")
            stack()
        })

    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d, i) { return i * barWidth + 1 })
        .attr("y", function (d) { return yChart(d.bait + d.notbait); })
        .attr("height", function (d) { return height*.75 - yChart(d.notbait); })
        .attr("width", barWidth - 1)
        .attr("fill", "#66af46")
        .on('mouseover', function (event, d) {

            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.5');
        })
        .on('mouseout', function (event, d) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1.0');
        })
        .on('click', function (event, d) {
            //console.log(d)
            category = d.name;
            treeMapChart(d.name)
            pieChart("")
            stack()
            bubble()
        })
    chart.select('.y')
        .call(yAxis)
    chart.select('.xAxis')
        .attr("transform", "translate(0," + height*.75 + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function (d) {
            return "rotate(-65)";
        });

    if (typeChart === "percent") {
        chart.select(".yAxisText").text("Percent of Trending Videos")
    }
    else {
        chart.select(".yAxisText").text("Number of Trending Videos")

    }
}
var VideoChannelForm = document.getElementById('Video-Channel-Form');
//console.log(VideoChannelForm.getBoundingClientRect());

var treemapVis = document.getElementById('treemap')
var rect = treemapVis.getBoundingClientRect();
//VideoChannelForm.style.left = rect.left + "px";
//VideoChannelForm.style.top = rect.top + "px";

//console.log(rect);
//console.log(VideoChannelForm.getBoundingClientRect());


//console.log(used_categories)
//console.log(categoryList)
function compareCounts(val1, val2) {
    if (val1.total < val2.total) {
        return 1;
    }
    if (val1.total > val2.total) {
        return -1;
    }
    return 0;
}

