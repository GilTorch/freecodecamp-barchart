
const getData = async () =>{
  const response = await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  const jsonData = await response.json();
  return jsonData;
}

const init = async () => {
  const data = await getData();
  const dataset = data.data 
  const margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  }

  const width = window.innerWidth*0.7
  const height = window.innerHeight*0.7

  // create svg
  const svg = d3.select('.bar-chart')
    .append('svg')
    .attr("width",width - margin.right - margin.left)
    .attr("height",height - margin.top - margin.bottom)
    .attr("viewBox", [0,0, width, height])


  // scale
  const xScale = d3.scaleBand()
    .domain(dataset.map(element => element[0].split("-")[0]))
    .range([margin.left,width - margin.right])



  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset.map(element => element[1]))])
    .range([height - margin.bottom,margin.top])

  // axis 

  const xAxis = d3.axisBottom(xScale)
                  .tickValues(xScale.domain().filter(e=>parseInt(e)%5==0))
            
  const yAxis = d3.axisLeft(yScale)

  // place x axis 
  svg.append("g")
     .attr("transform",`translate(0,${height - margin.bottom})`)
     .attr("id","x-axis")
     .call(xAxis)

  // place y axis 
  svg.append("g")
    .attr("transform",`translate(${margin.left},0)`)
    .attr("id","y-axis")
    .call(yAxis)

  svg.append('text')
    .text('Gross Domestic Product')
    .attr('x',margin.left + 90)
    .attr('y', -margin.left - 20)
    .attr('class','axis-left-label')
    .attr('transform', 'rotate(90)')


  svg.selectAll("rect")
     .data(dataset)
     .enter()
     .append("rect")
     .attr("x",d => { 
         const year = d[0].split("-")[0];
         return xScale(year);
     })
     .attr("y", d => yScale(d[1]))
     .attr("width", xScale.bandwidth())
     .attr("height", d => height - yScale(d[1]) - margin.bottom)

}

init()