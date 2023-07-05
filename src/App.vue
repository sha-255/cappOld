<template>
  <div
    class="container mx-auto flex flex-col items-center bg-gray-100 p-4 rounded-lg"
  >
    <loading-bar :isVisible="isLoading" />
    <div class="container">
      <add-ticker @add-ticker="handleAdd" :disabled="tooManyTickersAdded" />
      <template v-if="tickers.length > 0">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div class="flex">
          <button
            @click="page -= 1"
            v-if="page > 1"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад</button
          ><button
            @click="page += 1"
            v-if="hasNextPage"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперёд
          </button>
          <div class="flex mx-2">
            <div class="max-w-xs">
              <label
                for="wallet"
                class="block text-sm font-medium text-gray-700"
              >
                Фильтр:
              </label>
              <div class="mt-1 relative rounded-md shadow-md">
                <input
                  v-model="filter"
                  type="text"
                  name="wallet"
                  id="wallet"
                  class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4 w-[99.9%] h-[99.9%]': selectedTicker === t
            }"
            class="bg-white items-end overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div
              :class="{ 'bg-red-100': t.price === undefined }"
              class="px-4 py-5 sm:p-6 text-center"
            >
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }} - USD
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ formatPrice(t.price) }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-start justify-center font-medium w-full h-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <trash-svg />
              Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <!-- graph -->
      <!-- v-if="selectedTicker && selectedTicker.price !== undefinedPriceText" -->
      <section
        v-if="selectedTicker && selectedTicker.price !== undefinedPriceText"
        class="relative"
      >
        <h3
          class="text-lg leading-6 font-medium text-gray-900 my-8"
          ref="graph"
        >
          {{ selectedTicker.name }} - USD
        </h3>
        <div
          class="flex items-end border-gray-600 border-b-4 border-l-4 h-64 rounded-lg"
        >
          <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            :style="{ height: `${bar}%`, width: `${barWidth}px` }"
            class="bg-transparent border-4 border-purple-800 rounded-lg"
            ref="bar"
          ></div>
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <cross-svg />
        </button>
      </section>
      <!---->
    </div>
  </div>
</template>

<script type="module">
import { getCoinsNames, subscribeToTicker, unsubscribeFromTicker } from "./api";
import AddTicker from "./components/AddTicker.vue";
import CrossSvg from "./components/CrossSvg.vue";
import TrashSvg from "./components/TrashSvg.vue";
import LoadingBar from "./components/LoadingBar.vue";

export default {
  components: {
    AddTicker,
    CrossSvg,
    TrashSvg,
    LoadingBar
  },
  data() {
    return {
      filter: "",
      tickers: [],
      selectedTicker: null,
      coinsSearch: [],
      coinsNames: [],
      undefinedPriceText: "-",
      loadingPriceText: "...",
      errorVisible: false,
      isLoading: true,
      page: 1,
      graph: [],
      maxGraphElements: 1,
      barWidth: 32
    };
  },
  methods: {
    //Graph
    calculateMaxGraphElements() {
      if (!this.$refs.graph) return;
      this.maxGraphElements = this.$refs.graph.clientWidth / this.barWidth; //this.$refs.bar[0]?.clientWidth
    },
    ///
    updateTicker(tickerName, price) {
      this.tickers
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
          t.price = price;
          if (t === this.selectedTicker) {
            this.graph.push(price);
            //fix to slice
            while (this.graph.length > this.maxGraphElements) {
              this.graph.shift();
            }
          }
        });
      //console.table(this.tickers);
    },
    formatPrice(price) {
      if (
        price === this.undefinedPriceText ||
        price === this.loadingPriceText
      ) {
        return price;
      }
      try {
        return price > 1 ? price.toFixed(2) : price.toPrecision(2);
      } catch {
        return this.loadingPriceText;
      }
    },
    handleAdd(name) {
      this.addByName(name);
      this.coinsSearch = [];
      if (this.errorVisible) return;
      this.tickerInput = "";
    },
    handleDelete(tickerToRemove) {
      if (tickerToRemove === this.selectedTicker) this.selectedTicker = null;
      this.tickers = this.tickers.filter((t) => t !== tickerToRemove);
      unsubscribeFromTicker(tickerToRemove.name);
    },
    autocompleteAdd(name) {
      this.addByName(name);
    },
    addByName(name) {
      const upperName = name.toUpperCase();
      if (this.ticerIsUncorrect(upperName)) {
        this.errVisible = true;
        return;
      }
      const currentTicker = {
        name: upperName,
        price: this.loadingPriceText
      };
      this.tickers = [currentTicker, ...this.tickers];
      this.ticker = "";
      this.filter = "";
      subscribeToTicker(currentTicker.name, (newPrice) => {
        this.updateTicker(currentTicker.name, newPrice);
      });
    },
    select(ticker) {
      this.selectedTicker = ticker;
    },
    ticerIsUncorrect(tickerIn) {
      let result = false;
      this.tickers.forEach((ticker) => {
        if (ticker.name === tickerIn) result = true;
      });
      return result;
    },
    loadUrlSaves() {
      const windowData = Object.fromEntries(
        new URL(window.location).searchParams.entries()
      );
      const VALID_KEYS = ["filter", "page"];
      VALID_KEYS.forEach((key) => {
        if (windowData[key]) this[key] = windowData[key];
      });
    },
    loadTicersData() {
      const tickersData = localStorage.getItem("capp-list");
      if (tickersData) {
        this.tickers = JSON.parse(tickersData);
        this.tickers.forEach((ticker) => {
          subscribeToTicker(ticker.name, (newPrice) =>
            this.updateTicker(ticker.name, newPrice)
          );
        });
      }
    }
  },
  computed: {
    tooManyTickersAdded() {
      return this.tickers.length > 4;
    },
    filteredTickers() {
      return this.tickers.filter((ticer) =>
        ticer.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },
    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },
    startIndex() {
      return (this.page - 1) * 6;
    },
    endIndex() {
      return this.page * 6;
    },
    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },
    //Graph
    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      if (maxValue === minValue) return this.graph.map(() => 50);
      return this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },
    //
    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page
      };
    }
  },
  watch: {
    tickers() {
      localStorage.setItem(
        "capp-list",
        JSON.stringify(
          this.tickers.map((t) => (t = { ...t, price: this.loadingPriceText }))
        )
      );
    },
    selectedTicker() {
      this.graph = [];
      this.$nextTick().then(this.calculateMaxGraphElements);
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    tickerInput() {
      this.errVisible = false;
      if (this.tickerInput === "") {
        this.coinsSearch = [];
      } else {
        const correctCoins = this.coinsNames.filter((coin) =>
          coin.toLowerCase().includes(this.tickerInput.toLowerCase())
        );
        this.coinsSearch = correctCoins.filter(
          (coin) => correctCoins.indexOf(coin) <= 4
        );
      }
    },
    filter() {
      this.page = 1;
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    }
  },
  async created() {
    this.loadUrlSaves();
    this.loadTicersData();
    this.coinsNames = await getCoinsNames();
    this.isLoading = false;
  },
  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.calculateMaxGraphElements);
  }
};
</script>
