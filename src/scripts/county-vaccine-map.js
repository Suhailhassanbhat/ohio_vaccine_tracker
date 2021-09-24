import * as d3 from 'd3'
const pymChild = new pym.Child()
function legendVaccineStarted() {
  d3.csv('https://raw.githubusercontent.com/louisvillepublicmedia/COVID-Data/main/oh-county-vaccine-data/oh-counties-vaccine-data.csv'
    ).then(data => {
      const maxValue = d3.max(data.map(d => +d.pct_pop_firstdose))
      // var w = 300, h = 50;
      const margin = { top: 15, left: 10, right: 10, bottom: 5 }
      const height = 70 - margin.top - margin.bottom
      const width = 300 - margin.left - margin.right

      var key = d3.select("#vaccinationStartedLegend")
        .append("svg")
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      key.append('text').text('Percent population received first dose').attr('font-size',16).attr('text-anchor', 'start').attr('class', 'legend-headline')


      var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad")

      legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ffffd9")
        .attr("stop-opacity", 1)

      legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", '#081d58')
        .attr("stop-opacity", 1)

      key.append("rect")
        .attr("width", width)
        .attr("height", height - 30)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0,10)")

      var y = d3.scaleLinear()
          .domain([0, maxValue]).range([0,width])


      var yAxis = d3.axisBottom()
        .scale(y)
        .ticks(5)
        .tickSize(8)


      key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,30)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("axis title")
    
    })
}
legendVaccineStarted()

function legendVaccineCompleted() {
  d3.csv('https://raw.githubusercontent.com/louisvillepublicmedia/COVID-Data/main/oh-county-vaccine-data/oh-counties-vaccine-data.csv'
    ).then(data => {
      const maxValueVaccinated = d3.max(data.map(d => +d.pct_pop_vaccinated))
      // var w = 300, h = 50;
      const margin = { top: 15, left: 10, right: 10, bottom: 5 }
      const height = 70 - margin.top - margin.bottom
      const width = 300 - margin.left - margin.right

      var key = d3.select("#vaccinationCompletedLegend")
        .append("svg")
        .attr('height', height + margin.top + margin.bottom)
        .attr('width', width + margin.left + margin.right)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      key.append('text').text('Percent population fully vaccinated').attr('font-size',16).attr('text-anchor', 'start')


      var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient1")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad")

      legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f7fcf5")
        .attr("stop-opacity", 1)

      legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", '#00441b')
        .attr("stop-opacity", 1)

      key.append("rect")
        .attr("width", width)
        .attr("height", height - 30)
        .style("fill", "url(#gradient1)")
        .attr("transform", "translate(0,10)")

      var y = d3.scaleLinear()
          .domain([0, maxValueVaccinated]).range([0,width])


      var yAxis = d3.axisBottom()
        .scale(y)
        .ticks(5)
        .tickSize(8)


      key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,30)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("axis title")
    
    })
}
legendVaccineCompleted()
/// /MAP STARTS HERE////////////////////////////////
mapboxgl.accessToken =
  'pk.eyJ1Ijoic3VoYWlsLWJoYXQiLCJhIjoiY2tpbWxzbnZ1MGRqejJ4bncwNHl4anUzaiJ9.NsWEhUt8IvcwkFyDOh9h7g'
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/suhail-bhat/ckjtiews90dfi19tchb7rj1hx',
  center: [-82.9071, 40.4173],
  minZoom: 2.5,
  zoom: 6,
  trackResize: true,
  dragRotate: false,
  touchZoomRotate: true,
  scrollZoom: false
})
const bbox = [[-84.820159,38.403202],[-80.518693,41.977523]]
map.fitBounds(bbox)

map.boxZoom.enable()
map.addControl(
  new mapboxgl.NavigationControl({ showCompass: false }),
  'top-right'
)


map.on('load', function() {
  d3.csv('https://raw.githubusercontent.com/louisvillepublicmedia/COVID-Data/main/oh-county-vaccine-data/oh-counties-vaccine-data.csv'
  ).then(data => {
    const maxValue = d3.max(data.map(d => +d.pct_pop_firstdose))
    const maxValueVaccinated = d3.max(data.map(d => +d.pct_pop_vaccinated))

    const colorScale = d3.scaleLinear()
    .domain([0, maxValue]).range(['#f7fbff', '#08306b'])

    map.addSource('counties', {
      'type': 'geojson',
      'data': 'https://raw.githubusercontent.com/louisvillepublicmedia/shapefiles/main/ohioCounties.geojson',
      promoteId: 'GEOID'
    })
    data.forEach(row => {
      const format = d3.format('.2s')
      const format1 = d3.format(',')
      map.setFeatureState(
        {
          source: 'counties',
          id: row.county_fips
        },
        {
        pct_pop_firstdose:row['pct_pop_firstdose'],
        vaccination_started:row['vaccines_started'],
        vaccination_completed:row['vaccines_completed'],
        pct_pop_vaccinated:row['pct_pop_vaccinated']
        }
       )
    })

    map.addLayer({
      id: 'counties-join',
      type: 'fill',
      source: 'counties',
      layout: { visibility: 'visible' },
      paint: {
        'fill-color': [
          'case',
          ['!=', ['feature-state', 'pct_pop_firstdose'], null],
          [
            'interpolate',
            ['linear'],
            ['to-number', ['feature-state', 'pct_pop_firstdose']],
            0,
            '#ffffd9',
            maxValue,
            '#081d58'
          ],
          '#000000'
        ]
      }
    })
    map.addLayer({
      id: 'counties-join-vaccinated',
      type: 'fill',
      source: 'counties',
      layout: { visibility: 'none' },
      paint: {
        'fill-color': [
          'case',
          ['!=', ['feature-state', 'pct_pop_vaccinated'], null],
          [
            'interpolate',
            ['linear'],
            ['to-number', ['feature-state', 'pct_pop_vaccinated']],
            0,
            '#f7fcf5',
            maxValueVaccinated,
            '#00441b'
          ],
          '#000000'
        ]
      }
    })
    map.addLayer({
      id: 'counties-line',
      type: 'line',
      source: 'counties',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ffffff',
        'line-width': 0.5
      }
    })
    map.addLayer({
      id: 'counties-label',
      type: 'symbol',
      source: 'counties',
      minzoom: 7,
      layout: {
        'text-field': ['get', 'NAME'],
        'text-offset': [0, 0.6],
        'text-anchor': 'top',
        'text-size': 12
      },
      paint: {
        'text-color': '#FFFFFF'
      }
    })

    /// ///mouseover effects here //////////////////////////////////
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    })

    map.on('mousemove', 'counties-join', function(e) {
      map.getCanvas().style.cursor = 'pointer'
      const counties = map.queryRenderedFeatures(e.point, {
        id: 'counties-join'
      })

      const props = counties[0].properties
      const state = counties[0].state
      const commaFormat = d3.format(',')


      let content = '<b>' + props.NAME + ' County' +'</b>' + '<br>'
      content +=
        'Population received first doses: ' + commaFormat(state.vaccination_started) + '<br>'
      content +=
        '% population started vaccination: ' +
        state.pct_pop_firstdose +
        '<br>'

      popup
        .setLngLat(e.lngLat)
        .setHTML(content)
        .addTo(map)
    })

    map.on('mouseleave', 'counties-join', function() {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })

    map.on('mousemove', 'counties-join-vaccinated', function(e) {
      map.getCanvas().style.cursor = 'pointer'
      const counties = map.queryRenderedFeatures(e.point, {
        id: 'counties-join-vaccinated'
      })

      const props = counties[0].properties
      const state = counties[0].state
      const commaFormat = d3.format(',')


      let content = '<b>' + props.NAME + ' County' +'</b>' + '<br>'
      content +=
        'Fully vaccinated: ' + commaFormat(state.vaccination_completed) + '<br>'
      content +=
        '% population vaccinated: ' +
        state.pct_pop_vaccinated +
        '<br>'

      popup
        .setLngLat(e.lngLat)
        .setHTML(content)
        .addTo(map)
    })

    map.on('mouseleave', 'counties-join-vaccinated', function() {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })

    d3.select('#vaccinationStarted').on('click', function(){
      map.setLayoutProperty('counties-join', "visibility", 'visible')
      map.setLayoutProperty('counties-join-vaccinated', "visibility", 'none')
      document.getElementById('vaccinationCompletedLegend').style.display = 'none'
      document.getElementById('vaccinationStartedLegend').style.display = 'block'
    })
    d3.select('#vaccinationCompleted').on('click', function(){
      map.setLayoutProperty('counties-join', "visibility", 'none')
      map.setLayoutProperty('counties-join-vaccinated', "visibility", 'visible')
      document.getElementById('vaccinationCompletedLegend').style.display = 'block'
      document.getElementById('vaccinationStartedLegend').style.display = 'none'
    })

  })
})
