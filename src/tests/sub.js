const playGame = require('./play-game.js');

process.on('message', ({ myId, participantId }) => {
  const first = require(`../../submissions/${myId}/solution.js`);
  const second = require(`../../submissions/${participantId}/solution.js`);

  const result = playGame(first, second);

  process.send(result.first);
});
