
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
  const xScale = d3.scaleBand()
    .domain(datasetProcessed.map(d => d.fullYear))
    .range([margin.left,width - margin.right])

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset.map(element => element[1]))])
    .range([height - margin.bottom,margin.top])

  // axis 

  const yearAlreadyAdded = []

  const xAxis = d3.axisBottom(xScale)
                  .tickFormat((d,i) => {
                    const year = getYear(d);
                    if(parseInt(year) %5 !== 0){
                      return null
                    }

                    if(yearAlreadyAdded.includes(year)){
                      return null
                    }

                    yearAlreadyAdded.push(year)
                    return year
                  })
                  .tickSizeOuter(0)
  
  const yAxis = d3.axisLeft(yScale)
  .tickSizeOuter(0)

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

  // y axis text label
  svg.append('text')
    .text('Gross Domestic Product')
    .attr('x',-(margin.left + height)/2)
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
      tooltip.style('left', `${margin.left + xScale(d.year)}`)
      tooltip.style('opacity',1);
      tooltip.attr('data-date',d.fullYear)
     })
     .on('mouseout', () => {
      tooltip.style('opacity',0)
    })
     .attr('class','bar')
     .attr('data-date',d => d.fullYear)
     .attr('data-gdp',d => d.gdp)
     .attr("x",d => xScale(d.fullYear))
     .attr("y", d => yScale(d.gdp))
     .attr("width", xScale.bandwidth())
     .attr("height", d => height - yScale(d.gdp) - margin.bottom)
}

init()