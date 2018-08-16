function getRandomInt(min, max) {
  return min + Math.floor((max - min) * Math.random());
}
function removeOpponentsByHisOffer(agent, offer, border) {
  const specifiedOpponents = agent.opponents.filter(opponent => opponent.reversedConvolution(offer) >= border);

  if (specifiedOpponents.length) {
    agent.log('�������� ��������� ' +
    (agent.opponents.length - specifiedOpponents.length)
    + ' ����������� �� ��������� ������ (������� ����� ����� ������ ' + border + ')');
    agent.opponents.filter(opponent => opponent.reversedConvolution(offer) < border).map(opp => agent.log(opp.name + ' -----> '));
    agent.opponents.filter(opponent => opponent.reversedConvolution(offer) >= border).map(opp => agent.log(opp.name + ' + '));
    agent.opponents = specifiedOpponents;
  }
}
function removeOpponentsByMyLastOffer(agent, offer, border) {
  const specifiedOpponents = agent.opponents.filter(opponent => opponent.reversedConvolution(offer) < border);

  if (specifiedOpponents.length) {
    agent.log('�������� ��������� ' +
    (agent.opponents.length - specifiedOpponents.length)
    + ' ����������� �� ���������� ������ (��� ��� ����� ���� �� ������ ���� ����� ' + border + ')');
    agent.opponents.filter(opponent => opponent.reversedConvolution(offer) >= border).map(opp => agent.log(opp.name + ' -----> '));
    agent.opponents.filter(opponent => opponent.reversedConvolution(offer) < border).map(opp => agent.log(opp.name + ' + '));
    agent.opponents = specifiedOpponents;
  } else if (border > 5) {
    removeOpponentsByMyLastOffer(agent, offer, border - 1);
  }
}
function announceOffer(agent, offer) {
  agent.log('<==== ��������� ���������� ' + offer.join('-') + ' ��������� ' + agent.convolution(offer));
}
function announceHaggling(agent) {
  agent.log('��������:  ' + agent.counts.join('---'));
  agent.log('���������: ' + agent.values.join('---'));
  agent.log('� ��������� ' + (agent.me ? '������' : '������'));
}
function announceRound(agent) {
  agent.log('����� ' + (6 - agent.rounds));
}
function announceOpponent(agent, opponent) {
  agent.log('������� ��������: ' + opponent.values.join(' - ') + ' ��� ���������� ��������� ' + agent.opponents.length);
}
function reduceRoundsCount(agent) {
  agent.rounds--;
}
function getAllLegalValues(counts, total) {
  const result = [];

  for (let i = 0; i <= total; i++) {
    for (let j = 0; j <= total; j++) {
      for (let k = 0; k <= total; k++) {
        if (counts[0] * i + counts[1] * j + counts[2] * k === total) {
          result.push([i, j, k]);
        }
      }
    }
  }
  return result;
}
function getAllLegalOffers(counts) {
  const result = [];

  for (let i = 0; i <= counts[0]; i++) {
    for (let j = 0; j <= counts[1]; j++) {
      for (let k = 0; k <= counts[2]; k++) {
        result.push([i, j, k]);
      }
    }
  }
  return result;
}
function getMedianValues(counts, opponents) {
  const l = opponents.length;

  return opponents.reduce((acc, opponent, index) => {
    if (index === l - 1) {
      return [(acc[0] + opponent.values[0]) / l, (acc[1] + opponent.values[1]) / l, (acc[2] + opponent.values[2]) / l];
    }
    return [acc[0] + opponent.values[0], acc[1] + opponent.values[1], acc[2] + opponent.values[2]];
  }, [0, 0, 0]).map(value => value.toFixed(1));
}
function isDifferentOffers(a, b) {
  return [0, 1, 2].some(index => a[index] !== b[index]);
}
function removeOffersFromListOf(some, all) {
  return all.filter(offer => some.every(_offer => isDifferentOffers(offer, _offer)));
}

class Opponent {
  constructor(counts, values, total) {
    this.counts = counts;
    this.values = values;
    this.total = total;
    this.name = this.values.join('-');
    this.convolution = offer => this.values.reduce((acc, value, index) => acc + value * offer[index], 0);
    this.reversedConvolution = offer => this.values.reduce((acc, value, index) => acc + value * (counts[index] - offer[index]), 0);
    this.getAmountOnHisOffer = offer => this.values.reduce((acc, value, index) => acc + value * offer[index], 0);
    this.getAmountOnMyOffer = offer => this.values.reduce((acc, value, index) => acc + value * (counts[index] - offer[index]), 0);
    this.sortedOffers = () => getAllLegalOffers(this.counts).sort((b, a) => this.convolution(a) - this.convolution(b));
    this.sortedOffersWithConvolution = () => this.sortedOffers().map(offer => [...offer, ' --> ' + this.convolution(offer)]);
    this.getPreferedOffersOnMinimumOf = minimum => getAllLegalOffers(this.counts).filter(offer => this.convolution(offer) > minimum);
  }
}

class Strategy {
  constructor(agent) {
    this.agent = agent;
    this.opponents = agent.opponents;
    this.meta = agent.getCurrentMetaOpponent();
  }

  getBestOffer() {
    const allOffers = getAllLegalOffers(this.agent.counts);
    const allOffersWithOutPrevious = removeOffersFromListOf(this.agent.myOffers, allOffers);
    let allPreferedOffers = allOffersWithOutPrevious.filter(offer => this.agent.convolution(offer) > this.agent.getMinimum());

    if (!allPreferedOffers.length) allPreferedOffers = allOffers.filter(offer => this.agent.convolution(offer) > this.agent.getMinimum() - 1);

    let mutualOptimalOffers = [];

    for (let i = 0; i < 6; i++) {
      if (allPreferedOffers.filter(offer => this.meta.reversedConvolution(offer) >= i).length) {
        mutualOptimalOffers = allPreferedOffers.filter(offer => this.meta.reversedConvolution(offer) >= i);
      }
    }

    this.agent.print('���������������� �������� �������: ', mutualOptimalOffers);

    return mutualOptimalOffers[getRandomInt(0, mutualOptimalOffers.length)];
  }
}

module.exports = class Agent {
  constructor(me, counts, values, maxRounds, log) {
    this.me = me;
    this.counts = counts;
    this.values = values;
    this.rounds = maxRounds;
    this.log = log;
    this.print = (message, array) => {
      this.log(message);
      return array.length
        ? array.forEach(elem => this.log(elem))
        : this.log('������ ��������');
    };
    this.convolution = offer => this.values.reduce((acc, value, index) => acc + value * offer[index], 0);
    this.total = 10;
    this.allLegalOpponents = getAllLegalValues(this.counts, this.total)
      .filter(value => isDifferentOffers(value, this.values))
      .map(value => new Opponent(this.counts, value, this.total));
    this.opponents = this.allLegalOpponents;
    this.getCurrentMetaOpponent = () => (new Opponent(this.counts, getMedianValues(this.counts, this.opponents), this.total));

    this.myOffers = [];
    this.opponentOffers = [];
    this.getMinimum = () => {
      const myMaxIndex = this.values.reduce((acc, value, index) => {
        return this.values[acc] < value ? index : acc;
      }, 0);

      const ratio = this.getCurrentMetaOpponent().values[myMaxIndex] / this.values[myMaxIndex];

      if (ratio >= 1 && this.opponents.length < 5 && this.rounds < 2) {
        // ����� �� ������������� � �������� ���������
        this.log('URA----!!!');
        return this.rounds + 2;
      }

      if (!this.rounds && this.me === 0) {
        const r = Math.random();

        switch (true) {
          case r > 0.99:
            return 1;
          case r > 0.75:
            return 2;
          case r > 0.5:
            return 3;
          case r > 0.25:
            return 4;
          default:
            return 5;
        }
      }

      return this.rounds + 4.5 + Math.random();
    };
    this.getStrategy = () => (new Strategy(this));

    announceHaggling(this);
    announceOpponent(this, this.getCurrentMetaOpponent());
    this.log('--------------------');
  }

  offer(hisCurrentOffer) {
    announceRound(this);
    reduceRoundsCount(this);

    if (hisCurrentOffer) {
      if (this.myOffers.length) removeOpponentsByMyLastOffer(this, this.myOffers[this.myOffers.length - 1], this.rounds + 4);
    }
    if (hisCurrentOffer) {
      if (this.myOffers.some(myOffer => !isDifferentOffers(myOffer, hisCurrentOffer))) {
        return undefined;
      }
    }
    if (hisCurrentOffer) {
      this.opponentOffers.push(hisCurrentOffer);

      announceOffer(this, hisCurrentOffer);

      if (this.convolution(hisCurrentOffer) >= this.getMinimum()) return undefined; // ������ ����������� �� 9+

      removeOpponentsByHisOffer(this, hisCurrentOffer, this.rounds + 4);
    }

    announceOpponent(this, this.getCurrentMetaOpponent());

    const myOffer = this.getStrategy().getBestOffer();

    this.myOffers.push(myOffer);
    this.log('====> � ��������� ' + myOffer.join(' - ') + ' (��� �������� ��� ���������� ' + this.convolution(myOffer) + ')');
    return myOffer;
  }
};
