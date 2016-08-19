(function() {

    var basicColor = '#cf3b3b';
    var intermediateColor = '#c69143';
    var advancedColor = '#3b75b5';

    var svg = d3.select('svg');

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 700 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

    var formatDate = d3.time.format('%Y-%m-%d'),
        bisectDate = d3.bisector(function(d0) { return +d0; }).left;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(5)
        .tickFormat(function(d) { return d3.time.format('%b %d')(d); });

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient('left');

    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.rating); });

    svg = svg.attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    d3.json('data/ratings_data.json', function(error, data) {
        if (error) {
            throw error;
        }

        data = data.ratings.map(type).filter(function(d) {
            return !!d.date;
        }).sort(function(a, b) {
            return +a.date - +b.date;
        });


        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([250, 900]);

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        var endPoint = data[data.length-1];
        var indicator = svg.append('g')
            .attr('class', 'indicator-line');
        indicator.append('line')
            .attr('class', 'basic-line')
            .attr('x1', x(endPoint.date))
            .attr('x2', x(endPoint.date))
            .attr('y1', y(250))
            .attr('y2', y(640));
        indicator.append('line')
            .attr('class', 'intermediate-line')
            .attr('x1', x(endPoint.date))
            .attr('x2', x(endPoint.date))
            .attr('y1', y(640))
            .attr('y2', y(740));
        indicator.append('line')
            .attr('class', 'advanced-line')
            .attr('x1', x(endPoint.date))
            .attr('x2', x(endPoint.date))
            .attr('y1', y(700))
            .attr('y2', y(900));

        var lastColor = basicColor;
        if (endPoint.rating > 640 ) {
            lastColor = intermediateColor;
        }
        if (endPoint.rating > 740 ) {
            lastColor = advancedColor;
        }
        indicator.append('circle')
            .attr('class', 'last-circle')
            .style('fill', lastColor)
            .attr('r', 4.5)
            .attr('cx', x(endPoint.date))
            .attr('cy', y(endPoint.rating));

        svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line);

        var focus = svg.append('g')
            .attr('class', 'focus')
            .style('display', 'none');

        focus.append('circle')
            .attr('r', 25);

        focus.append('text')
            .attr('class', 'rating-text')
            .attr('x', 0)
            .attr('dy', '.35em');

        focus.append('rect')
            .attr('class', 'tooltip')
            .attr('x', -50)
            .attr('y', 26)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('width', 100)
            .attr('height', 20);

        focus.append('text')
            .attr('class', 'tooltip-text')
            .attr('x', 0)
            .attr('y', 35)
            .attr('dy', '.35em')
            .attr('width', 100)
            .attr('height', 20);

        svg.append('rect')
            .attr('class', 'overlay')
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', function() { focus.style('display', null); })
            .on('mouseout', function() { focus.style('display', 'none'); })
            .on('mousemove', mousemove);

        function mousemove() {
            var x0 = x.invert(d3.mouse(this)[0]);
            var dates = data.map(function(d) { return d.date; });
            var i = bisectDate(dates, +x0);
            var d = data[i];
            focus.attr('transform', 'translate(' + x(d.date) + ',' + y(d.rating) + ')');
            var circleColor = basicColor;
            if (d.rating > 640 ) {
                circleColor = intermediateColor;
            }
            if (d.rating > 740 ) {
                circleColor = advancedColor;
            }
            console.log(circleColor);
            focus.select('circle').style('stroke', circleColor);
            focus.select('text.rating-text').text(d.rating).style('fill', circleColor);
            focus.select('text.tooltip-text').text(d3.time.format('%b %d')(d.date));
        }
    });

    function type(d) {
        d.date = formatDate.parse(d.rating_date);
        d.rating = +d.rating;
        return d;
    }

})();
