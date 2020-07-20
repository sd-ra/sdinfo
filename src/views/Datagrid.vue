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
    <DxDataGrid
      :data-source="dataSource"
      key-expr="Id"
      :show-borders="true"
      @editing-start="editStart"
      @row-updating="putRow"
    >
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
      <DxStateStoring
        :enabled="true"
        type="localStorage"
        storage-key="getStateStorage"
      />
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
    DxEditing
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
