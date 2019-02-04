const playGame = require('./play-game.js');
const firstFifty = require('./first-fifty.js');
firstFifty.sort();

const combinations1225 = [];

for (let i = 0; i < firstFifty.length; i++ ) {
  for (let j = i + 1; j < firstFifty.length; j++) {
    combinations1225.push([firstFifty[i], firstFifty[j]]);
  }
}

process.on('message', ({ start, end }) => {
  if (start < 0 || start >= 1225) return;
  if (end > 1224) end = 1224;
  const total = [];

  for (let i = start; i <= end; i++) {
    const first = require(`../../submissions/${combinations1225[i][0]}/solution.js`);
    const second = require(`../../submissions/${combinations1225[i][1]}/solution.js`);

    const result = playGame(first, second);
    total.push({
      [combinations1225[i][0]]: result.first,
      [combinations1225[i][1]]: result.second,
      combination: i
    });
    console.log(i);
  }

  process.send(total);
});
