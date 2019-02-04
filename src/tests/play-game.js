function calcItemsCombinations(types, maxObj) {
  const obj_sets = [];

  function init_sets(counts, i, total_count){
    let min = Math.max(1, 1 - total_count - types + i + 1);
    let max = maxObj - total_count - types + i + 1;
    for (let j = min; j <= max; j++)
    {
      counts[i] = j;
      if (i < types - 1)
        init_sets(counts, i + 1, total_count + j);
      else
      {
        let obj_set = Array.from(counts);
        obj_sets.push(obj_set);
      }
    }
  }

  init_sets(new Array(types), 0, 0);

  return obj_sets;
}

function calcPriceCombinations(items, total) {
  function generate(prices, items, total, idx) {
    let result = [];

    for (let i = 0; i <= prices[prices.length - 1]; i++) {
      const newPrices = Array.from(prices);
      newPrices[idx] = i;

      if (idx !== prices.length - 1) {
        result.push(...generate(newPrices, items, total, idx + 1));
      } else {
        const sum = newPrices.reduce((accum, price, index) => {
          return accum + price * items[index];
        }, 0);

        if (sum === total) {
          result.push(newPrices);
        }
      }
    }

    return result;
  }

  return generate((new Array(items.length).fill(total)), items, total, 0);
}

function invertOffer(baseOffer, offer) {
  const invertedOffer = baseOffer.map((item, i) => item - offer[i]);

  return invertedOffer;
}

function isLegalOffer(itemsCombination, offer) {
  let legal = true;

  if (offer === undefined) return true;
  if (itemsCombination.length !== offer.length) return false;
  offer.forEach((item, i) => {
    if (offer[i] > itemsCombination[i] || offer[i] < 0)
      legal = false;
  });
  return legal;
}

function playGame(agent0, agent1, totalRounds, itemsCombination) {
  let total = totalRounds * 2;
  let counterOffer = null;
  let aggreement = {
    agent0: [0, 0, 0],
    agent1: [0, 0, 0]
  };

  while(total) {
    if (total === totalRounds * 2) {
      const offer = agent0.offer();
      if (!isLegalOffer(itemsCombination, offer)) break;

      counterOffer = invertOffer(itemsCombination, offer);
    } else if (total === 1) {
      const offer = agent1.offer(counterOffer);
      if (!isLegalOffer(itemsCombination, offer)) break;

      if (offer) { // соглашение не достигнуто
        break;
      } else {
        aggreement = {
          agent0: invertOffer(itemsCombination, counterOffer),
          agent1: counterOffer,
        }
      }
    } else if (!total) {
      return;
    } else {
      const turn = total % 2;
      if (turn === 0) {
        const offer = agent0.offer(counterOffer);
        if (!isLegalOffer(itemsCombination, offer)) break;

        if (!offer) { // если согласился
          aggreement = {
            agent0: counterOffer,
            agent1: invertOffer(itemsCombination, counterOffer),
          }
          break;
        }

        counterOffer = invertOffer(itemsCombination, offer);
      }
      if (turn === 1) {
        const offer = agent1.offer(counterOffer);
        if (!isLegalOffer(itemsCombination, offer)) break;

        if (!offer) { // если согласился
          aggreement = {
            agent0: invertOffer(itemsCombination, counterOffer),
            agent1: counterOffer,
          }
          break;
        }

        counterOffer = invertOffer(itemsCombination, offer);
      }
    }

    total--;
  }

  return aggreement;
}

function calcIncome(aggreement, priceCombination0, priceCombination1) {
  const agent0Sum = aggreement.agent0.reduce((accum, item, index) => {
    return accum + item * priceCombination0[index];
  }, 0);

  const agent1Sum = aggreement.agent1.reduce((accum, item, index) => {
    return accum + item * priceCombination1[index];
  }, 0);

  return [agent0Sum, agent1Sum];
}

function test(Agent0, Agent1) {
  const types = 3;
  const maxObj = 6;
  const totalPrice = 10;
  const totalRounds = 5;
  const itemsCombinations = calcItemsCombinations(types, maxObj);
  const result = [];
  const info = {
    agent0: 0,
    agent1: 0,
  };

  itemsCombinations.forEach((itemsCombination) => {
    const priceCombinations = calcPriceCombinations(itemsCombination, totalPrice);

    priceCombinations.forEach((priceCombination0, i) => {
      priceCombinations.forEach((priceCombination1, j) => {
        if (i === j) return;

        const agent0 = new Agent0(0, itemsCombination, priceCombination0, totalRounds, () => {});
        const agent1 = new Agent1(1, itemsCombination, priceCombination1, totalRounds, () => {});

        try {
          const agreement = playGame(agent0, agent1, totalRounds, itemsCombination);
          const calculatedIncome = calcIncome(agreement, priceCombination0, priceCombination1);

          info.agent0 += calculatedIncome[0];
          info.agent1 += calculatedIncome[1];
        } catch (error) {
          // во дает парень
        }
      });
    });
  });

  return [info.agent0, info.agent1];
}

// получаем двух ботов и организуем игру для них на всех возможных комбинациях.
// при этом максимальное количество предметов и цен соответствует официальным.
// проводится две игры, в первой ходин первый бот, во второй они меняются.
module.exports = function(AgentFirst, AgentSecond) {
  let result = {
    first: 0,
    second: 0
  };
  let res = [];

  res = test(AgentFirst, AgentSecond);
  result.first = res[0];
  result.second = res[1];

  res =  test(AgentSecond, AgentFirst);
  result.first += res[1];
  result.second += res[0];

  return result;
}
