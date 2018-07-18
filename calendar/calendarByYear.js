function createCalendarByYear()
{
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
    var padding = 4;
    var squareSize = 21;

    var margin = {top: 20, right: 0, bottom: 0, left: 25}; 
    var width = $("#calendarByMonth").width();
    var height = width*0.6;

    var calendar = [];
    var yearLabels = [];
    var today = new Date();
    var firstYear = new Date(2000,0);
    var month = firstYear.getMonth();
    var first = true;
    var col = 0;

    var svg = d3.select("#calendarByYear").append('svg')
        .attr('width',width + margin.left + margin.right)
        .attr('height',height + margin.top + margin.bottom)
        .append('g')
        .attr('transform','translate('+margin.left+','+margin.top+')');

    var i = 0;
    while(firstYear.getFullYear() != today.getFullYear() || firstYear.getMonth() != today.getMonth())
    {

        var dateString = firstYear.toJSONLocal();
        var date = makeUTCDate(dateString);

        if(firstYear.getMonth() == 0)
        {
            yearLabels.push({
                col: col,
                year: firstYear.getFullYear()
            });
        }

        calendar.push(
        {
            date: date,
            count: 0,
            col: col,
        });

        if (firstYear.getMonth() === 11){ col++; }
        firstYear = addMonths(firstYear,1);
        
    }

    var scale = d3.scaleBand().rangeRound([0, width-margin.left]).padding(0.15);
    scale.domain(calendar.map(function(d) { return d.col; }));
    var scaleWeekday = d3.scaleBand().rangeRound([0, height-margin.top]).padding(0.15);
    scaleWeekday.domain([0,1,2,3,4,5,6,7,8,9,10,11]);
    var colorScale = d3.scaleThreshold()
        .range(['#eeeeee','#eeeeee','#F2D5B2','#F6BD77','#FAA43B','#FF8C00']);
    
    
    var monthLetters = ['J','F','M','A','M','J','J','A','S','O','N','D'];
    for(var i = 0; i < monthLetters.length; i++)
    {
        createMonthLetter(monthLetters[i],scaleWeekday(i)+scaleWeekday.bandwidth()*0.8,scaleWeekday.bandwidth()*0.7)
    }


    svg.selectAll('.cal')
        .data(calendar)
        .enter()
        .append('rect')
        .attr('class','cal')
        .attr('width',scale.bandwidth())
        .attr('height',scale.bandwidth())
        .attr('x',function(d,i){return scale(d.col);})
        .attr('y',function(d,i){return scaleWeekday(d.date.getMonth());})
        .attr('fill','#eeeeee');


    svg.selectAll('.y')
        .data(yearLabels)
        .enter()
        .append('text')
        .text(function(d){ return d.year;})
        .attr('dy',-5)
        .attr('dx',function(d)
        {
            return scale(d.col);
        })
        .style("font-size", scale.bandwidth()*0.4+'px')
        .style('text-anchor', 'start')
        .attr("transform", function(d){ "rotate(180,"+scale(d.col)+","+(5)+")"})
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
            var eventDate = new Date(data[l].date);
            eventDate = new Date(eventDate.getFullYear(), eventDate.getMonth()).toJSONLocal();

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

    
    
    function makeUTCDate(dateString)
    {
        var d = new Date(dateString);
        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),  d.getUTCHours(), d.getUTCMinutes());
    }

    function addMonths(date, months) 
    {
        var result = new Date(date.getFullYear(),date.getMonth()+months,date.getDate());
        return result;
    } 

    function createMonthLetter(letter, position, size)
    {
        svg.append('text')
            .text(letter)
            .attr('text-anchor','middle')
            .style("font-size", size+'px')
            .style('fill','#ccc')
            .attr('dx','-5')
            .attr('dy',position);
    }
}
