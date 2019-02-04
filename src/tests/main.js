const fs = require('fs');
const fsPromises = fs.promises;
const os = require('os');
const { fork } = require('child_process');
const firstFifty = require('./first-fifty.js');

const myId = firstFifty.pop();
let myScore = 0;
let workers = 0;

function saveJson(json) {
  console.log(json);
  fsPromises.appendFile(`./result/adjust.txt`, `${json}\n`)
    .catch((err) => console.log(err));
}

for (let i = 0; i < os.cpus().length; i++) {
  const worker = fork('./sub.js');
  workers++;

  worker.on('message', (data) => {
    myScore += data;

    const participantId = firstFifty.pop();
    if (participantId) {
      worker.send({ myId, participantId });
      console.log(firstFifty.length, data);
    } else {
      worker.kill();
      workers--;
      if (workers === 0) saveJson(JSON.stringify(myScore));
    }
  });

  worker.send({ myId, participantId: firstFifty.pop() });
}
