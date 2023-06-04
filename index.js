
const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"

d3.json(URL).then((res) => {
  const dataset = res.data 
  const margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
  }

  const viewBoxWidth = window.innerWidth*0.7
  const viewBoxHeight = window.innerHeight*0.7

  const svgWidth = viewBoxWidth - margin.right - margin.left ;
  const svgHeight = viewBoxHeight - margin.top - margin.bottom;


let globalMousePos = { x: undefined, y: undefined };

window.addEventListener('mousemove', (event) => {
  globalMousePos = { x: event.clientX, y: event.clientY };
});


  // create svg
  const svg = d3.select('.bar-chart')
    .append('svg')
    .attr("width",svgWidth)
    .attr("height",svgHeight)
    .attr("viewBox", [0,0, viewBoxWidth, viewBoxHeight])

  // retain only the year with the greatest value

  const getYear = data => data.split("-")[0]

  let currentQuarter = 0;
  let currentYear = dataset.map(data => getYear(data[0]))[0]

  const datasetProcessed = dataset.map((data) => {
    // each time the same year is encountered it's a new quarter
    // append the quarter after the year with label Qnumber
    const year = getYear(data[0])
    if(year === currentYear){
      currentQuarter++
    }else{
      currentQuarter = 1;
    } 
    currentYear = year;
    return {
      year: `${year} Q${currentQuarter}`,
      fullYear: data[0],
      gdp: data[1]
    }
  })

  // scale
  const dataExtentDate = d3.extent(dataset, d => d[0])
  const xScale = d3.scaleTime()
    .domain([new Date(dataExtentDate[0]), new Date(dataExtentDate[1])])
    .range([margin.left,viewBoxWidth - margin.right])


  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset.map(element => element[1]))])
    .range([viewBoxHeight - margin.bottom,margin.top])

  // axis 
  const xAxis = d3.axisBottom(xScale)
                  .tickSizeOuter(0)
  
  const yAxis = d3.axisLeft(yScale)
  .tickSizeOuter(0)

  // place x axis 
  svg.append("g")
     .attr("transform",`translate(0,${viewBoxHeight - margin.bottom})`)
     .attr("id","x-axis")
     .call(xAxis)

  // place y axis 
  svg.append("g")
    .attr("transform",`translate(${margin.left},0)`)
    .attr("id","y-axis")
    .call(yAxis)

  // y axis text label
  svg.append('text')
    .text('Gross Domestic Product')
    .attr('x',-(margin.left + viewBoxHeight)/2)
    .attr('y', -(-margin.left - 30))
    .attr('class','axis-left-label')
    .attr('transform', 'rotate(-90)')

  const tooltip = d3.select("#tooltip")
  const tooltipTitle = d3.select("#tooltip-title")
  const tooltipDescription = d3.select("#tooltip-description")

  svg.selectAll(".bar")
     .data(datasetProcessed)
     .join("rect")
     .on('mouseover', (_,d) => {
      tooltipTitle.text(`Year: ${d.year}`)
      tooltipDescription.text(`GDP: ${d.gdp} Billions`)
      console.log(xScale(new Date(d.fullYear)))
      tooltip.style('opacity',1);
      tooltip.style('top', viewBoxHeight - margin.bottom + 'px')
      tooltip.style('left', globalMousePos.x+'px')
      tooltip.attr('data-date',d.fullYear)
     })
     .on('mouseout', () => {
      tooltip.style('opacity',0)
    })
     .attr('class','bar')
     .attr('data-date',d => d.fullYear)
     .attr('data-gdp',d => d.gdp)
     .attr("x",d =>xScale(new Date(d.fullYear)))
     .attr("y", d => yScale(d.gdp))
     .attr("width", svgWidth / dataset.length)
     .attr("height", d => viewBoxHeight - yScale(d.gdp) - margin.bottom)
})

