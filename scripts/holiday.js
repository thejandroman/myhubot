// Description:
//   weekend detector script
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   hubot is it the weekend - returns whether is it weekend or not

module.exports = function(robot) {
  robot.respond(/is it(\sthe)? weekend/i, function(msg) {
    var today = new Date();

    msg.reply(today.getDay() === 0 || today.getDay() === 6 ? "YES" : "NO");
  });
};
