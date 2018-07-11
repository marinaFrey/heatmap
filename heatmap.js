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

    var height = 900,
        width = height/4.5;

    var canvas_matrix_viz = d3.select("#canvas_id")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var svg = d3.select("#svg_id")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var context = canvas_matrix_viz.node().getContext('2d');

    x = d3.scaleBand()
      .domain(questionnaires)
      .range([0, width]);

    y = d3.scaleBand()
      .domain(participants)
      .range([0, height]);

    var colorMap = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(["red", "yellow", "green"]);

    data.forEach(function(d,i)
    {
      context.beginPath();
      context.rect(x(d.questionnaire), y(d.participant), x.bandwidth(), y.bandwidth());
      context.fillStyle=colorMap(d.value);
      context.fill();
      context.closePath();
    });

    var endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    console.log(timeDiff + " ms");

    canvas = canvas_matrix_viz._groups[0][0];
    canvasWrapper = document.getElementById('overview_id');
    
    canvasWrapper.addEventListener('mousedown', function(evt)
    {
      drag = true;
    
      initialY = getParticipantFromYCoordinate(canvas, evt, y);

      svg.selectAll("*").remove();
      rect = svg
        .append("rect")
        .style("fill", "black")
        .attr("x", 0)
        .attr("y", y(initialY))
        .attr("width", width)
        .attr("height", 1)
        .attr("opacity",0.3);

    }, false);

    canvasWrapper.addEventListener('mouseup', function(evt)
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

    canvasWrapper.addEventListener('mousemove', function(evt) 
    {
      var participant =  getParticipantFromYCoordinate(canvas, evt, y);

      if(drag)
      {
        tooltip.style("visibility", "hidden");
        if(y(participant) - y(initialY) > 0)
          rect.attr("height", y(participant) - y(initialY));
        else
        {
          //rect
          //  .attr("y", y(participant))
          //  .attr("height",  y(initialY) -  y(participant));
        }
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

    canvasWrapper.addEventListener("mouseout", function(evt)
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
  var inverseModeScale = d3.scaleQuantize()
    .domain(y.range())
    .range(y.domain());

  return inverseModeScale(mousePos.y);
}

function getQuestionnaireFromXCoordinate(canvas, evt, x)
{
  var mousePos = getMousePos(canvas, evt);
  var inverseModeScale = d3.scaleQuantize()
    .domain(x.range())
    .range(x.domain());

  return inverseModeScale(mousePos.x);

}
