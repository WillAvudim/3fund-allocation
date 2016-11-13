<template lang="pug">
#root
  fieldset
    legend Funds
    table
      tr
        td Available Funds:
        td
          input(v-model="available_funds")
      tr
        td Reserve:
        td
          input(v-model="reserve")
  table
    tr
      th Fund
      th Invested
      th Allocation
    tr
      td VBIAX
      td
        input(v-model="vbiax")
      td(v-on:click="ToClipboard(distributions[0])") {{distributions[0]}}
    tr
      td VEIRX
      td
        input(v-model="veirx")
      td(v-on:click="ToClipboard(distributions[1])") {{distributions[1]}}
    tr
      td VASGX
      td
        input(v-model="vasgx")
      td(v-on:click="ToClipboard(distributions[2])") {{distributions[2]}}
  hr
  textarea#clipboard
</template>

<script>
import RunAllInvestmentRounds from "./distribution.js";
import $ from "jquery";

export default {
  name: 'app',
  data () {
    return {
      available_funds: "",
      reserve: "12,000",
      vbiax: "",
      veirx: "",
      vasgx: ""
    }
  },
  computed: {
    distributions: function() {
      // Check if all numbers present.
      function CorrectNumber(text) {
        return text.length > 0 && !isNaN(Number(text.replace(",", "")));
      }
      if (!CorrectNumber(this.available_funds) ||
          !CorrectNumber(this.reserve) ||
          !CorrectNumber(this.vbiax) ||
          !CorrectNumber(this.veirx) ||
          !CorrectNumber(this.vasgx)) {
        return [0, 0, 0];
      }

      function GetNumber(text) {
        return Number(text.replace(",", ""));
      }

      // Check that it can converge.
      const total_available = GetNumber(this.available_funds) - GetNumber(this.reserve);
      if (total_available <= 0) {
        return [-1, -1, -1];
      }

      // Run convergence.
      const funds = [GetNumber(this.vbiax), GetNumber(this.veirx), GetNumber(this.vasgx)];
      return RunAllInvestmentRounds(total_available, funds);
    }
  },
  methods: {
    ToClipboard: function(str) {
      $("#clipboard").show();
      var sandbox = $('#clipboard').val(str).select();
      document.execCommand('copy');
      sandbox.val('');
      $("#clipboard").hide();
    }
  },
  mounted: function() {
    $("#clipboard").hide();
  }
}
</script>

<style scoped>
#root {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: left;
  color: #2c3e50;
  margin: 10px;
}
</style>
