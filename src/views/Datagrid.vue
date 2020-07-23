<template>
  <div>
    <table style="width:100%;">
      <td>
        <DxSelectBox
          :items="this.$parent.config.views"
          display-expr="title"
          value-expr="name"
          :value="this.$parent.current.view.name"
          :width="400"
          @value-changed="getViewData"
        />
      </td>
      <td style="text-align:right">
        <p>{{ message }}</p>
      </td>
    </table>
    <DxDataGrid v-if="dataSource.length > 0" 
      :data-source="dataSource"
      key-expr="Id"
      column-auto-width="true"
      :show-borders="true"
      :selection="{ mode: getSelectionMode() }"
      @editing-start="editStart"
      @row-updating="putRow"
    >
     <DxColumn v-for="colName in Object.keys(dataSource[0])" :key="colName" 
        :data-field="colName"
        :visible="isVisible(colName)"
        :calculate-sort-value="sortDef"
        :calculate-cell-value="sortDef"
        :calculate-display-value="displayValue"
      />
      <DxColumnChooser
          :enabled="true"
          mode="select"
      />
      <DxSorting mode="multiple"/>
      <DxFilterRow :visible="true"/>
      <DxSearchPanel
        visible="true"
        width="240"
      />
      <!-- 
      <DxStateStoring
        enabled="true"
        type="localStorage"
        :storage-key="this.view.name"
      />
      -->
      <DxEditing
        :allow-updating="allowUpdating"
        mode="row"
      />
    </DxDataGrid>
  </div>
</template>

<script>

import { DxSelectBox } from 'devextreme-vue';
import { DxDataGrid, DxColumn, DxColumnChooser, DxSorting, DxFilterRow, DxSearchPanel, DxStateStoring, DxEditing } from 'devextreme-vue/data-grid';
import axios from 'axios';
import deMessages from "devextreme/localization/messages/de.json";
import { locale, loadMessages } from "devextreme/localization";
import getDateOfISOWeek from '../helper';
 

export default {
  components: {
    DxSelectBox,
    DxDataGrid,
    DxColumn,
    DxColumnChooser,
    DxSorting,
    DxFilterRow,
    DxSearchPanel,
    DxStateStoring,
    DxEditing,
    getDateOfISOWeek
  },
  created() {
    loadMessages(deMessages);
    locale("de");
  },
  data() {
    return {
      views: this.$parent.config.views,
      view: {},
      dataSource: [],
      message: "",
      allowUpdating: false,
      url: this.$parent.config.serverurl + "/view/",
      isVisible(colName) {
        return colName != "Id"
      },
      /*
      calculateWitdth(colName) {
        return colName.length + "%" // bezogen auf Länge des Feldnamens 
      },
      */
      displayValue(row) {
        return row[this.dataField]
      },
      sortDef(row) {
        let sortValue = row[this.dataField];
        if (sortValue && (sortValue.length == 8 | sortValue.length == 10) && sortValue.substring(2, 3) == "." | sortValue.substring(5, 6) == ".") {  // wenn Termin-String (sortValue.length == 10 für Kennzeichen Wunschtermin (" W" dahinter)
          // Sortierung nach Datum oder KW
          var date = sortValue.substring(6, 8);
          if (sortValue.substring(5, 6) == ".") { // wenn Tag oder Monat
              date += "-" + sortValue.substring(3, 5) + "-" + sortValue.substring(0, 2);
          } else {
              if (sortValue.substring(3, 5) == "KW") {
                  var d = getDateOfISOWeek(sortValue.substring(0, 2), date);
                  date += "-" + (d.getMonth() + 101).toString().substring(1, 3) + "-" + (d.getDate() + 101).toString().substring(1, 3);       
              }
          }
          return new Date("20" + date);
        } else { 
          return sortValue;
        }
      },
      getSelectionMode() {
        if (this.view.name == "v_OffenFuerFeinplan") {
          return "multiple"
        } else {
          return "single"
        }
      },
      getStateStorage() {
        return "StateStorage" + this.view.name;
      },
      getData: () => {
        if (this.view.allowUpdating) {
          this.allowUpdating = this.view.allowUpdating.users.filter(u => u == this.$parent.userName).length > 0;
        }
        axios
          .get(this.url + this.view.name)
          .then(response => ( this.dataSource = response.data.recordset ))
      }
    };
  },
  mounted() {
    if (this.$parent.current.view.name) {
      this.view = this.$parent.current.view;
      this.getData();
      //this.getViewData(this.$parent.current.view);
    }
  },
  methods: {
    getViewData(e) {
      this.$parent.current.view = this.$parent.config.views.find(v => v.name == e.value);
      this.view = this.$parent.current.view;
      this.getData();
    },
    editStart() {
      this.message = this.view.allowUpdating.message;
    },
    putRow(e) {
      axios
        .put(this.url + this.view.name + "/" + e.key, { data: e.newData, userName: this.$parent.userName })
        .then(response => ( this.message = response.data )) 
      this.getData();
    }
  }

};
</script>
