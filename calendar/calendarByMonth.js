function createCalendarByMonth()
{
    var margin = {top: 20, right: 0, bottom: 0, left: 20};
    var width = $("#calendarByMonth").width();
    var height = width/7;

    var calendar = [];
    var monthLabels = [];
    var today = new Date();
    var lastYear = addDays(today,-365);
    var col = 0;
    var month = lastYear.getMonth();
    var first = true;

    var svg = d3.select("#calendarByMonth").append('svg')
        .attr('width',width + margin.left + margin.right)
        .attr('height',height + margin.top + margin.bottom)
        .append('g')
        .attr('transform','translate('+margin.left+','+margin.top+')');
    
    

    for (i=0; i <= 365; i++)
    {
        var dateString = lastYear.toJSONLocal();
        var date = makeUTCDate(dateString);
        var currentDayOfWeek = date.getDay();

        if (currentDayOfWeek === 0 && date.getMonth() === 0 && first)
        {
            month = -1;
            first = !first;
        }

        if (currentDayOfWeek === 0 && date.getMonth() > month)
        {
            monthLabels.push({
                col: col,
                month: date.toLocaleDateString("pt-BR", {month:"short"})
            });
            month++; 
        }

        calendar.push(
        {
            date: date,
            count: 0,
            col: col,
        });

        lastYear = addDays(lastYear,1);
        if (currentDayOfWeek === 6){ col++; }
    }
    
    var scale = d3.scaleBand().rangeRound([0, width-margin.left]).padding(0.15);
    scale.domain(calendar.map(function(d) { return d.col; }));
    var scaleWeekday = d3.scaleBand().rangeRound([0, height-margin.top]);
    scaleWeekday.domain([0,1,2,3,4,5,6]);
    var colorScale = d3.scaleThreshold()
        .range(['#eeeeee','#eeeeee','#F2D5B2','#F6BD77','#FAA43B','#FF8C00']);

    var weekdays = ['D','S','T','Q','Q','S','S'];
    for(var i = 0; i < weekdays.length; i++)
    {
        createWeekdayLetter(weekdays[i],scaleWeekday(i)+scaleWeekday.bandwidth()*0.8,scaleWeekday.bandwidth()*0.7)
    }

    svg.selectAll('.cal')
        .data(calendar)
        .enter()
        .append('rect')
        .attr('class','cal')
        .attr('width',scale.bandwidth())
        .attr('height',scale.bandwidth())
        .attr('x',function(d,i){return scale(d.col)})
        .attr('y',function(d,i){return scaleWeekday(d.date.getDay());})
        .attr('fill','#eeeeee');

    svg.selectAll('.y')
        .data(monthLabels)
        .enter()
        .append('text')
        .text(function(d){ return d.month;})
        .style("font-size", scale.bandwidth()*0.7+'px')
        .attr('dy',-5)
        .attr('dx',function(d)
        {
            return scale(d.col);
        })
        .attr('fill','#ccc');

    var tooltipRect = svg.append('rect').style("opacity", 0);
    var tooltipText = svg.append('text').style("opacity", 0);
    
    d3.json('mockup.json',function(error,data)
    {
        if (error) throw error;

        var events = {};

        var l = data.length;
        while(l--)
        {
            var eventDate = data[l].date.substr(0,10);
            if(!events[eventDate])
            {
                events[eventDate] = 0;
            }
            events[eventDate]++;
        }

        for (var i = 0; i < calendar.length; i++) 
        {
            if (events[calendar[i].date.toJSONLocal()])
            {
                calendar[i].count = events[calendar[i].date.toJSONLocal()];
            }
        }

        var extent = d3.extent(calendar, function(d){ return d.count; });
        var range = d3.range(extent[0],extent[1],((extent[1]-extent[0])/5));
        colorScale.domain(range);

        svg.selectAll('.cal')
            .attr('fill',function(d,i)
            {
                return colorScale(d.count);
            })
            .on('mouseover',function(d)
            {
                var xPosition = parseFloat(d3.select(this).attr("x"));
                var yPosition = parseFloat(d3.select(this).attr("y"));
                var tipFormatter = d3.timeFormat("%Y-%m-%d");

                tooltipRect
                    .attr('x',xPosition - 90)
                    .attr('y',yPosition - 60)
                    .attr('rx',3)
                    .attr('ry',3)
                    .attr('width',160)
                    .attr('height',50)
                    .style("border", '2px solid #FFF')
                    .style("opacity", 0.6);

                tooltipText
                    .text(d.count + " events on " + tipFormatter(d.date))
                    .attr('x',xPosition - 85)
                    .attr('y',yPosition - 30)
                    .style("fill", "white")
                    .style("font-size", '1.2em')
                    .style("font-weight", 'bold')
                    .style("opacity", 1);

            })
            .on('mouseout',function(d)
            {
                tooltipRect.style("opacity", 0);
                tooltipText.style("opacity", 0);
            });

    });

    Date.prototype.toJSONLocal = function() 
    {
        function addZ(n) 
        {
            return (n<10? '0' : '') + n;
        }

        return this.getFullYear() + '-' +
            addZ(this.getMonth() + 1) + '-' +
            addZ(this.getDate());
    };
    
    function makeUTCDate(dateString)
    {
        var d = new Date(dateString);
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),  d.getUTCHours(), d.getUTCMinutes());
    }

    function addDays(date, days) 
    {
        var result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    } 

    function createWeekdayLetter(letter, position, size)
    {
        svg.append('text')
            .text(letter)
            .attr('text-anchor','middle')
            .style("font-size", size+'px')
            .style('fill','#ccc')
            .attr('dx','0')
            .attr('dy',position);
    }
}