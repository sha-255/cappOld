<template>
  <section class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8" ref="graph">
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
      ></div>
    </div>
    <button
      @click="$emit('graph-close')"
      type="button"
      class="absolute top-0 right-0"
    >
      <cross-svg />
    </button>
  </section>
</template>
<script>
import CrossSvg from "./CrossSvg.vue";

export default {
  components: {
    CrossSvg
  },
  props: {
    selectedTicker: {
      reqired: false,
      default: null
    },
    barWidth: {
      type: Number,
      reqired: false,
      default: 32
    }
  },
  emits: {
    "graph-close": null
  },
  data() {
    return {
      graph: [],
      maxGraphElements: 1
    };
  },
  methods: {
    calculateMaxGraphElements() {
      if (!this.$refs.graph) return;
      this.maxGraphElements = this.$refs.graph.clientWidth / this.barWidth;
    }
  },
  computed: {
    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      if (maxValue === minValue) return this.graph.map(() => 50);
      return this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    }
  }
};
</script>
