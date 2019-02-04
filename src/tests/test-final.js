const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

function getCommonResult() {
  const dir = './result';
  const dirContentList = fs.readdirSync(dir);
  let commonResult = [];

  dirContentList.forEach((item) => {
    const result = JSON.parse(fs.readFileSync(`${dir}/${item}`).toString());

    commonResult.push(...result);
  });

  return commonResult;
}

function getMinMax(commonResult) {
  let min = Infinity;
  let max = 0;

  commonResult.forEach((item) => {
    const entries = Object.entries(item);
    entries.forEach((item) => {
      if (item[0] === 'combination') return;
      if (item[1] > max) max = item[1];
      if (item[1] < min) min = item[1];
    });
  });

  return { min, max };
}

function getFinalSum(commonResult) {
  const sumObj = {};

  commonResult.forEach((item) => {
    const entries = Object.entries(item);
    entries.forEach((item) => {
      if (item[0] === 'combination') return;
      if (sumObj[item[0]] === undefined) {
        sumObj[item[0]] = item[1];
      } else {
        sumObj[item[0]] += item[1];
      }
    });
  });

  return sumObj;
}

function saveSortedTableOnDisk(finalSum) {
  const entries = Object.entries(finalSum);
  entries.sort((a, b) => {
    return b[1] - a[1];
  });

  fsPromises.writeFile(`./result/final.json`, JSON.stringify(entries))
    .catch((err) => console.log(err));
}

const commonResult = getCommonResult();
const finalSum = getFinalSum(commonResult);
saveSortedTableOnDisk(finalSum);
