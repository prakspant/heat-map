const width = 1500;
const height = 600;
const padding = 60;

const svg = d3.select('#heatmap')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(function(data) {
    const baseTemperature = data.baseTemperature;
    const monthlyVariance = data.monthlyVariance;

    const xScale = d3.scaleLinear()
      .domain(d3.extent(monthlyVariance, d => d.year))
      .range([padding, width - padding]);

    const yScale = d3.scaleTime()
      .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
      .range([padding, height - padding]);

    const colorScale = d3.scaleQuantize()
      .domain(d3.extent(monthlyVariance, d => baseTemperature + d.variance))
      .range(d3.schemeRdYlBu[11].reverse());

    svg.selectAll('rect')
      .data(monthlyVariance)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(new Date(0, d.month - 1, 0, 0, 0, 0, 0)))
      .attr('width', (width - 2 * padding) / monthlyVariance.length)
      .attr('height', (height - 2 * padding) / 12)
      .attr('fill', d => colorScale(baseTemperature + d.variance))
      .attr('class', 'cell')
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => baseTemperature + d.variance)
      .on('mouseover', function(event, d) {
        let tooltip = d3.select('#heatmap')
          .append('div')
          .attr('id', 'tooltip')
          .attr('data-year', d.year)
          .style('opacity', 0);
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html('Year: ' + d.year + '<br>' + 'Month: ' + d.month + '<br>' + 'Temp: ' + (baseTemperature + d.variance))
          .style('left', (d3.pointer(event)[0] + 30) + 'px')
          .style('top', (d3.pointer(event)[1]) + 'px');
        })
      .on('mouseout', function(event, d) {
        d3.select('#tooltip').transition().duration(500).style('opacity', 0);
        d3.select('#tooltip').remove();
      });

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%B'));

    svg.append('g')
      .attr('transform', 'translate(0,' + (height - padding) + ')')
      .call(xAxis)
      .attr('id', 'x-axis');

    svg.append('g')
      .attr('transform', 'translate(' + padding + ', 0)')
      .call(yAxis)
      .attr('id', 'y-axis');

    // Create legend
    const legend = svg.append('g')
      .attr('id', 'legend');

    const legendWidth = 300;
    const legendHeight = 20;

    const legendXScale = d3.scaleLinear()
      .domain(d3.extent(monthlyVariance, d => baseTemperature + d.variance))
      .range([0, legendWidth]);

    const legendXAxis = d3.axisBottom(legendXScale).tickSize(13)
      .tickValues(colorScale.range().map(function(d) { return colorScale.invertExtent(d)[0]; }))
      .tickFormat(d3.format(".1f"));

    const legendColors = colorScale.range();

    legend.selectAll('rect')
      .data(legendColors)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * (legendWidth / legendColors.length))
      .attr('y', 0)
      .attr('width', legendWidth / legendColors.length)
      .attr('height', legendHeight)
      .attr('fill', d => d);

    legend.append('g')
      .attr('transform', 'translate(0,' + legendHeight + ')')
      .call(legendXAxis);
  });
