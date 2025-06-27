<template>
  <datatable 
    title="Roles"
    :columns="columns"
    ajax-uri="roles"
    :row-actions-buttons="rowActionsButtons"
    :action-buttons="actionBtns"
    :key="refreshKey"
  />
</template>

<script setup lang="ts">
import { TableColumnCtx } from "element-plus";
import { Close, EditPen } from "@element-plus/icons-vue";
import { DatatableDateFormatter } from "../../utils/date"
import Datatable, { ActionButton } from "../../components/Datatable.vue";
import { closeModal, showModal } from "../../utils/modals";
import { alertConfirmation } from "../../utils/alerts";
import api from "../../api";
import { toastDanger, toastSuccess } from "../../utils/toasts";
import { ref } from "vue";
import RoleForm from "../../components/RoleForm.vue";
import { FormData } from "../../interfaces/standard_form";
import { isEmpty } from "lodash";

const refreshKey = ref(Math.random() * 1000);

const columns: Array<Partial<TableColumnCtx<any>>> = [
  { label: "Name", prop: "name", width: 200, fixed: "left"},
  { label: "Display Name", prop: "display_name", width: 200,},
  { label: "Description", prop: "description", width: 300,},
  { label: "Registered On", prop: "created_at", width: 200,formatter: DatatableDateFormatter},
  { label: "Updated On", prop: "updated_at", width: 200,formatter: DatatableDateFormatter},
]

const rowActionsButtons: Array<ActionButton>  = [
  { label: "Edit", icon: EditPen, type: "primary", onClick: editRole },
  { label: "Delete", icon: Close, type: "danger", onClick: deleteRole }
]

const actionBtns: Array<ActionButton> = [
  { label: "Add New Role", icon: EditPen, type: "primary", onClick: createRole },
]

function createRole () {
  showModal("Add New Role", RoleForm, {
    onFinish: async (data: FormData) => {
      try {
        await api.postJson('roles', {
          ...data,
          name: data.display_name.replace(" ", "-")
        });
        closeModal();
        toastSuccess("A new role has been added successfully");
        refreshKey.value++
      } catch (e) {
        toastDanger("ERROR: Unable to add a new role, try again later.")
      }
    }
  });
}

function editRole (prop: any) {
  showModal("Edit Role", RoleForm, { 
    role: prop.row,
    onFinish: async (data: FormData) => {
      const modifiedRole: Record<string, any> = {};
      for(const key in data) {
        if(data[key] !== prop.row[key]) modifiedRole[key] = data[key];
      }

      if(!isEmpty(modifiedRole)) {
        await api.putJson(`roles/${prop.row.id}`, modifiedRole);
        refreshKey.value++;
        toastSuccess("The role has been updated successfully");
      }
      closeModal();
    } 
  });
}

async function deleteRole (prop: any) {
  if(await alertConfirmation("Are you sure you want to delete this role?")){
    try {
      await api.delete(`roles/${prop.row.id}`)
      toastSuccess("The role has been deleted successfully");
      refreshKey.value++;
    } catch (error) {
      toastDanger("An Error occurred! try again later");
    }
  }
}

</script>