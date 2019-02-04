module.exports = class Agent {
  constructor(me, counts, values, max_rounds, log) {
    this.items = counts;
    this.prices = values;
    this.total = 0;
    for (let i = 0; i<counts.length; i++)
        this.total += counts[i]*values[i];
    this.offerCombinations = this.calcOfferCombinations();
  }

  calcOfferCombinations() {
    function generate(items, idx) {
      let result = [];

      for (let i = 0; i <= items[idx]; i++) {
        const newItems = Array.from(items);
        newItems[idx] = i;

        if (idx !== items.length - 1) {
          result.push(...generate(newItems, idx + 1));
        } else {
          result.push(newItems);
        }
      }

      return result;
    }

    // вычисляем все возможные комбинации предложений
    const offerCombinations =  generate(this.items, 0);

    const filteredOfferCombinations = offerCombinations.filter(offer => {
      let keep = true;

      offer.forEach((item, i) => {
        if (item > 0 && this.prices[i] === 0)
          keep = false;
      });

      return keep;
    });

    return filteredOfferCombinations;
  }

  offer(o) {
    if (o) {
      let sum = 0;
      o.forEach((item, i) => sum += this.prices[i] * item);
      if (sum >= this.total / 2) return;
    }

    let offer = null;

    while (true) {
      let possibleOffer = this.offerCombinations[Math.round((Math.random() * 100))];

      let sum = possibleOffer ? possibleOffer.reduce((accum, item, i) => {
        return accum + item * this.prices[i];
      }, 0) : 0;

      if (sum > this.total / 2) {
        offer = possibleOffer;
        break;
      }
    }

    return offer;
  }
};
