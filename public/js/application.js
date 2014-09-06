var remoteServer = 'http://localhost:3000';

(function(window, $) {
  var ø = window.ø || {};

  ø.Helpers = {
    encodeID: function(string) {
      string = string.replace(':','-58-');
      return string;
    },
    decodeID: function(string) {
      string = string.replace('-58-', ':');
      return string;
    },
    lastItem: function(object) {
      return object.data[object.data.length-1];
    }
  };

  ø.Module = {
    load: function(object) {
      
      var div = {};
      var template = '';
      var a, b, c, d;

      var x = 12;

      a = x/ 1;
      b = x/ 2;
      c = x/ 3;
      d = x/ 4;

      div.id = ø.Helpers.encodeID(object.name);
      div.cl = "col-xs-"+a+" col-sm-"+b+" col-md-"+c+" col-lg-"+d;
      
      for(var i in Object.keys(div)) {
        var k = Object.keys(div)[i];
        var v = div[k];
      }

      template += '<div class="'+div.cl+'">';
      template += '<div class="module" id="'+div.id+'">';
      template += '<h1>' + ø.Helpers.decodeID(div.id) + '</h1>';
      // template += '<hr />';
      template += '<div class="content"></div>';
      template += '</div>';
      template += '</div>';

      $('#modules .row').append(template);
      console.log('Added', div.id);
    },

    update: function(object) {
      console.log('update',object);
      $('#'+ø.Helpers.encodeID(object.name)+' .content').html('');
      if(!ø.Type[object.type]) {
        throw 'Missing object.type for '+object.name+'. Got '+object.type+'!';
      } else {
        ø.Type[object.type](object);
      }
    },

    fetch: function(cb) {
      $.getJSON(remoteServer + "/list", function(data) {
        return cb(data.keys);
      });
    }
  };

  ø.Type = {
    float: function(object) {
      function tick() {
        data.push(random());
        path
          .attr("d", line)
          .attr("transform", null)
          .transition()
          .duration(250) //in ms
          .ease("linear")
          .attr("transform", "translate(" + x(-1) + ",0)")
          .each("end", tick);

        data.shift();
      }

      var n = 40,
        random = d3.random.normal(0, 0.25),
        data = d3.range(n).map(random);

      var svgModule = d3.select('#' + ø.Helpers.encodeID(object.name) + ' .content');
      var margin = {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        },
        width = parseInt(svgModule.style("width")) - margin.left - margin.right,
        height = 150 - margin.top - margin.bottom;
        // height = parseInt(svgModule.style("width")) - margin.top - margin.bottom;

      var svg = svgModule.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var x = d3.scale.linear()
        .domain([0, n - 1])
        .range([0, width]);

      var y = d3.scale.linear()
        .domain([-1, 1])
        .range([height, 0]);

      var line = d3.svg.line()
        // .interpolate("basis")
        .x(function(d, i) { return x(i); })
        .y(function(d, i) { return y(d); });

      svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

      var path = svg.append("g")
        .attr("clip-path", "url(#clip)")
        .append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
      tick();
    },

    bool: function(object) {      
      var res = '';
      if(object.data.length === 0) {
        res = '<div class="moduleText warnText">N/A</div>';
      } else { 
        if(
          ø.Helpers.lastItem(object) === 1 ||
          ø.Helpers.lastItem(object) === true ||
          ø.Helpers.lastItem(object) === 'true' ||
          ø.Helpers.lastItem(object) === 'True'
        ) {
          res = '<div class="moduleText greenText">YES</div>';
        } else {
          res = '<div class="moduleText redText">NO</div>';
        }
      }
      $('#' + ø.Helpers.encodeID(object.name) + ' .content').append(res);
    },

    int: function(object) {
      var res = '<div class="moduleText">'+ø.Helpers.lastItem(object)+'</div>';
      $('#' + ø.Helpers.encodeID(object.name) + ' .content').append(res);
    }
  };

  var lastModuleCount = 0;

  ø.Module.fetch(function(data) {
    lastModuleCount = data.length;
    $.each(data, function(k, v) {
      ø.Module.load(v);
      ø.Module.update(v);
    });
  });

  var updateInterval = 1 * 1000;

  var updateID = window.setInterval(function(){
    ø.Module.fetch(function(data) {
      if (lastModuleCount !== data.length) {
        if(lastModuleCount > data.length) {
          console.log('something was removed!');
        } else {
          console.log('something was added');
        }

        lastModuleCount = data.length;
      }

      $.each(data, function(k, v) {
        if(v.type !== 'float') {
          ø.Module.update(v);
        }
      });
    });
  }, updateInterval);

})(window,$);