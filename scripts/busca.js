// Description:
//   Find someone's remote schedule
//
// Dependencies:
//   ical: https://www.npmjs.com/package/ical
//
// Configuration:
//   None
//
// Commands:
//   hubot busca set <ical url> - stores a user's ical URL
//   hubot busca show - show's a user's ical URL
//   hubot busca <user> - returns that user's next 5 events; user must be an @mention
//   hubot busca remove - deletes the user's stored ical URL

var ical = require('ical');

module.exports = function(robot) {
  robot.respond(/busca set (.*)/i, function(res) {
    var icalUrl = res.match[1].trim(),
        reqUser = res.message.user.name;

    ical.fromURL(icalUrl, {}, function(err, data) {
      if (err) {
        res.reply(':dizzy_face: I don\'t understand that iCal URL.');
        return;
      }

      robot.brain.set('busca:' + reqUser, icalUrl);

      res.reply(':tada: Your :calendar: is set to: ' + icalUrl);
    });
  });

  robot.respond(/busca show/i, function(res) {
    var name     = res.message.user.name,
        icalUrl = robot.brain.get('busca:' + name);

    if (icalUrl) {
      res.reply('Your :calendar: is: ' + icalUrl);
    } else {
      res.reply(':sob: I can\'t find your :calendar:.');
    }
  });

  robot.respond(/busca remove/i, function(res) {
    var name = res.message.user.name;

    robot.brain.remove('busca:' + name);

    res.reply(':wastebasket: I\'ve removed your :calendar:.');
  });

  robot.respond(/busca @(.*)/i, function(res) {
    var name     = res.match[1].trim(),
        icalUrl = robot.brain.get('busca:' + name),
        response;

    if (!icalUrl) {
      res.reply(':sob: I can\'t find that user\'s :calendar:.');
      return;
    }

    ical.fromURL(icalUrl, {}, function(err, data) {
      if (err) {
        res.reply(':dizzy_face: I don\'t understand that iCal URL.');
        return;
      }

      var events       = eventObject(data, eventsToShow),
          numEvents    = Object.keys(events).length,
          eventsToShow = 5;

      if (numEvents === 0) {
        res.reply(':thinking_face: I can\'t find any upcoming events for ' + name + '.');
        return;
      }

      response = ':spiral_calendar_pad: Looks like ' + name
        + ' has a total of ' + numEvents + ' events.';

      var upcomingEvents = events.slice(0, eventsToShow);
      response += '\n ' + 'I will show you the next ' + eventsToShow + ':';
      upcomingEvents.forEach(function(key) {
          response += '\n- ' + key.summary + ' from ' + key.start.toDateString() + ' until ' + key.end.toDateString();
      });

      res.reply(response);
    });
  });
};

// Takes raw events object as returned by ical.fromURL and returns
// sorted and filtered array.
function eventObject(vevents) {
  var events = Object.values(vevents),
      today  = new Date();

  return events
    .filter(function(event) {
      return event.end > today;
    })
    .sort(function(a, b) {
      return a.start - b.start;
    });
}
