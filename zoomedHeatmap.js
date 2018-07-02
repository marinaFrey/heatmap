function matrixZoomVisualization() 
{

  var margin = { top: 30, right: 10, bottom: 10, left: 10 };
  var canvas;
  var x;
  var y;

  /*
   * creates and updates the visualization
   */
  this.update = function (data, selectedParticipants) 
  {
    var startTime = new Date();

    var margin = { top: 100, right: 100, bottom: 100, left: 100 },
      width = 900,
      height = 900;

    var canvas_matrix_viz = d3.select("#canvas_zoom_id")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var svg = d3.select("#svg_zoom_id")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var context = canvas_matrix_viz.node().getContext('2d');

    x = d3.scale.ordinal()
      .domain(questionnaires)
      .rangeBands([0, width]);

    y = d3.scale.ordinal()
      .domain(selectedParticipants)
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
    console.log(timeDiff + " ms para versao zoom");

    canvas = canvas_matrix_viz[0][0];

    canvas.addEventListener('mousemove', function(evt) 
    {
        var participant =  getParticipantFromYCoordinate(canvas, evt, y);   
        var questionnaire = getQuestionnaireFromXCoordinate(canvas, evt, x);
        if(questionnaire && participant)
        {
            tooltip.style("visibility", "visible");
            tooltip.text("Participante: " + participant + "; Questionario: " + questionnaire);
            tooltip.style("top", (evt.pageY-10)+"px").style("left",(evt.pageX+10)+"px");
        }
    }, false);

    canvas.addEventListener("mouseout", function(evt)
    {
      return tooltip.style("visibility", "hidden");
    });

  }

}