exports.handler = function (event, context) {
  var eventId = event.queryStringParameters.eventId;
  var competitionId = event.queryStringParameters.competitionId;
 
  var url = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/" + eventId + "/competitions/" + competitionId + "/status";
 
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