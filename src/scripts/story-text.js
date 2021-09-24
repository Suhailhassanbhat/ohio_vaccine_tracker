import * as d3 from 'd3'
// let pymChild

const graf1Text = d3.select('#kentucky-text-graf1')
const graf2Text = d3.select('#kentucky-text-graf2')
const graf3Text = d3.select('#kentucky-text-graf3')
const graf4Text = d3.select('#kentucky-text-graf4')


const parseDate = d3.timeParse('%Y-%m-%d')
const formatTime = d3.timeFormat('%b %d')
const commaFormat = d3.format(',')

Promise.all([
  d3.csv(
    'https://raw.githubusercontent.com/louisvillepublicmedia/COVID-Data/main/vaccine-data-ohio-valley%20-%20Sheet1.csv'
  ),
  d3.csv(
    'https://raw.githubusercontent.com/louisvillepublicmedia/COVID-Data/main/vaccination-timeseries-ohio-valley%20-%20Sheet1.csv'
  )
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([data, timeData]) {

  data = data.filter(function(d, i) {
    return (d.state_abbreviation === 'OH')
  })

  data = data.filter(function(d, i) {
    return i === 0
  })

  timeData = timeData.filter(function(d, i) {
    return d.state_postal === 'OH'
  })

  timeData = timeData.filter(function(d, i) {
    return i === 0
  })
  // console.log(data)
  // console.log(timeData)

  graf1Text
    .selectAll('.graf')
    .data(data)
    .join('div')
    .attr('class', 'graf')
    .html(function(d) {
      d.datetime = parseDate(d.date)
      return `<p>As of ${formatTime(
        d.datetime
      )}, ${d.state_name} received <span style='background-color:pink;padding-left:4px;padding-right:4px;padding-bottom:3px;color:black;'>${commaFormat(d.doses_distributed_cumulative)} doses</span> from the federal government. It had used <span style='background-color:pink;padding-left:4px;padding-right:4px;padding-bottom:3px;color:black;'>${commaFormat(d.doses_administered_cumulative)} doses, or ${d.percent_doses_administered}% </span> of its supply. The state targets to administer 90% of all vaccines received within 7 days of arrival.</p>`
    })
    .style('position', 'relative')

  graf2Text
    .selectAll('.graf')
    .data(data)
    .join('div')
    .attr('class', 'graf')
    .html(function(d) {
      d.datetime = parseDate(d.date)
      return `<p>The state government faces two challenges: securing an adequate supply of vaccines and administering those doses rapidly. The chart below keeps track of new doses administered by day. The bars provide daily information while the lines represent the weekly trends. On ${formatTime(
        d.datetime
      )}, the state administered <span style='background-color:pink;padding-left:4px;padding-right:4px;padding-bottom:3px;color:black;'>${commaFormat(d.new_doses_administered)} new doses</span> of COVID-19 vaccine.</p>`
    })
    .style('position', 'relative')

  // graf3Text
  //   .selectAll('.graf')
  //   .data(data)
  //   .join('div')
  //   .attr('class', 'graf')
  //   .html(function(d) {
  //     d.datetime = parseDate(d.date)
  //     return `<p>Under the Centers for Disease and Prevention Control's vaccine rollout recommendations, the states need to administer doses in multiple phases due to a limited supply of doses at first. In Phase 1, the states will vaccinate people in long-term care facilities,healthcare personnel, first responders, essential workers and anyone age 60 or older or with high-risk health conditions. The CDC, on its website, said that the agency will expand its vaccination recommendations to include more groups when vaccine supply increases.
  //     </p>`
  //   })
  //   .style('position', 'relative')

  graf4Text
    .selectAll('.graf')
    .data(timeData)
    .join('div')
    .attr('class', 'graf')
    .html(function(d) {
      d.datetime = parseDate(d.date)
      return `<p>The state reported that <span style='background-color:pink;padding-left:4px;padding-right:4px;padding-bottom:3px;color:black;'>${d.percent_first_dose_administered}% of its population got at least one dose of the vaccine, while ${d.percent_fully_vaccinated}% has been fully vaccinated</span>.</p>`
    })
    .style('position', 'relative')
}
