
var width=700
var height=500
var margin = {top: 20, right: 20, bottom: 150, left: 75};

var totalDatum;
var chart = d3.select(".bar-chart")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
.attr('pointer-events', "none");

const tooltip = d3.select("body")
.append("div")
.attr("class","d3-tooltip")
.style("position", "absolute")
.style("z-index", "10")
.style("visibility", "hidden")
.style("padding", "15px")
.style("background", "rgba(0,0,0,0.6)")
.style("border-radius", "5px")
.style("color", "#fff")
.text("a simple tooltip");

var treeType="Video"
var category;

var stackplot = d3.select(".stackplot")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
.attr('pointer-events', "none");

var xChart = d3.scaleBand()
				.range([0, width]);
				
var yChart = d3.scaleLinear()
				.range([height, 0]);

var yTimeChart = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom(xChart);
var yAxis = d3.axisLeft(yChart);
var yTimeAxis=d3.axisLeft(yTimeChart);
var pieWidth=450
    pieHeight=450
    pieMargin=40
var radius=200
var pieSVG=d3.select('.pie').attr("width", pieWidth).attr("height", pieHeight)
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
    .attr("transform", function(d){
      return "rotate(-65)";
    });

chart
	.append("text")
    .attr("class", "yAxisText")
	.attr("transform", "translate(-55," +  (height+margin.bottom)/2 + ") rotate(-90)")
    .attr("font-family", "Calibri")
    .text("Number of Trending Videos");
		
chart
	.append("text")
	.attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom -10) + ")")
    .attr("font-family", "Calibri")
    .text("Category");
var xTimeScale;
var used_categories=[]
var categoryList={}
d3.csv("modified_USA_data.csv").then(function(dataset){
    totalDatum=dataset
    let parseTime=d3.timeParse("%y.%d.%m")
    totalDatum.forEach(d=>{
        d.trending_date=parseTime(d.trending_date)
    })

    for(var val in dataset){
        val=dataset[val]

        if(!(used_categories.includes(val["categoryId"]))){
            used_categories.push(val["categoryId"])
            categoryList[val["categoryId"]]={"bait": 0, "notbait": 0, "total": 0, "name": val["categoryId"]}
        }
        if(val["doesTitleContainClickbait OR isAllCaps"]==='1'){
            categoryList[val["categoryId"]]["bait"]+=1;
        }
        else{
            categoryList[val["categoryId"]]["notbait"]+=1;

        }
        categoryList[val["categoryId"]]["total"]+=1
    }

    xTimeScale=d3.scaleTime()
    .domain(d3.extent(totalDatum.map(d=>d.trending_date)))
    .range([0, width])

    var xTimeAxis=d3.axisBottom(xTimeScale)


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
        .attr("transform", function(d){
        return "rotate(-65)";
        });

    stackplot
        .append("text")
        .attr("class", "yAxisText")
        .attr("transform", "translate(-55," +  (height+margin.bottom)/2 + ") rotate(-90)")
        .attr("font-family", "Calibri")
        .text("Number of Trending Videos");
            
    stackplot
        .append("text")
        .attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom -10) + ")")
        .attr("font-family", "Calibri")
        .text("Date");
    barChart("count")
    pieChart("")
    treeMapChart("")
    stack()
})

function stack(user){
    var stackData=[]
    var tempData=totalDatum
    //var stackDat=d3.nest().key(d=>d.trending_date).entries(data)
    if(category!==undefined){
        tempData=tempData.filter(d=>d.categoryId===category)
        //var mappedData=Array.from(new Set(tempData.map(d=>d.trending_date.toString())))

    }
    if(user!==undefined && user!==""){
        tempData=tempData.filter(d=>d.channelTitle===user)
    }
    console.log("Length for stack")
    console.log(tempData.length)
    var sumStat=d3.group(tempData, d=>d.trending_date)  
    const categories=["Clickbait", "Not Clickbait"]
    const colors=["#FFB66D","#FFE76D"]
    
    const colorScale=d3.scaleOrdinal()
    .domain(categories)
    .range(colors)

    yTimeChart.domain([0, d3.max(sumStat, function(d) { return d[1].length; })*1.2])
    
    
    var stackedData=d3.stack().keys(categories).value(function(d,key){
        if(key==="Clickbait"){
            return d[1].filter(newD=>newD["doesTitleContainClickbait OR isAllCaps"]==="1").length
        }
        else{
            return d[1].filter(newD=>newD["doesTitleContainClickbait OR isAllCaps"]==="0").length

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
    .style("fill", d=>colorScale(d.key))
    .attr("d", d3.area()
        .x(function(d, i){return xTimeScale(d.data[0])})
        .y0(function(d){return yTimeChart(d[0])})
        .y1(function(d){return yTimeChart(d[1])})
    )
    stackplot.select('.yaxis')
    .call(yTimeAxis)
}

function updateTree(newType){
    console.log("updating type")
    treeType=newType;
    treeMapChart(category)
}
var treemap=d3.treemap()
.size([700, 500])
.padding(1)

var treeSVG=d3.select(".treemap")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)

function pieChart(user){
    console.log("called pieCart with user " + user)
    var tempData=totalDatum;
    if(category!==undefined){
        tempData=tempData.filter(d=>d.categoryId===category)
    }
    if(treeType==="Channel" && user!==""){
        tempData=tempData.filter(d=>d.channelTitle===user)

    }

    var pieData=[{"key": "Clickbait", "value": tempData.filter(d=>d["doesTitleContainClickbait OR isAllCaps"]==="1").length}, {"key": "Not Clickbait", "value": tempData.filter(d=>d["doesTitleContainClickbait OR isAllCaps"]==='0').length}]
    var pie=d3.pie()
    .value(d=>d.value)
    const categories=["Clickbait", "Not Clickbait"]
    const colors=["#FFB66D","#FFE76D"]

    const colorScale=d3.scaleOrdinal()
    .domain(categories)
    .range(colors)
    var pieFinal=pie(pieData)

    pieSVG.selectAll("*")
    .remove()
    .exit()

    console.log("radius")
    console.log(radius)

    pieSVG.selectAll(".pieElement")
    .data(pieFinal)
    .enter()
    .append('path')

    .attr("class", "pieElement")
    .attr('d', d3.arc()
      .innerRadius(0)
      .outerRadius(radius)
    )
    .attr('fill', function(d){ return(colorScale(d.data.key)) })
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", 1)


    console.log(category)
    if(user==="" && category===undefined){
        pieSVG.append("text")
        .attr("x", 0)             
        .attr("y", -210)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("color", "black")
        .text("Proportion for All Videos");
    }
    else if(user==="" && category!==undefined){
        pieSVG.append("text")
        .attr("x", 0)             
        .attr("y", -210)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("color", "black")
        .text(`Proportion for ${category}`);
    }
    else{
        pieSVG.append("text")
        .attr("x", 0)             
        .attr("y", -210)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("color", "black")
        .text(`Proportion for Channel ${user}`);
    }
}
function treeMapChart(category){
    var treeDataFilter=totalDatum;
    if(category!==""){
        var treeDataFilter=totalDatum.filter(dataPoint=>dataPoint.categoryId===category)

    }

    var treeData={"title": "All videos for category", "children":[{"title": "Contains Clickbait", "children": []}, {"title": "Does not Contain Clickbait", "children": []}]}
    if(treeType==="Video"){
        treeData["children"][0]["children"]=(treeDataFilter.filter(dataPoint=>dataPoint["doesTitleContainClickbait OR isAllCaps"]==="0"))
        treeData["children"][1]["children"]=(treeDataFilter.filter(dataPoint=>dataPoint["doesTitleContainClickbait OR isAllCaps"]==="1"))
        
    }
    else{
        var channelValues=[]
        var usedChannels=[]
        treeDataFilter.forEach(function(d){
            d.likes=parseInt(d.likes)
            var indexVal=usedChannels.indexOf(d.channelTitle)
            if(indexVal!==-1){
                console.log("already exists")
                channelValues[indexVal].likes+=d.likes
                if(d["doesTitleContainClickbait OR isAllCaps"]==="1"){
                    channelValues[indexVal]["doesTitleContainClickbait OR isAllCaps"]="1"

                }
            }
            else{
                d.title=d.channelTitle
                channelValues.push(d)
                usedChannels.push(d.channelTitle)
            }
        })
        treeData["children"][0]["children"]=(channelValues.filter(dataPoint=>dataPoint["doesTitleContainClickbait OR isAllCaps"]==="0"))
        treeData["children"][1]["children"]=(channelValues.filter(dataPoint=>dataPoint["doesTitleContainClickbait OR isAllCaps"]==="1"))
        
    }
    console.log(treeData);

    const categories=treeData.children.map(d=>d["doesTitleContainClickbait OR isAllCaps"])
    const colors=["#FFB66D","#FFE76D"]

    const colorScale=d3.scaleOrdinal()
    .domain(categories)
    .range(colors)
    const hierarchy=d3.hierarchy(treeData).sum(d=>parseInt(d.likes)).sort((a,b)=>b.height-a.height||parseInt(b["likes"])-parseInt(a["likes"]))
    const root=treemap(hierarchy)
    console.log(root)
   
    console.log(root.leaves())
    treeSVG.selectAll("*")
    .remove()
    .exit()
    treeSVG.selectAll("treeElement")
       .data(root.leaves())
       .enter()
       .append("rect")
       .attr("class", "treeElement")
       .attr("x", d=>d.x0)   
       .attr("y", d=>d.y0)
       .attr("width",  d=>d.x1 - d.x0)
       .attr("height", d=>d.y1 - d.y0)
       .attr("fill", d=>colorScale(d.data["doesTitleContainClickbait OR isAllCaps"]))
       .on("mouseover", function(d, i) {
        tooltip.html(`Title: ${i.data.title}`).style("visibility", "visible");
        d3.select(this)
          .attr("opacity", "0.5");
      })
        .on("mousemove", function(){
            tooltip
            .style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function() {
            tooltip.html(``).style("visibility", "hidden");
            d3.select(this).attr("opacity", "1.0");
        })
        .on("click", function(d, i){
            pieChart(i.data.title)
            stack(i.data.title)
        })

    
}
function barChart(typeChart){

    var data=[]

    for(var val in categoryList){
        if(typeChart==="percent"){
            var temp=Object.assign({},categoryList[val])
            temp["bait"]=temp["bait"]/temp["total"]*100
            temp["notbait"]=temp["notbait"]/temp["total"]*100
            temp["total"]=100
            data.push(temp)
        }
        else{
            data.push(categoryList[val])

        }
    }
    data.sort((tagOne, tagTwo)=>{
    return compareCounts(tagOne, tagTwo)
    })
    console.log(data)

    xChart.domain(data.map(function(d){ return d.name; }) );
    yChart.domain( [0, d3.max(data, function(d){ return +d.total; })] );
    
    var barWidth = width / data.length;

    var bars = chart.selectAll(".bar")
                    .remove()
                    .exit()
                    .data(data)		
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i){ return i * barWidth + 1 })
        .attr("y", function(d){ return yChart( d.bait); })
        .attr("height", function(d){ return height - yChart(d.bait); })
        .attr("width", barWidth - 1)
        .attr("fill", "#FFB66D")
        .on('mouseover', function(event, d){

            d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '.5');
        })  
        .on('mouseout', function(event, d){

            d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '1.0');
        })  
        
    bars.enter()
    .append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i){ return i * barWidth + 1 })
        .attr("y", function(d){ return yChart( d.bait+d.notbait); })
        .attr("height", function(d){ return height - yChart(d.notbait); })
        .attr("width", barWidth - 1)
        .attr("fill", "#FFE76D")
        .on('mouseover', function(event, d){
           
            d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '.5');
        })  
        .on('mouseout', function(event, d){
            d3.select(this).transition()
                    .duration('50')
                    .attr('opacity', '1.0');
        })  
        .on('click', function(event, d){
            console.log(d)
            category=d.name;
            treeMapChart(d.name)
            pieChart("")
            stack()
        }) 
    chart.select('.y')
            .call(yAxis)
    chart.select('.xAxis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d){
                return "rotate(-65)";
            });

    if(typeChart==="percent"){
        chart.select(".yAxisText").text("Percent of Trending Videos")
    }
    else{
        chart.select(".yAxisText").text("Number of Trending Videos")

    }
}

console.log(used_categories)
console.log(categoryList)
function compareCounts(val1, val2){
    if(val1.total<val2.total){
      return 1;
    }
    if(val1.total>val2.total){
      return -1;
    }
    return 0;
  }

  