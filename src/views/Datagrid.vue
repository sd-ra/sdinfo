<template>
  <div>
    <table style="width:100%;">
      <td>
        <DxSelectBox
          :items="this.$parent.config.views"
          display-expr="title"
          value-expr="name"
          :value="this.$parent.current.view.name"
          @value-changed="getViewData"
        />
      <td v-if="this.view.name == 'v_OffenFuerFeinplan'">
        <table>
          <td>
            <DxDateBox 
              placeholder="Plandatum"
              v-model="planning.date" 
            />
            <DxTextBox 
              placeholder="Kastenanzahl"
              v-model="planning.boxQuantity" 
            />
          </td> 
          <td>
            <DxButton
                text="Einplanen"
                @click="planOn" 
            />
          </td>
        </table>
      </td>
      <td>
        <p>{{ message }}</p>
      </td>
    </table>
    <DxDataGrid v-if="dataSource.length > 0" 
      :data-source="dataSource"
      key-expr="Id"
      :column-auto-width="true"
      :show-borders="true"
      :selection="{ mode: getSelectionMode() }"
      @content-ready-action="initSelect"
      @selection-changed="selectionChanged"
      @editing-start="editStart"
      @row-updating="putRow"
    >
      <!-- Spalten aus der View generieren 
        :calculate-display-value="displayValue"
        :data-type="columnDataType(columnName)"
      -->
      <DxColumn v-for="columnName in Object.keys(dataSource[0])" :key="columnName"
        :data-field="columnName"
        :visible="isVisible(columnName)"
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
        :visible="true"
        :width="240"
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
  import { DxSelectBox, DxTextBox, DxDateBox, DxButton } from 'devextreme-vue';
  //import DxDateBox from 'devextreme-vue/date-box';
  import { DxDataGrid, DxColumn, DxColumnChooser, DxSorting, DxFilterRow, DxSearchPanel, DxStateStoring, DxEditing } from 'devextreme-vue/data-grid';
  import axios from 'axios';
  import deMessages from "devextreme/localization/messages/de.json";
  import { locale, loadMessages } from "devextreme/localization";
  //import Globalize from 'globalize';
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
      getDateOfISOWeek,
      DxTextBox,
      DxDateBox,
      DxButton
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
        isVisible(columnName) {
          return columnName != "Id"
        },
        /*
        columnDataType (columnName) {
          // wenn Datum
          if (this.dataSource.length > 0 && this.dataSource[0][columnName] && this.dataSource[0][columnName].toString().includes("00:00:00")) {
            return "date"
          }
        },
        */
        displayValue(row) {
          let result = row[this.dataField]
          if (result && result.toString().includes("00:00:00")) { // wenn Datumstring mit Uhrzeit hinten
            result = new Date(result).toLocaleDateString()
          }
          if (this.dataField != "Auftrag" && Number(result)) {
            result = Number(result).toLocaleString()
          }
          return result
        },
        sortDef(row) { // Für KW/Datums-Sortierung
          let sortValue = row[this.dataField];
          if (sortValue && (sortValue.length == 8 | sortValue.length == 10) && sortValue.substring(2, 3) == "." | sortValue.substring(5, 6) == ".") {  // wenn Termin-String (sortValue.length == 10 für Kennzeichen Wunschtermin (" W" dahinter)
            var date = sortValue.substring(6, 8);
            if (sortValue.substring(5, 6) == ".") { // wenn Tag oder Monat
                date += "-" + sortValue.substring(3, 5) + "-" + sortValue.substring(0, 2);
            } else {
                if (sortValue.substring(3, 5) == "KW") {
                    var d = getDateOfISOWeek(sortValue.substring(0, 2), date);
                    date += "-" + (d.getMonth() + 101).toString().substring(1, 3) + "-" + (d.getDate() + 101).toString().substring(1, 3);       
                }
            }
            sortValue = new Date("20" + date);
          } else {
            if (sortValue && sortValue.toString().includes("00:00:00")) { // wenn Datumstring mit Uhrzeit hinten
              sortValue = new Date(sortValue)
            }
          }
          return sortValue
        },
        selectedRows: [],
        initSelect: (e) => { // Datensatz-Auswahl aufheben, funktioniert noch nicht, ist aber egal
          e.component.selectRows([]); 
        },
        planning: {
          date: null,         // Plandatum
          boxQuantity: null,  // einzuplanende Kastenanzahl 
        },
        getSelectionMode() {
          if (this.view.name == "v_OffenFuerFeinplan") {
            return "multiple"
          } else {
            return "single"
          }
        },
        selectionChanged: (sel) => {
          this.selectedRows = sel.selectedRowsData;

          // Kastenanzahl vorschlagen, wen ausgwaählte Positionen die gleche offene Kastenazahl haben
          this.planning.boxQuantity = 0;
          if (this.selectedRows.length > 0) {
            this.planning.boxQuantity = this.selectedRows[0]["OffenKa"].toString();
            this.selectedRows.forEach(row => {
              if (this.planning.boxQuantity != row["OffenKa"]) {
                this.planning.boxQuantity = null
              }
            });
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
          .then((response) => ( 
            this.message = response.data
          )) 
        this.getData();
      },
      planOn() { // Einplanen
        if (this.selectedRows.length == 0) {
          alert("Bitte entsprechende Datensätze markieren.")
        } else {
          if (this.planning.date == null) {
            alert("Bitte ein Plandatum eingeben.")
          } else {
            if (this.planning.boxQuantity == null) {
              alert("Bitte eine Kastenanzahl eingeben.")
            } else {
              let sortNo = 0; // Fertigungs-Nr.
              this.selectedRows.forEach(row => {
                let date = this.planning.date.toLocaleDateString();
                axios
                  .post(this.$parent.config.serverurl + "/procedure/p_FeinplanPosAnfuegen " + row["Auftrag"] + ",'" + date + "'," + this.planning.boxQuantity + ",'" + row["Platte"] + "'," + sortNo , { userName: this.$parent.userName })
                  .then((response) => {
                    sortNo = response.data.recordset[0].FertNr;
                    this.getData();
                    this.planning.boxQuantity = null;
                  }) 
              });
            }  
          }  
        }  
      },
    }
  };
</script>
