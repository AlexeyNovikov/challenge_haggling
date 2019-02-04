const fs = require('fs');
const fsPromises = fs.promises;
const os = require('os');
const { fork } = require('child_process');
const startPoint = 1000;
const step = 100;

function saveJson(json, start, end) {
  fsPromises.writeFile(`./result/${start}-${end}.json`, json)
    .catch((err) => console.log(err));
}

for (let i = 0; i < os.cpus().length - 1; i++) {
  let start = i * step + 1 + startPoint;
  start = start === 1 ? 0 : start;
  const end = i * step + step + startPoint;
  const worker = fork('./sub-process.js');

  worker.on('message', (data) => {
    saveJson(JSON.stringify(data), start, end);
    worker.kill();
  });

  worker.send({ start, end });
}
