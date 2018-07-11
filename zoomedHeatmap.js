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

    var height = 900,
        width = height;

    var canvas_matrix_viz = d3.select("#canvas_zoom_id")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var svg = d3.select("#svg_zoom_id")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var context = canvas_matrix_viz.node().getContext('2d');

    x = d3.scaleBand()
      .domain(questionnaires)
      .range([0, width]);

    y = d3.scaleBand()
      .domain(selectedParticipants)
      .range([0, height]);


    var colorMap = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(["#ef5545", "#fcff82", "#91ef45"]);

    svg.selectAll("*").remove();
    zoomRect = svg
      .append("rect")
      .style("fill", "black")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", x.range()[1])
      .attr("height", y.bandwidth())
      .style("opacity", 0.2);
    
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
    console.log(timeDiff + " ms para versao zoom");

    canvas = canvas_matrix_viz._groups[0][0];

    document.getElementById('zoom_id').addEventListener('mousemove', function(evt) 
    {
        var participant =  getParticipantFromYCoordinate(canvas, evt, y);   
        var questionnaire = getQuestionnaireFromXCoordinate(canvas, evt, x);

        if(questionnaire && participant)
        {
            zoomRect.attr("y", y(participant));

            tooltip.style("visibility", "visible");
            tooltip.text("Participante: " + participant + "; Questionario: " + questionnaire);
            tooltip.style("top", (evt.pageY-10)+"px").style("left",(evt.pageX+10)+"px");
        }
    }, false);

    document.getElementById('zoom_id').addEventListener("mouseout", function(evt)
    {
      return tooltip.style("visibility", "hidden");
    });

  }

}