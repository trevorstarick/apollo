(function(window, $) {
  var myDataRef = new Firebase('https://mining.firebaseio.com/');

  myDataRef.on('child_added', function(snapshot) {
    displayTweet({
      tweet:snapshot.val(),
      name:snapshot.name(),
    });
  myDataRef.on('child_changed', function(childSnapshot, prevChildName) {
    console.log(childSnapshot.name());
    hideItem(childSnapshot.name());
  });
  // $("html, body").animate({ scrollTop: $(document).height() }, "fast");
  });
  function hiddenContent(data) {
    var html = "";

    html +="<div class='hidden'>";
    
    $.each(data,function(key,value) {
      html += "<"+key+">"+JSON.stringify(value)+"</"+key+">";
    });
    
    html +="</div>";

    return html;
  }

  function amd(id) {
    var html = "";

    html += "<div class='amd' id='"+id+"''>";
    html += "<button id='auto' class='btn disabled btn-success'>Auto</button>";
    html += "<button id='manual' class='btn btn-primary'>Manual</button>";
    html += "<button id='delete' class='btn btn-danger'>Delete</button>";
    html += "</div>";

    return html;
  }

  function displayTweet(object) {
    var data = object.tweet;
    var id = object.name;

    var html = "";
    var icon = "<i class='fa fa-twitter'></i>&nbsp;";
    var location = "";
    var relevant = "relevant";
    var search = data.shortLink;
    
    // console.log(data);

    if (data.location) {
      location = " from <span class='loc'>" + data.location + "</span>";
    }
    var visible = data.visible;
    var timestamp = moment.unix(data.timestamp);
    var timeAgo = timestamp.fromNow();
    var timePro = timestamp.format("h:mm:ssA - MM/DD/YYYY");
    html +="<div class='boit' id="+id+">";
    html += hiddenContent(data);
  html += "<div class='msg " + relevant + "'>";
  html += "<img style='float:left; margin-right:5px' src='" + data.userImage + "'>";
  html += "<div class='misc'>";
  html += icon;
  html += "<span class='rn'>" + data.realName + "</span>";
  html += location;
  html += " said this <span class='dateTime' title='"+timePro+"'>" + timeAgo + "</span>";
  html += "</div>";
  html += "<a href='" + data.link + "' class='content' target='_blank' data-sl='" + search + "'>" + data.text + "</a>";
  html += "</div>";
  html += amd(id);
  html += "<hr>";
  html +="</div>";
    if (visible !== false) {
      $('.tweets').prepend(html);
    }
  }
  
  $('.container').on("click", "#auto", function(e){
  console.log(e);
  var id = e.target.parentNode.id;
  });

  $('.container').on("click", "#manual", function(e){
    var id = e.target.parentNode.id;
    var tweetID = $('#'+id+'>.hidden>id').text();
    tweetID = tweetID.substring(1,tweetID.length-1);
    var response = $('#'+id+'>.hidden>response').text();
    response = response.substring(1,response.length-1);
    var url = "https://twitter.com/intent/tweet";
    console.log(tweetID, response);
    url += "?in_reply_to="+tweetID;
    url += "&status="+encodeURIComponent(response);

  window.open(url);
    console.log(url);
  });

  function hideItem(id) {
    $('#'+id).hide();

  myDataRef
    .child(id)
    .update({'visible':false});
  }

  $('.container').on('click', "#clear", function(e){
  $('.boit').each(function(k,v){
    hideItem(v.id);
  });
  });

  $('.container').on("click", "#delete", function(e){
    var id = e.target.parentNode.id;
  hideItem(id);
  });

  $('.container').on("click", ".content", function(e) {
    e.preventDefault();
    var url = $(e.currentTarget);
    window.open(url.attr("href"));
    // window.open(url.data("sl"));
  });
})(window, jQuery, undefined);