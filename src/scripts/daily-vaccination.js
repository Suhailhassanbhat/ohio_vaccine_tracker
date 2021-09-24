import * as d3 from 'd3'
let pymChild

const margin = { top: 60, left: 60, right: 20, bottom: 60 }
const height = 440 - margin.top - margin.bottom
const width = 640 - margin.left - margin.right

const svg = d3
  .select('#daily-vaccination')
  .attr('viewBox', [0, 0, width, height])
  .append('svg')
  // .style('background-color', 'lightgrey')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

/// /tooltip////////////////////////////////
const tooltip = d3
  .select('body')
  .append('div')
  .attr('id', 'tooltip')
  .style('visibility', 'hidden')

function mouseOver(d, i) {
  tooltip
    .attr('data-html', 'true')
    .style('visibility', 'visible')
    .html(
      `<div class='row'><b>Date: ${timeFormat(
        parseDate(d.date)
      )}</b></br>Doses supplied: ${commaFormat(
        d.doses_distributed_cumulative
      )} </br>Doses used: ${numberFormat(
        d.doses_administered_cumulative
      )}</br>New doses used: ${numberFormat(d.new_doses_administered)}</div>`
    )
}

function mouseMove(d, widthEl) {
  const x = d3.event.pageX
  const y = d3.event.pageY
  const toolTipWidth = tooltip.node().getBoundingClientRect().width
  const toolTipMargin = 10
  const offset = d3
    .select('#daily-vaccination')
    .node()
    .getBoundingClientRect().x

  let parsedX = x + toolTipMargin
  if (parsedX > widthEl / 2 + toolTipMargin * 2 + offset)
    parsedX = parsedX - toolTipWidth - toolTipMargin

  tooltip.style('left', `${parsedX}px`).style('top', `${y + toolTipMargin}px`)
}

function mouseOut(d) {
  tooltip.style('visibility', 'hidden')
}

/// /parseTime////////////////////////////////
const parseDate = d3.timeParse('%Y-%m-%d')
const numberFormat = d3.format(',d')
const commaFormat = d3.format(',')
const timeFormat = d3.timeFormat('%b %d')

/// Scales////////////////////////////////
const xScale = d3.scaleTime().range([0, width])
const yScale = d3.scaleLinear().range([height, 0])

d3.csv(
  'https://raw.githubusercontent.com/louisvillepublicmedia/COVID-Data/main/vaccine-data-ohio-valley%20-%20Sheet1.csv'
)
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(data) {
  data = data.filter(function(d) {
    return (
      (d.state_abbreviation === 'OH') & (d.new_doses_administered_7_day_avg > 0)
    )
  })
  data.forEach(d => {
    d.datetime = parseDate(d.date)
  })

  const dates = data.map(d => d.datetime)

  /// update Scales////
  xScale.domain(d3.extent(data.map(d => d.datetime)))
  yScale.domain([0, d3.max(data.map(d => +d.new_doses_administered)) + 10000])

  /// /rectangle width //////////////////////////////////
  svg
    .append('g')
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'daily-cases-bars')
    .attr('fill', 'lightgrey')
    .attr('opacity', 1)

  /// draw avg line////////////////////////////////
  svg
    .append('path')
    .attr('class', 'avgDosesUsed')
    .datum(data)
    .attr('stroke', 'slateblue')
    .attr('stroke-width', 3)
    .attr('fill', 'none')

  svg
    .append('path')
    .attr('class', 'avgDosesSupplied')
    .datum(data)
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 3)
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
    .attr('fill', 'slateblue')

  svg
    .append('rect')
    .attr('class', 'legend')
    .attr('width', 12)
    .attr('height', 10)
    .attr('x', 0)
    .attr('y', -margin.top / 2 + 38.5)
    .attr('fill', 'steelblue')

  svg
    .append('text')
    .attr('class', 'legend-text')
    .html('Doses used')
    .attr('font-size', '12')
    .attr('fill', 'grey')
    .attr('text-anchor', 'start')
    .attr('font-family', 'Georgia')
    .attr('x', 15)
    .attr('y', -margin.top / 2 + 32.5)

  svg
    .append('text')
    .attr('class', 'legend-text')
    .text('Doses supplied')
    .attr('font-size', '12')
    .attr('fill', 'grey')
    .attr('text-anchor', 'start')
    .attr('font-family', 'Georgia')
    .attr('x', 15)
    .attr('y', -margin.top / 2 + 47.5)

  svg
    .append('text')
    .attr('class', 'label')
    .text('New doses administered by day')
    .attr('font-size', '12')
    .attr('font-weight', 'bold')
    .attr('fill', 'grey')
    .attr('font-family', 'Georgia')
    .attr('text-anchor', 'start')

  svg
    .append('text')
    .attr('class', 'avgLabel')
    .text('Seven-day average')
    .attr('font-size', '10')
    .attr('fill', 'grey')
    .attr('font-family', 'Georgia')
    .attr('text-anchor', 'start')
    .attr('x', 0)
    .attr('y', -margin.top / 2 + 20)

  svg
    .append('text')
    .attr('class', 'headline')
    .text('New doses administered by day in Ohio')
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
    // Do you want it to be full height? Pick one of the two below
    const svgHeight = height + margin.top + margin.bottom
    // const svgHeight = window.innerHeight

    const actualSvg = d3.select(svg.node().closest('svg'))
    actualSvg.attr('width', svgWidth).attr('height', svgHeight)

    const newWidth = svgWidth - margin.left - margin.right
    const newHeight = svgHeight - margin.top - margin.bottom

    // Update our scale
    xScale.range([0, newWidth])
    yScale.range([newHeight, 0])

    const rectWidth = newWidth / dates.length - 0.2

    // update bars
    svg
      .selectAll('.daily-cases-bars')
      .attr('x', d => xScale(d.datetime) - rectWidth / 2)
      .attr('y', d => yScale(+d.new_doses_administered))
      .attr('width', rectWidth)
      .attr('height', d => newHeight - yScale(+d.new_doses_administered))
      .on('mousemove', d => mouseMove(d, svgWidth))
      .on('mouseover', function(d) {
        mouseOver(d)
        d3.select(this).style('fill', 'indianred')
      })
      .on('mouseout', function(d) {
        mouseOut(d)
        d3.select(this).style('fill', 'lightgrey')
      })

    // update lines
    svg.selectAll('.avgDosesUsed').attr(
      'd',
      d3
        .line()
        .x(d => xScale(d.datetime))
        .y(d => yScale(+d.new_doses_administered_7_day_avg))
    )
    svg.selectAll('.avgDosesSupplied').attr(
      'd',
      d3
        .line()
        .x(d => xScale(d.datetime))
        .y(d => yScale(+d.new_doses_distributed_7_day_avg))
    )

    // update axis//
    yAxis
      .call(
        yOptions
          .tickSizeInner(-newWidth - rectWidth / 2)
          .tickPadding(15)
          .ticks(5)
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
      .selectAll('.label')
      .attr('x', xScale(parseDate('2021-01-19')) - 10)
      .attr('y', newHeight / 4)

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
        if (newWidth < 500) {
          return 'New doses administered by day in OH'
        } else {
          return 'New doses administered by day in Ohio'
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
