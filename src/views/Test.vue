<template>
  <div>
    <DxDataGrid
      :data-source="payments"
      key-expr="PaymentId"
    >
      <DxEditing
        :allow-updating="true"
        :popup="editPopupOptions"
        mode="popup"
      />
      <DxFilterRow
        :visible="true"
        apply-filter="auto"
      />

     <DxColumn v-for="colName in Object.keys(payments[0])" :key="colName" 
        :data-field="colName"
        :calculate-sort-value="sortDef"
        :calculate-display-value="displayValue"
        data-type="number"
      />


    </DxDataGrid>
    <div class="options">
      <div class="caption">Options</div>
      <div class="option">
        <label for="selectInput">Language</label>
        <DxSelectBox
          :data-source="locales"
          :value="locale"
          :input-attr="selectBoxInputAttr"
          value-expr="Value"
          display-expr="Name"
          @valueChanged="changeLocale($event)"
        />
      </div>
    </div>

  </div>
</template>
<script>

import { DxDataGrid, DxColumn, DxEditing, DxFilterRow } from 'devextreme-vue/data-grid';
import DxSelectBox from 'devextreme-vue/select-box';

import * as deMessages from 'devextreme/localization/messages/de.json';
import * as ruMessages from 'devextreme/localization/messages/ru.json';

import { locale, loadMessages, formatMessage } from 'devextreme/localization';

import service from './testdata.js';

export default {
  components: {
    DxSelectBox,
    DxDataGrid,
    DxColumn,
    DxEditing,
    DxFilterRow
  },
  data() {
    return {
      locale: null,
      locales: service.getLocales(),
      payments: service.getPayments(),
      editPopupOptions: { width:700, height:345 },
      amountEditorOptions: { format: 'currency', showClearButton: true },
      selectBoxInputAttr: { id: 'selectInput' },
      displayValue(row) {
          if (this.dataField == "Plandatum") {
            return (row[this.dataField]).toString().substring(0, 10)
          }
          else {
            return row[this.dataField]
          }
        },
        sortDef(row) { // Sotier-Definition
          let sortValue = row[this.dataField];
            return sortValue;
        }
    };
  },
  created() {
    this.locale = this.getLocale();
    this.initMessages();
    locale('de');
  },
  methods: {
    getLocale() {
      const locale = sessionStorage.getItem('locale');
      return locale != null ? locale : 'en';
    },
    setLocale(locale) {
      sessionStorage.setItem('locale', locale);
    },
    initMessages() {
      loadMessages(deMessages);
      loadMessages(ruMessages);
      loadMessages(service.getDictionary());
    },
    changeLocale(e) {
      this.setLocale(e.value);
      window.location.href = window.location.href;
    },
    formatMessage: formatMessage
  }
};
</script>
<style scoped>

.options {
    padding: 20px;
    background-color: rgba(191, 191, 191, 0.15);
    margin-top: 20px;
}

.option {
    margin-top: 10px;
}

.caption {
    font-size: 18px;
    font-weight: 500;
}

.option > label {
    margin-right: 10px;
}

.option > .dx-selectbox {
    display: inline-block;
    vertical-align: middle;
}
</style>
