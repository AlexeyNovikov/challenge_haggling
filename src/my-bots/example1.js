module.exports = class Agent {
    constructor(me, counts, values, max_rounds, log){
        this.me = me;
        this.items = counts;
        this.prices = values;
        this.roundsLeft = max_rounds;
        this.maxRounds = max_rounds;
        this.log = log;
        this.total = 0;
        this.myOffers = [];

        for (let i = 0; i < counts.length; i++)
            this.total += counts[i] * values[i];
    }

    maxOffer() {
      const myDollarsOffer = this.items.slice();

      for (let i = 0; i < myDollarsOffer.length; i++) {
        if (!this.prices[i])
          myDollarsOffer[i] = 0;
      }

      this.myOffers.push(myDollarsOffer);

      return myDollarsOffer;
    }

    offer(o){
        this.roundsLeft--;

        // если раунд последний и я моя очередь предлагать - вторая, т.е. это самое
        // последнее предложение, то мы соглашаемся.
        if (this.roundsLeft === 0 && this.me === 1) return;

        if (o) {
          if (this.myOffers.length) {
            // составляем предложение следующее по значимости с предыдущим или равное

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

            const offerCombinations = generate(this.items, 0);

            // отфильтруем те комбинации, в которы предлагается предмет,
            // имеющий для нас нулевую стоимость (но мы могли бы это сделать
            // и в рекурсии)
            const filteredOfferCombinations = offerCombinations.filter(offer => {
              let keep = true;

              offer.forEach((item, i) => {
                if (item > 0 && this.prices[i] === 0 )
                  keep = false;
              });

              return keep;
            });

            // создаем массив объектов, который содержит и комбинацию, и общую стоимость
            const filteredOfferCombinationsWithPrices = filteredOfferCombinations.map((offer) => {
              return {
                offer,
                total: offer.reduce((accum, item, i) => {
                  return accum + item * this.prices[i];
                }, 0)
              };
            });

            // сортируем filteredOfferCombinationsWithPrices в порядке уменьшения
            // стоимости предложения
            filteredOfferCombinationsWithPrices.sort((a, b) => {
              return b.total - a.total;
            });

            // делаем предложение в зависимости от номера хода
            const myOfferObj = filteredOfferCombinationsWithPrices[this.myOffers.length];

            if (!myOfferObj || (myOfferObj.total < (this.total / 2))) { // такого элемента может уже не быть
              const myOffer = this.myOffers[this.myOffers.length - 1];

              return myOffer;
            } else {
              this.myOffers.push(myOfferObj.offer);

              return myOfferObj.offer;
            }
          } else {
            return this.maxOffer();
          }
        } else {
          // если мы здесь, то моя очередь первая и мы предлагаем предметы с
          // максимальной для меня стоимостью, но только те, что для меня что-то
          // значат.
          return this.maxOffer();
        }
    }
};
