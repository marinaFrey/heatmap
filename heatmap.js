function matrixVisualization() 
{

  var margin = { top: 30, right: 10, bottom: 10, left: 10 };
  var canvas;
  var x;
  var y;

  /*
   * creates and updates the visualization
   */
  this.update = function () 
  {
    var startTime = new Date();

    var margin = { top: 100, right: 100, bottom: 100, left: 100 },
      width = 200,
      height = 900;

    var canvas_matrix_viz = d3.select("#canvas_id")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var svg = d3.select("#svg_id")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var context = canvas_matrix_viz.node().getContext('2d');

    x = d3.scale.ordinal()
      .domain(questionnaires)
      .rangeBands([0, width]);

    y = d3.scale.ordinal()
      .domain(participants)
      //.domain(d3.extent(data, function(p){return p.participant}))
      //.domain(d3.range(nParticipants))
      .rangeBands([0, height]);


    var colorMap = d3.scale.linear()
      .domain([-1, 0, 1])
      .range(["red", "yellow", "green"]);

    data.forEach(function(d,i)
    {
      context.beginPath();
      context.rect(x(d.questionnaire), y(d.participant), x.rangeBand(), y.rangeBand());
      context.fillStyle=colorMap(d.value);
      context.fill();
      context.closePath();
    });

    var endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    console.log(timeDiff + " ms");

    canvas = canvas_matrix_viz[0][0];

    
    canvas.addEventListener('mousedown', function(evt)
    {
      drag = true;
    
      initialY = getParticipantFromYCoordinate(canvas, evt, y);

      svg.selectAll("*").remove();
      rect = svg
        .append("rect")
        .style("fill", "grey")
        .attr("x", 0)
        .attr("y", y(initialY))
        .attr("width", width)
        .attr("height", 1);

    }, false);

    canvas.addEventListener('mouseup', function(evt)
    {
      drag = false;
      var finalY = getParticipantFromYCoordinate(canvas, evt, y);

      var initialYIndex, finalYIndex;   
      var selectedData = JSON.parse(JSON.stringify( data ));  
      for(var i = 0; i < data.length; i++) 
      {
        if(data[i].participant === finalY) 
        {
          finalYIndex = i;
        }
        if(data[i].participant === initialY)
        {
          if(!initialYIndex)
            initialYIndex = i;
        }
      }
      selectedData.length = finalYIndex;
      selectedData.splice(0,initialYIndex);

      var initialParticipantIndex, finalParticipantIndex;
      var selectedParticipants = JSON.parse(JSON.stringify( participants ));
      for(var j = 0; j < selectedParticipants.length; j++)
      {
        if(selectedParticipants[j] === finalY) 
        {
          finalParticipantIndex = j;
        }
        if(selectedParticipants[j] === initialY) 
        {
          initialParticipantIndex = j;
        }
      }
      selectedParticipants.length = finalParticipantIndex;
      selectedParticipants.splice(0,initialParticipantIndex);

      zoomMatrix.update(selectedData, selectedParticipants);

    }, false);

    canvas.addEventListener('mousemove', function(evt) 
    {
      var participant =  getParticipantFromYCoordinate(canvas, evt, y);

      if(drag)
      {
        tooltip.style("visibility", "hidden");
        rect.attr("height", y(participant) - y(initialY));
      }
      else
      {      
        var questionnaire = getQuestionnaireFromXCoordinate(canvas, evt, x);
        if(questionnaire && participant)
        {
          tooltip.style("visibility", "visible");
          tooltip.text("Participante: " + participant + "; Questionario: " + questionnaire);
          tooltip.style("top", (evt.pageY-10)+"px").style("left",(evt.pageX+10)+"px");
        }
          
      }
      
    }, false);

    canvas.addEventListener("mouseout", function(evt)
    {
      return tooltip.style("visibility", "hidden");
    });
  }

}

function getMousePos(canvas, evt) 
{
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function getParticipantFromYCoordinate(canvas, evt, y)
{
  var mousePos = getMousePos(canvas, evt);
  var leftEdgesY = y.range();
  var widthY = y.rangeBand();
  var i;
  for(i=0; mousePos.y > (leftEdgesY[i] + widthY); i++) {}

  return y.domain()[i];
}

function getQuestionnaireFromXCoordinate(canvas, evt, x)
{
  var mousePos = getMousePos(canvas, evt);
  var leftEdgesX = x.range();
  var widthX = x.rangeBand();
  var j;
  for(j=0; mousePos.x > (leftEdgesX[j] + widthX); j++) {}
      //do nothing, just increment j until case fails
      
  return x.domain()[j];

}

