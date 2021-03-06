<template>
  <div>
    <v-row no-gutters>
      <v-col md="12" class="d-flex">

        <btn-custom 
        title="Report all"
        :classProp="`warning mr-4`"
        v-on:action="reportTransactionSells()"
        type="export"
        >
        </btn-custom>

        <v-spacer></v-spacer>
        <v-btn class="mr-4" small color="primary" @click="filterEvent()"
          >Filter</v-btn
        >
        <v-btn small color="success" @click="clearSearch()">Clear</v-btn>
      </v-col>
    </v-row>
    <v-row no-gutters class="align-center pb-6">
      <v-col md="3" cols="12" class="pr-6">
        <v-menu
          :close-on-content-click="true"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="formatStartDate"
              label="Start date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              v-on="on"
              readonly
            ></v-text-field>
          </template>
          <v-date-picker v-model="filter.startDate" no-title></v-date-picker>
        </v-menu>
      </v-col>
      <v-col md="3" cols="12" class="pr-6">
        <v-menu
          :close-on-content-click="true"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="formatEndDate"
              label="End date"
              hint="MM/DD/YYYY format"
              persistent-hint
              prepend-icon="event"
              v-on="on"
              readonly
            ></v-text-field>
          </template>
          <v-date-picker v-model="filter.endDate" no-title></v-date-picker>
        </v-menu>
      </v-col>
      <v-spacer></v-spacer>
      <v-col md="3" class="pr-6">
        <v-select
          :items="months"
          label="Month"
          class="ml-4"
          v-model="filter.month"
        ></v-select>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import HTTP from "@/services/http";
import Transaction from "@/store/models/transaction";

export default {
  data() {
    return {
      filter: {
        startDate: "",
        endDate: "",
        month: ""
      },
      currentPage: 1,
      itemsPerPage: 5
    };
  },

  methods: {
    clearSearch() {
      this.filter = {
        startDate: "",
        endDate: "",
        month: ""
      };

      this.filterEvent();
    },

    async reportTransactionSells() {
      var loader = this.$loading.show();
      var filter = this.filter;
      var res = await HTTP.get("/report/sell", {
        params: {
          startDate: filter.startDate,
          endDate: filter.endDate,
          month: filter.month
        },

        responseType: "arraybuffer",
        headers: {
          Accept: "application/pdf"
        }
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `report.pdf`;
      link.click();
      loader.hide();
    },

    async filterEvent() {
      await Transaction.delete(transaction => {
        return transaction.mode === "buy";
      });
      const res = await Transaction.api().fetchSellPaging(
        this.currentPage,
        this.itemsPerPage,
        this.filter.startDate,
        this.filter.endDate,
        this.filter.month
      );

      if (res.response.status === 200) {
        Transaction.insert({ data: res.response.data.data });
        this.pageCounts = res.response.data.pageCounts;
      }
    }
  },

  computed: {
    days() {
      return Array.from(Array(31), (_, i) => i + 1);
    },

    months() {
      return Array.from(Array(12), (_, i) => i + 1);
    },

    formatStartDate() {
      return this.$helper.formatDate(this.filter.startDate);
    },

    formatEndDate() {
      return this.$helper.formatDate(this.filter.endDate);
    }
  }
};
</script>
