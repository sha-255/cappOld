<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700">
          Тикер
        </label>
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="tickerInput"
            v-on:keyup.enter="handleAdd(this.tickerInput)"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <!-- <div
          v-if="coinsSearch.length > 0"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            v-for="(coin, idx) in coinsSearch"
            :key="idx"
            @click="autocompleteAdd(coin)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ coin }}
          </span>
        </div> -->
        <!-- <div v-if="errorVisible" class="text-sm text-red-600">
          Такой тикер уже добавлен
        </div> -->
      </div>
    </div>
    <add-button @click="handleAdd(this.tickerInput)" :disabled="disabled" />
  </section>
</template>

<script>
import AddButton from "./AddButton.vue";

export default {
  components: {
    AddButton
  },
  props: {
    disabled: {
      type: Boolean,
      reqired: false,
      default: false
    }
  },
  emits: {
    "add-ticker": (value) => typeof value === "string" && value.length > 0
  },
  data() {
    return { tickerInput: "" };
  },
  methods: {
    handleAdd(name) {
      if (this.tickerInput.length === 0) return;
      this.$emit("add-ticker", name);
      this.coinsSearch = [];
      //if (this.errorVisible) return;
      this.tickerInput = "";
    }
  }
};
</script>
