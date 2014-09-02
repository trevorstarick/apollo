var remoteServer = 'http://localhost:3000';
var $ = window.jQuery;

(function() {
  function loadModule(name) {
    var template = '<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 module" id="{{name}}"></div>';
    template = template.replace('{{name}}', name);
    $('#modules .row').append(template);
    console.log('Added', name);
    $('#' + name).append('<h1>' + name + '</h1>');
  }

  function graph(name) {
    function tick() {
            data.push(random());
            path
              .attr("d", line)
              .attr("transform", null)
              .transition()
              .duration(60) //in ms
            .ease("linear")
              .attr("transform", "translate(" + x(-1) + ",0)")
              .each("end", tick);

            data.shift();
          }

          var n = 40,
            random = d3.random.normal(0, 1),
            data = d3.range(n).map(random);

          var svgModule = d3.select('#' + name);
          var margin = {
              top: 50,
              right: -10,
              bottom: 50,
              left: -10
            },
            width = parseInt(svgModule.style("width")),
            // height = parseInt(svgModule.style("height"));
            height = 50;

          var svg = svgModule.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + height + ")");

          var x = d3.scale.linear()
            .domain([0, n - 1])
            .range([0, width]);

          var y = d3.scale.linear()
            .domain([-1, 1])
            .range([height, 0]);

          var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d, i) {
              return x(i);
            })
            .y(function(d, i) {
              return y(d);
            });

          var path = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
          tick();
  }

  function bool(name) {
    $('#' + name).append('<div class="boolAnswer">YES</div>');
  }

  function fetchModuleList() {
    $.getJSON(remoteServer + "/list", function(data) {
      $.each(data.keys, function(k, v) {
        loadModule(v.name);
        switch(v.type) {
          case 'float':
            graph(v.name);
            break;
          case 'bool':
            bool(v.name);
            break;
          default:
            throw 'Missing v.type for '+v.name+'. Got '+v.type+'!';
        }
      });
    });
  }
  fetchModuleList();
}).call();