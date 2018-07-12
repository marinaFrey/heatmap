Date.prototype.toJSONLocal = function() 
{
    function addZ(n) 
    {
        return (n<10? '0' : '') + n;
    }

    return this.getFullYear() + '-' +
        addZ(this.getMonth() + 1) + '-' +
        addZ(this.getDate());
}; // From : http://stackoverflow.com/questions/11382606/javascript-date-tojson-dont-get-the-timezone-offset
  
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
} // From: http://stackoverflow.com/questions/563406/add-days-to-datetime

function addMonths(date, months) 
{
    var result = new Date(date.getFullYear(),date.getMonth()+months,date.getDate());
    return result;
} 
  
//calendar array
var calendar = [];

//yAxis array to store which column month labels will go on
var yAxis = [];

//todays date
var today = new Date();

// first year shown on the calendar
var firstYear = new Date(2000,0);

//get the month of a year ago
var month = firstYear.getMonth();

//boolean for first sunday
var first = true;

//formatters for yaxis and tool tip
//var yAxisFormatter = d3.timeFormat("%b");
var tipFormatter = d3.timeFormat("%Y-%m-%d");


//initialize column to 0
var col = 0;
var i = 0;
while(firstYear.getFullYear() != today.getFullYear() || firstYear.getMonth() != today.getMonth())
{

    //get date as a string
    dateString = firstYear.toJSONLocal();

    //make a UTC (no timezone offset) date
    var date = makeUTCDate(dateString);

    //c is current day of week
    var c = date.getDay();

    if(firstYear.getMonth() == 0)
    {
        yAxis.push({
            col: col,
            year: firstYear.getFullYear()
        });
    }

    //add datum to calendar array including the date, initialized count, and column for positioning
    calendar.push(
    {
        date: date,
        count: 0,
        col: col,
    });

    if (firstYear.getMonth() === 11){ col++; }
    //add next time through the loop
    firstYear = addMonths(firstYear,1);
    
}
console.log(calendar);

var margin = {top: 70, right: 70, bottom: 70, left: 90}; //margins
var padding = 4;
var squareSize = 21;
var width = squareSize + (squareSize+padding)*54; // 1 square + 53 squares with 2px padding
var height = squareSize + (squareSize+padding)*12; //1 square + 12 squares with 2px padding
var legendX = 540; //x Position for legend
var legendY = height + 10; //y position for legend

//append svg with a g object accounting for margins
var svg = d3.select('body').append('svg')
    .attr('width',width + margin.left + margin.right)
    .attr('height',height + margin.top + margin.bottom)
    .append('g')
    .attr('transform','translate('+margin.left+','+margin.top+')');

//Lazy y-axis from GitHub's commit calendar
createMonthLetter('J', squareSize*0.7,squareSize*0.7);
createMonthLetter('F', squareSize*2,squareSize*0.7);
createMonthLetter('M', squareSize*3+padding,squareSize*0.7);
createMonthLetter('A', squareSize*4+padding*2,squareSize*0.7);
createMonthLetter('M', squareSize*5+padding*3,squareSize*0.7);
createMonthLetter('J', squareSize*6+padding*4,squareSize*0.7);
createMonthLetter('J', squareSize*7+padding*5,squareSize*0.7);
createMonthLetter('A', squareSize*8+padding*6,squareSize*0.7);
createMonthLetter('S', squareSize*9+padding*7,squareSize*0.7);
createMonthLetter('O', squareSize*10+padding*8,squareSize*0.7);
createMonthLetter('N', squareSize*11+padding*9,squareSize*0.7);
createMonthLetter('D', squareSize*12+padding*10,squareSize*0.7);

//Prepare Calendar
svg.selectAll('.cal')
    .data(calendar)
    .enter()
    .append('rect')
    .attr('class','cal')
    .attr('width',squareSize)
    .attr('height',squareSize)
    .attr('x',function(d,i){return d.col*(squareSize+padding);})
    .attr('y',function(d,i){return d.date.getMonth() * (squareSize+padding);})
    .attr('fill','#eeeeee');

var colorScale = d3.scaleThreshold() //based on http://www.perbang.dk/rgbgradient/ from #eee to #FF8C00
    .range(['#eeeeee','#eeeeee','#F2D5B2','#F6BD77','#FAA43B','#FF8C00']);

    
//Prepare y Axis
svg.selectAll('.y')
    .data(yAxis)
    .enter()
    .append('text')
    .text(function(d){ return d.year;})
    .attr('dy',-5)
    .attr('dx',function(d)
    {
        return d.col*(squareSize+padding);
    })
    
    .attr('fill','#ccc');

svg.selectAll('text')

var tooltipRect = svg.append('rect').style("opacity", 0);
var tooltipText = svg.append('text').style("opacity", 0);


d3.json('mockup.json',function(error,data)
{
    if (error) throw error;

    //instantiate events object
    var events = {};

    //for each item in array, starting with the last
    var l = data.length;
    while(l--)
    {
        var eventDate = new Date(data[l].date);
        //get the day of the event
        eventDate = new Date(eventDate.getFullYear(), eventDate.getMonth()).toJSONLocal();
        //if the events object doesn't have the current event's day as a key, create a key and give it a value 0
        if(!events[eventDate])
        {
            events[eventDate] = 0;
        }

        //+1 to event's value
        events[eventDate]++;
    }


    //for every day in the calendar (365)
    for (var i = 0; i < calendar.length; i++) 
    {
        //if current calendars day matches a day key in the events object
        if (events[calendar[i].date.toJSONLocal()])
        {
            //calendar's count = events count
            calendar[i].count = events[calendar[i].date.toJSONLocal()];
            
        }
    }

    //calculate min, max excluding 0
    var extent = d3.extent(calendar, function(d){ return /*d.count === 0 ? null :*/ d.count; });

    //calculate a range of 4 values, starting with min, stopping with max, spaced evenly
    var range = d3.range(extent[0],extent[1],((extent[1]-extent[0])/5));

    //use range as domain
    colorScale.domain(range);

    //Give calendar color based on # events and add tooltip events
    svg.selectAll('.cal')
        .attr('fill',function(d,i)
        {
            return colorScale(d.count);
        })
        .on('mouseover',function(d)
        {
            var xPosition = parseFloat(d3.select(this).attr("x"));
            var yPosition = parseFloat(d3.select(this).attr("y"));

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

function createMonthLetter(letter, position, size)
{
    svg.append('text')
        .text(letter)
        .attr('text-anchor','middle')
        .style('fill','#ccc')
        .style("font-size", size+'px')
        .attr('dx','-10')
        .attr('dy',position);
}