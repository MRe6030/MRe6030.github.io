
var width=700
var height=500
var margin = {top: 20, right: 20, bottom: 150, left: 75};

var chart = d3.select(".bar-chart")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var xChart = d3.scaleBand()
				.range([0, width]);
				
var yChart = d3.scaleLinear()
				.range([height, 0]);


var xAxis = d3.axisBottom(xChart);
var yAxis = d3.axisLeft(yChart);

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

var used_categories=[]
var categoryList={}
d3.csv("modified_USA_data.csv").then(function(dataset){
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
    console.log(categoryList)
    var data=[]
    for(var val in categoryList){
      data.push(categoryList[val])
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
        .attr("fill", "rgb(179,205,227)")
    bars.enter()
      .append("rect")
          .attr("class", "bar")
          .attr("x", function(d, i){ return i * barWidth + 1 })
          .attr("y", function(d){ return yChart( d.bait+d.notbait); })
          .attr("height", function(d){ return height - yChart(d.notbait); })
          .attr("width", barWidth - 1)
          .attr("fill", "rgb(120,120,120)")

  
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
    
})

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
        .attr("fill", "rgb(179,205,227)")
    bars.enter()
    .append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i){ return i * barWidth + 1 })
        .attr("y", function(d){ return yChart( d.bait+d.notbait); })
        .attr("height", function(d){ return height - yChart(d.notbait); })
        .attr("width", barWidth - 1)
        .attr("fill", "rgb(120,120,120)")


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

  