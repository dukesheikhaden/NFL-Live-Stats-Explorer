exports.handler = function (event, context) {
  var week = event.queryStringParameters.week;
  var seasontype = event.queryStringParameters.seasontype || "2";
  var year = event.queryStringParameters.year;
 
  var url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
  var params = [];
  if (week) {
    params.push("week=" + week);
  }
  if (seasontype) {
    params.push("seasontype=" + seasontype);
  }
  if (year) {
    params.push("year=" + year);
  }
  if (params.length > 0) {
    url = url + "?" + params.join("&");
  }
 
  return fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    });
};