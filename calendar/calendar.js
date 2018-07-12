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
  
//calendar array
var calendar = [];

//yAxis array to store which column month labels will go on
var yAxis = [];

//todays date
var today = new Date();

//last Years date
var lastYear = addDays(today,-365);

//initialize column to 0
var col = 0;

//get the month of a year ago
var month = lastYear.getMonth();

//boolean for first sunday
var first = true;

//formatters for yaxis and tool tip
//var yAxisFormatter = d3.timeFormat("%b");
var tipFormatter = d3.timeFormat("%Y-%m-%d");



//for 365 days
for (i=0; i <= 365; i++)
{

    //get date as a string
    dateString = lastYear.toJSONLocal();

    //make a UTC (no timezone offset) date
    var date = makeUTCDate(dateString);

    //c is current day of week
    var c = date.getDay();

    //if sunday, if january, and it's the first sunday
    if (c === 0 && date.getMonth() === 0 && first)
    {
        //set month to -1 to allow following if block to run
        month = -1;
        //only do this for the first Sunday
        first = !first;
    }

    //if its sunday and a new month
    if (c === 0 && date.getMonth() > month)
    {
        //add a new object to yAxis indicating the position and month for labeling
        yAxis.push({
            col: col,
            //month: yAxisFormatter(date)
            month: date.toLocaleDateString("pt-BR", {month:"short"})
        });
        month++;
        
    }
    //add datum to calendar array including the date, initialized count, and column for positioning
    calendar.push(
    {
        date: date,
        count: 0,
        col: col,
    });

    //add next time through the loop, use the next day and if its a saturday start a new column
    lastYear = addDays(lastYear,1);
    if (c === 6){ col++; }
}

var margin = {top: 70, right: 70, bottom: 70, left: 90}; //margins
var padding = 4;
var squareSize = 21;
var width = squareSize + (squareSize+padding)*54; // 1 square + 53 squares with 2px padding
var height = squareSize + (squareSize+padding)*6; //1 square + 12 squares with 2px padding
var legendX = 540; //x Position for legend
var legendY = height + 10; //y position for legend

//append svg with a g object accounting for margins
var svg = d3.select('body').append('svg')
    .attr('width',width + margin.left + margin.right)
    .attr('height',height + margin.top + margin.bottom)
    .append('g')
    .attr('transform','translate('+margin.left+','+margin.top+')');

//Lazy y-axis from GitHub's commit calendar
createWeekdayLetter('D', squareSize*0.7,squareSize*0.7);
createWeekdayLetter('S', squareSize*2,squareSize*0.7);
createWeekdayLetter('T', squareSize*3+padding,squareSize*0.7);
createWeekdayLetter('Q', squareSize*4+padding*2,squareSize*0.7);
createWeekdayLetter('Q', squareSize*5+padding*3,squareSize*0.7);
createWeekdayLetter('S', squareSize*6+padding*4,squareSize*0.7);
createWeekdayLetter('S', squareSize*7+padding*5,squareSize*0.7);

//Prepare Calendar
svg.selectAll('.cal')
    .data(calendar)
    .enter()
    .append('rect')
    .attr('class','cal')
    .attr('width',squareSize)
    .attr('height',squareSize)
    .attr('x',function(d,i){return d.col*(squareSize+padding);})
    .attr('y',function(d,i){return d.date.getDay() * (squareSize+padding);})
    .attr('fill','#eeeeee');


var colorScale = d3.scaleThreshold() //based on http://www.perbang.dk/rgbgradient/ from #eee to #FF8C00
    .range(['#eeeeee','#eeeeee','#F2D5B2','#F6BD77','#FAA43B','#FF8C00']);

//Prepare y Axis
svg.selectAll('.y')
    .data(yAxis)
    .enter()
    .append('text')
    .text(function(d){ return d.month;})
    .attr('dy',-5)
    .attr('dx',function(d)
    {
        return d.col*(squareSize+padding);
    })
    .attr('fill','#ccc');

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
        //get the day of the event
        var eventDate = data[l].date.substr(0,10);
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

function createWeekdayLetter(letter, position, size)
{
    svg.append('text')
        .text(letter)
        .attr('text-anchor','middle')
        .style("font-size", size+'px')
        .style('fill','#ccc')
        .attr('dx','-10')
        .attr('dy',position);
}