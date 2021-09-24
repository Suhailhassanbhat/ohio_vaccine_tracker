import * as d3 from 'd3'
let pymChild
const margin = { top: 20, left: 20, right: 30, bottom: 20 }
const height = 860 - margin.top - margin.bottom
const width = 720 - margin.left - margin.right

const svg = d3
  .select('#vaccination-cartogram')
  .attr('viewBox', [0, 0, width, height])
  .append('svg')
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
      `<div class='row'><b>${
        d.data.State
      }</b> </br>––––––––––––––––</br>Initial dose: ${decimalFormat(
        d.data['People initiating vaccination as % of total population'] * 100
      )}%</br>Fully vaccinated: ${decimalFormat(
        +d.data[
          'People with full course administered as % of total population'
        ] * 100
      )}%</br>Doses used: ${decimalFormat(
        (d.data['Doses administered'] * 100) / d.data['Doses distributed']
      )}%</br>Total supply: ${numberFormat(
        d.data['Doses distributed']
      )} doses</br>Total used: ${numberFormat(
        d.data['Doses administered']
      )} doses</br>Supply/100k: ${commaFormat(
        decimalFormat(d.data['Doses distributed per 100k population'])
      )}</br>Used/100k: ${commaFormat(
        decimalFormat(d.data['Doses administered per 100k population'])
      )}</div>`
    )
}

function mouseMove(d, widthEl) {
  const x = d3.event.pageX
  const y = d3.event.pageY
  const toolTipWidth = tooltip.node().getBoundingClientRect().width
  const toolTipMargin = 10
  const offset = d3
    .select('#vaccination-cartogram')
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

// setting up a box///
const offset = 12
const state_padding = 5
const state_size = width / offset

/// /scales //////////////////////////////////
const colorScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range(['lightgrey', 'orange'])

const yScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([state_size, 0])
const rScale = d3.scaleBand()
const cScale = d3.scaleBand()
const decimalFormat = d3.format('.1f')
const commaFormat = d3.format(',')
const numberFormat = d3.format(".2s")

Promise.all([
  d3.json(require('/data/statesData.json')),
  d3.csv(
    'https://raw.githubusercontent.com/louisvillepublicmedia/COVID-Data/main/cdcCovidDataByState.csv'
  ),
  d3.csv(
    'https://raw.githubusercontent.com/louisvillepublicmedia/COVID-Data/main/vaccination-timeseries-ohio-valley%20-%20Sheet1.csv'
  )
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([stateData, vaccinationData, ovData]) {
  vaccinationData.map(d => {
    d.key = d.State
  })

  const merged_data = stateData.map(obj =>
    Object.assign({}, obj, {
      data: vaccinationData.find(d => d.key === obj.state_full)
    })
  )
  // console.log(merged_data)

  // ----------------------State Rectangle------------------------
  svg
    .selectAll('.states')
    .enter()
    .append('g')
    .data(merged_data)
    .enter()
    .append('rect')
    .attr('class', 'states')
    .attr('fill', 'lightgrey')
    .attr('opacity', 0.4)


  // ----------------------Vaccine rectangle------------------------

  svg
    .selectAll('vaccinations')
    .data(merged_data)
    .enter()
    .append('rect')
    .attr('class', 'vaccinations')
    .attr('fill', 'green')

  // ----------------------headline------------------------

  svg
    .append('text')
    .attr('class', 'oneDose-headline')
    .text(`Percent population starting vaccination`)
    .attr('x', 0)
    .attr('y', 10)
    .attr('text-anchor', 'start')
    .attr('font-size', 16)
    .attr('font-weight', '600')
    .attr('font-family', 'Georgia')

  // ----------------------State label------------------------
  svg
    .selectAll('.state-label')
    .data(merged_data)
    .enter()
    .append('g')
    .append('text')
    .attr('class', 'state-label')
    .attr('dominant-baseline', 'central')
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .attr('fill', 'black')
    .attr('font-family', 'Georgia')
    .text(d => d.state_postal)

  // ----------------------value label ------------------------
  svg
    .selectAll('.value-label')
    .data(merged_data)
    .enter()
    .append('g')
    .append('text')
    .attr('class', 'value-label')
    .attr('dominant-baseline', 'central')
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .attr('fill', 'black')
    .attr('font-family', 'Georgia')
    .text(
      d =>
        decimalFormat(
          d.data['People initiating vaccination as % of total population'] * 100
        ) + '%'
    )
  // ----------------------Source ------------------------
  svg
    .append('text')
    .data(ovData)
    .attr('class', 'chart-date')
    .text(function(d) {
      const parseDate = d3.timeParse('%Y-%m-%d')
      const formatTime = d3.timeFormat('%a %b %d, %Y')
      d.datetime = parseDate(d.date)
      return 'Data as of ' + formatTime(d.datetime)
    })
    .attr('x', 0)
    .attr('y', 30)
    .attr('text-anchor', 'start')
    .attr('font-size', 10)
    .attr('font-style', 'italic')
    .attr('font-family', 'Georgia')

  // experimental----------------------------------------------------------------

  function render() {
    // console.log('i am rendering')
    const svgContainer = svg.node().closest('div')
    const svgWidth = svgContainer.offsetWidth
    // Do you want it to be full height? Pick one of the two below
    const svgHeight = height + margin.top + margin.bottom
    // const svgHeight = window.innerHeight

    const actualSvg = d3.select(svg.node().closest('svg'))
    actualSvg.attr('width', svgWidth).attr('height', svgHeight)

    const newWidth = svgWidth - margin.left - margin.right
    // const newHeight = svgHeight - margin.top - margin.bottom

    // Update our scale
    const stateSize = newWidth / offset
    yScale.range([stateSize, 0])

    // -------------------update rectangles----------------
    svg
      .selectAll('.states')
      .attr('x', function(d) {
        return d.column * (stateSize + state_padding)
      })
      .attr('y', function(d) {
        return d.row * (stateSize + state_padding) + stateSize
      })
      .attr('width', stateSize)
      .attr('height', stateSize)
      .on('mousemove', d => mouseMove(d, newWidth))
      .on('mouseover', function(d) {
        mouseOver(d)
        d3.select(this)
          .style('stroke', 'black')
          .style('stroke-width', 2)
      })
      .on('mouseout', function(d) {
        mouseOut(d)
        d3.select(this)
          .style('stroke', 'none')
          .style('stroke-width', 2)
      })

    svg
      .selectAll('.vaccinations')
      .attr('x', function(d) {
        return d.column * (stateSize + state_padding)
      })
      .attr('width', stateSize)
      .attr('y', function(d) {
        const atleastonedose =
          +d.data['People initiating vaccination as % of total population'] *
          100
        return (
          d.row * (stateSize + state_padding) +
          stateSize +
          yScale(atleastonedose)
        )
      })
      .attr('height', d => {
        const atleastonedose =
          +d.data['People initiating vaccination as % of total population'] *
          100
        return stateSize - yScale(atleastonedose)
      })
      .attr('fill', 'green')
      .on('mousemove', d => mouseMove(d, newWidth))
      .on('mouseover', function(d) {
        mouseOver(d)
        d3.select(this)
          .style('stroke', 'black')
          .style('stroke-width', 2)
      })
      .on('mouseout', function(d) {
        mouseOut(d)
        d3.select(this)
          .style('stroke', 'none')
          .style('stroke-width', 2)
      })

    // ----------------------State label------------------------
    svg
      .selectAll('.state-label')
      .attr('x', function(d) {
        return d.column * (stateSize + state_padding) + stateSize / 2
      })
      .attr('y', function(d) {
        return d.row * (stateSize + state_padding) + stateSize + stateSize / 3
      })
      .attr('font-size', function(d) {
        if (newWidth < 500) {
          return 9
        } else {
          return 12
        }
      })
      .on('mousemove', d => mouseMove(d, newWidth))
      .on('mouseover', function(d) {
        mouseOver(d)
        d3.select(this).style('font-weight', 800)
      })
      .on('mouseout', function(d) {
        mouseOut(d)
        d3.select(this).style('font-weight', 400)
      })

    // ----------------------value label ------------------------
    svg
      .selectAll('.value-label')
      .attr('x', function(d) {
        return d.column * (stateSize + state_padding) + stateSize / 2
      })
      .attr('y', function(d) {
        return d.row * (stateSize + state_padding) + stateSize + stateSize / 1.5
      })
      .attr('font-size', function(d) {
        if (newWidth < 500) {
          return 7
        } else {
          return 11
        }
      })
      .text(
        d =>
          decimalFormat(
            d.data['People initiating vaccination as % of total population'] *
              100
          ) + '%'
      )
      .on('mousemove', d => mouseMove(d, newWidth))
      .on('mouseover', function(d) {
        mouseOver(d)
        d3.select(this).style('font-weight', 800)
      })
      .on('mouseout', function(d) {
        mouseOut(d)
        d3.select(this).style('font-weight', 400)
      })

    svg.selectAll('.oneDose-headline').text(function(d) {
      if (newWidth < 500) {
        return '% population starting vaccination'
      } else {
        return 'Percent population starting vaccination'
      }
    })

    // ----------------------TAB 1 ------------------------

    d3.select('#one-dose').on('click', function() {
      // console.log('rendering1')

      svg
        .selectAll('.value-label')
        .text(
          d =>
            decimalFormat(
              d.data['People initiating vaccination as % of total population'] *
                100
            ) + '%'
        )
        .attr('font-family', 'Georgia')
      svg
        .selectAll('.vaccinations')
        .attr('y', function(d) {
          const atleastonedose =
            +d.data['People initiating vaccination as % of total population'] *
            100
          return (
            d.row * (stateSize + state_padding) +
            stateSize +
            yScale(atleastonedose)
          )
        })
        .attr('height', d => {
          const atleastonedose =
            +d.data['People initiating vaccination as % of total population'] *
            100
          return stateSize - yScale(atleastonedose)
        })
        .attr('fill', 'green')
        .on('mousemove', d => mouseMove(d, newWidth))
        .on('mouseover', function(d) {
          mouseOver(d)
          d3.select(this)
            .style('stroke', 'black')
            .style('stroke-width', 2)
        })
        .on('mouseout', function(d) {
          mouseOut(d)
          d3.select(this)
            .style('stroke', 'none')
            .style('stroke-width', 2)
        })

      svg
        .selectAll('.states')
        .attr('fill', 'lightgrey')
        .attr('opacity', 0.4)

      svg.selectAll('.legend').style('fill', 'none')

      svg.selectAll('.oneDose-headline').text(function(d) {
        if (newWidth < 500) {
          return '% population starting vaccination'
        } else {
          return 'Percent population starting vaccination'
        }
      })
    })

    // ----------------------TAB 2 ------------------------

    d3.select('#vaccinated').on('click', function() {
      // console.log('rendering2')

      svg
        .selectAll('.value-label')
        .text(
          d =>
            decimalFormat(
              d.data[
                'People with full course administered as % of total population'
              ] * 100
            ) + '%'
        )
        .attr('font-family', 'Georgia')
      svg
        .selectAll('.vaccinations')
        .attr('y', function(d) {
          const atleastonedose =
            +d.data[
              'People with full course administered as % of total population'
            ] * 100
          return (
            d.row * (stateSize + state_padding) +
            stateSize +
            yScale(atleastonedose)
          )
        })
        .attr('height', d => {
          const atleastonedose =
            +d.data[
              'People with full course administered as % of total population'
            ] * 100
          return stateSize - yScale(atleastonedose)
        })
        .attr('fill', '#8856a7')
        .on('mousemove', d => mouseMove(d, svgWidth))
        .on('mouseover', function(d) {
          mouseOver(d)
          d3.select(this)
            .style('stroke', 'black')
            .style('stroke-width', 2)
        })
        .on('mouseout', function(d) {
          mouseOut(d)
          d3.select(this)
            .style('stroke', 'none')
            .style('stroke-width', 2)
        })

      svg
        .selectAll('.states')
        .attr('fill', 'lightgrey')
        .attr('opacity', 0.4)
      svg.selectAll('.legend').style('fill', 'none')
      svg
        .selectAll('.oneDose-headline')
        .text(`Percent population fully vaccinated`)
    })
    // ----------------------TAB 3 ------------------------

    d3.select('#utilization').on('click', function() {
      // console.log('rendering3')

      svg
        .selectAll('.value-label')
        .text(function(d) {
          const utilization =
            (d.data['Doses administered'] * 100) / d.data['Doses distributed']
          return decimalFormat(utilization) + '%'
        })
        .attr('font-family', 'Georgia')

      svg
        .selectAll('.vaccinations')
        .attr('y', function(d) {
          const utilization =
            (d.data['Doses administered'] * 100) / d.data['Doses distributed']
          return (
            d.row * (stateSize + state_padding) +
            stateSize +
            yScale(utilization)
          )
        })
        .attr('fill', 'orange')
        .attr('height', d => {
          const utilization =
            (d.data['Doses administered'] * 100) / d.data['Doses distributed']
          return stateSize - yScale(utilization)
        })
        .on('mousemove', d => mouseMove(d, svgWidth))
        .on('mouseover', function(d) {
          mouseOver(d)
          d3.select(this)
            .style('stroke', 'black')
            .style('stroke-width', 2)
        })
        .on('mouseout', function(d) {
          mouseOut(d)
          d3.select(this)
            .style('stroke', 'none')
            .style('stroke-width', 2)
        })

      svg.selectAll('.oneDose-headline').text(function(d) {
        if (newWidth < 500) {
          return 'Percent vaccine supply used'
        } else {
          return 'Share of total allocated vaccines used'
        }
      })
    })
  }
  // // kick off the graphic and then listen for resize events
  render()
  window.addEventListener('resize', render)

  // // for the embed, don't change!
  if (pymChild) pymChild.sendHeight()
  pymChild = new pym.Child({ polling: 200, renderCallback: render })
}
