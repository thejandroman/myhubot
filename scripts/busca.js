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
//   hubot busca <username> - looks up that user's events and returns the next 5
//   hubot busca delete - deletes the user's stored ical URL

var ical = require('ical');

module.exports = (robot) => {
  robot.respond(/busca set (.*)/i, (res) => {
    var icalUrl = res.match[1].trim(),
        reqUser = res.message.user.name;

    ical.fromURL(icalUrl, {}, (err, data) => {
      if (err) {
        res.reply(':dizzy_face: I don\'t understand that iCal URL.');
        return;
      }

      robot.brain.set('busca:' + reqUser, icalUrl);

      res.reply(':tada: Your :calendar: is set to: ' + icalUrl);
    });
  });

  robot.respond(/busca show/i, (res) => {
    var name     = res.message.user.name,
        icalUrl = robot.brain.get('busca:' + name);

    if (icalUrl) {
      res.reply('Your :calendar: is: ' + icalUrl);
    } else {
      res.reply(':sob: I can\'t find your :calendar:.');
    }
  });

  robot.respond(/busca remove/i, (res) => {
    var name = res.message.user.name;

    robot.brain.remove('busca:' + name);

    res.reply(':wastebasket: I\'ve removed your :calendar:.');
  });

  robot.respond(/busca @(.*)/i, (res) => {
    var name     = res.match[1].trim(),
        icalUrl = robot.brain.get('busca:' + name),
        response;

    if (!icalUrl) {
      res.reply(':sob: I can\'t find that user\'s :calendar:.');
      return;
    }

    ical.fromURL(icalUrl, {}, (err, data) => {
      if (err) {
        res.reply(':dizzy_face: I don\'t understand that iCal URL.');
        return;
      }

      var numEvents = Object.keys(data).length,
          eventKeys = Object.keys(data).slice(0, 5);

      res.send(numEvents);

      if (numEvents === 0) {
        res.reply(':thinking_face: I can\'t find any upcoming events for ' + name + '.');
        return;
      }

      response = 'Looks like ' + name + ' has the following ' + numEvents + ' events:';

      eventKeys.forEach((key) => {
        var event = data[key],
            summary = event.summary,
            startDate = event.start.toDateString(),
            endDate = event.end.toDateString();
        response += '\n- ' + summary + ' from ' + startDate + ' - ' + endDate;
      });

      res.reply(response);
    });
  });
};
