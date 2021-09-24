import * as d3 from 'd3'
let pymChild

const margin = { top: 60, left: 60, right: 20, bottom: 60 }
const height = 440 - margin.top - margin.bottom
const width = 640 - margin.left - margin.right

const svg = d3
  .select('#dosesPercapita')
  .attr('viewBox', [0, 0, width, height])
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

/// /parseTime////////////////////////////////
const parseDate = d3.timeParse('%Y-%m-%d')
const numberFormat = d3.format(',d')
const commaFormat = d3.format(',')
const decimalFormat = d3.format('.1f')
const timeFormat = d3.timeFormat('%b %d')

/// Scales////////////////////////////////
const xScale = d3.scaleTime().range([0, width])
const yScale = d3.scaleLinear().range([height, 0])

d3.csv(
  'https://raw.githubusercontent.com/louisvillepublicmedia/COVID-Data/main/vaccination-timeseries-ohio-valley%20-%20Sheet1.csv'
)
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(data) {
  data = data.filter(function(d) {
    return (d.state_postal === 'OH') & (d.doses_distributed_per_100k > 0)
  })
  data.forEach(d => {
    d.datetime = parseDate(d.date)
  })

  const dates = data.map(d => d.datetime)

  /// update Scales////
  xScale.domain(d3.extent(data.map(d => d.datetime)))
  yScale.domain([
    0,
    d3.max(data.map(d => +d.doses_distributed_per_100k)) + 5000
  ])

  /// draw avg line////////////////////////////////
  svg
    .append('path')
    .attr('class', 'dosesUsed')
    .datum(data)
    .attr('stroke', '#F79862')
    .attr('stroke-width', 2.5)
    .attr('fill', 'none')

  svg
    .append('path')
    .attr('class', 'dosesUsed-area')
    .datum(data)
    .attr('stroke', 'none')
    .attr('fill', 'grey')
    .attr('opacity', 0.3)

  svg
    .append('path')
    .attr('class', 'dosesSupplied')
    .datum(data)
    .attr('stroke', '#F05E23')
    .attr('stroke-width', 2.5)
    .attr('fill', 'none')

  // draw axis
  const yOptions = d3
    .axisLeft(yScale)
    .tickPadding(15)
    .ticks(5)
  const yAxis = svg.append('g').attr('class', 'axis y-axis')

  const xOptions = d3.axisBottom(xScale)
  const xAxis = svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')

  /// /text labels////////////////////////////////

  svg
    .append('rect')
    .attr('class', 'legend')
    .attr('width', 12)
    .attr('height', 10)
    .attr('x', 0)
    .attr('y', -margin.top / 2 + 25)
    .attr('fill', '#F79862')

  svg
    .append('rect')
    .attr('class', 'legend')
    .attr('width', 12)
    .attr('height', 10)
    .attr('x', 0)
    .attr('y', -margin.top / 2 + 38.5)
    .attr('fill', '#F05E23')

  svg
    .append('text')
    .attr('class', 'legend-text')
    .html('Supplied')
    .attr('font-size', '10')
    .attr('fill', 'grey')
    .attr('text-anchor', 'start')
    .attr('font-family', 'Georgia')
    .attr('x', 15)
    .attr('y', -margin.top / 2 + 32.5)

  svg
    .append('text')
    .attr('class', 'legend-text')
    .text('Used')
    .attr('font-size', '10')
    .attr('fill', 'grey')
    .attr('text-anchor', 'start')
    .attr('font-family', 'Georgia')
    .attr('x', 15)
    .attr('y', -margin.top / 2 + 47.5)

  svg
    .append('text')
    .attr('class', 'avgLabel')
    .text('Doses per 100,000 people')
    .attr('font-size', '10')
    .attr('fill', 'grey')
    .attr('font-family', 'Georgia')
    .attr('text-anchor', 'start')
    .attr('x', 0)
    .attr('y', -margin.top / 2 + 20)

  svg
    .append('text')
    .attr('class', 'headline')
    .text('Doses supplied and used per 100,000 population')
    .attr('font-size', '16')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')

  // ----------------------Source ------------------------
  svg
    .append('text')
    .data(data)
    .attr('class', 'chart-date')
    .text(function(d) {
      const parseDate = d3.timeParse('%Y-%m-%d')
      const formatTime = d3.timeFormat('%a %b %d, %Y')
      d.datetime = parseDate(d.date)
      return 'Data as of ' + formatTime(d.datetime)
    })
    .attr('x', 0)
    .attr('y', height + margin.bottom - 5)
    .attr('text-anchor', 'start')
    .attr('font-size', 10)
    .attr('font-style', 'italic')
    .attr('font-family', 'Georgia')

  /// render function///
  function render() {
    const svgContainer = svg.node().closest('div')
    const svgWidth = svgContainer.offsetWidth
    const svgHeight = height + margin.top + margin.bottom
    // const svgHeight = window.innerHeight
    const actualSvg = d3.select(svg.node().closest('svg'))
    actualSvg.attr('width', svgWidth).attr('height', svgHeight)
    const newWidth = svgWidth - margin.left - margin.right
    const newHeight = svgHeight - margin.top - margin.bottom
    // Update our scale
    xScale.range([0, newWidth])
    yScale.range([newHeight, 0])
    const rectWidth = newWidth / dates.length

    // update lines
    svg.selectAll('.dosesUsed-area').attr(
      'd',
      d3
        .area()
        .x(d => xScale(d.datetime))
        .y0(d => yScale(+d.doses_administered_per_100k))
        .y1(d => yScale(+d.doses_distributed_per_100k))
    )
    svg.selectAll('.dosesUsed').attr(
      'd',
      d3
        .line()
        .x(d => xScale(d.datetime))
        .y(d => yScale(+d.doses_distributed_per_100k))
    )
    svg.selectAll('.dosesSupplied').attr(
      'd',
      d3
        .line()
        .x(d => xScale(d.datetime))
        .y(d => yScale(+d.doses_administered_per_100k))
    )

    // update axis//
    yAxis
      .call(
        yOptions
          .tickSizeInner(-newWidth)
          .tickPadding(15)
          .ticks(5)
        // .tickFormat(function(d) {
        //   return d + '%'
        // })
      )
      .call(g => g.select('.domain').remove())
      .lower()

    xAxis
      .call(
        xOptions
          .ticks(newWidth / 100)
          .tickPadding(15)
          .tickFormat(d3.timeFormat('%b %d'))
      )
      .call(g => g.select('.domain').remove())

    // update avgerage label
    svg
      .selectAll('.headline')
      .attr('x', function(d) {
        if (newWidth > 400) {
          return newWidth / 2
        } else {
          return newWidth / 2 - 30
        }
      })
      .attr('y', -margin.top / 2)
      .text(function(d) {
        if (newWidth < 400) {
          return 'Doses supplied & used per 100k in OH'
        } else {
          return 'Doses supplied and used per 100,000 people in Ohio'
        }
      })

    svg.selectAll('.chart-date').attr('y', newHeight + margin.bottom - 5)

    //   // send the height to our embed
    if (pymChild) pymChild.sendHeight()
  }

  // // kick off the graphic and then listen for resize events
  render()
  window.addEventListener('resize', render)

  // // for the embed, don't change!
  if (pymChild) pymChild.sendHeight()
  pymChild = new pym.Child({ polling: 200, renderCallback: render })
}
