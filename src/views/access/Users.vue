<template>
  <datatable 
    title="Users"
    :columns="columns"
    ajax-uri="users"
    :row-actions-buttons="rowActionsButtons"
    :action-buttons="actionBtns"
    :key="refreshKey"
  />
</template>

<script setup lang="ts">
import { User, UserPermission } from "../../composables/useAuth";
import { TableColumnCtx } from "element-plus";
import { Close, EditPen, Minus } from "@element-plus/icons-vue";
import { DatatableDateFormatter } from "../../utils/date"
import { isEmpty } from "lodash";
import Datatable, { ActionButton } from "../../components/Datatable.vue";
import { closeModal, showModal } from "../../utils/modals";
import UserForm from "../../components/UserForm.vue";
import { alertConfirmation } from "../../utils/alerts";
import api from "../../api";
import { toastDanger, toastSuccess } from "../../utils/toasts";
import { FormData } from "../../interfaces/standard_form";
import { ref } from "vue";

const refreshKey = ref(Math.random() * 1000);

const columns: Array<Partial<TableColumnCtx<any>>> = [
  { label: "Name", prop: "name", width: 200, fixed: "left"},
  { label: "Email Address", prop: "email", width: 200,},
  { label: "Verified", prop: "verified_at", width: 80, formatter: verifiedAtFormatter},
  { label: "Is Active", prop: "deactivated_at", width: 80,formatter: activeFormatter },
  { label: "Roles", prop: "roles", width: 200, formatter: permissionsFormatter },
  { label: "Registered On", prop: "created_at", width: 200,formatter: DatatableDateFormatter},
  { label: "Updated On", prop: "updated_at", width: 200,formatter: DatatableDateFormatter},
]

const rowActionsButtons: Array<ActionButton>  = [
  { label: "Edit", icon: EditPen, type: "primary", onClick: editUser },
  { label: "Deactivate", icon: Minus, type: "warning", onClick: (prop: any) => console.log(prop)},
  { label: "Delete", icon: Close, type: "danger", onClick: deleteUser }
]

const actionBtns: Array<ActionButton> = [
  { label: "Add New User", icon: EditPen, type: "primary", onClick: createUser }
]

function verifiedAtFormatter(_row: User, _column: TableColumnCtx<any>, cellValue: string | null){
  return isEmpty(cellValue) ? "No" : "Yes";
}

function activeFormatter(_row: User, _column: TableColumnCtx<any>, cellValue: string | null){
  return isEmpty(cellValue) ? "Yes" : "No";
}

function permissionsFormatter(_row: User, _column: TableColumnCtx<any>, cellValue: Array<UserPermission>) {
  return cellValue.map(({ display_name }) => display_name).join();
}

function createUser () {
  showModal("Add New User", UserForm, {
    onFinish: async (data: FormData) => {
      try {
        await api.postJson('register', {...data, password_confirmation: data.password });
        closeModal();
        toastSuccess("The new user has been added successfully!");
        refreshKey.value++;
      } catch (e) {
        toastDanger("ERROR: Unable to add a new user, try again later");
      }
    }
  });
}

function editUser (prop: any) {
  showModal("Edit User", UserForm, { 
    user: prop.row,
    onFinish: async (data: FormData) => {
      const modifiedUser: Record<string, any> = {};
      for(const key in data) {
        if(data[key] !== prop.row[key]) modifiedUser[key] = data[key];
      }

      if(!isEmpty(modifiedUser)) {
        await api.putJson(`users/${prop.row.id}`, modifiedUser);
        refreshKey.value++;
        toastSuccess("The user has been updated successfully");
      }
      closeModal();
    } 
  });
}

async function deleteUser (prop: any) {
  if(await alertConfirmation("Are you sure you want to delete this user?")){
    try {
      await api.delete(`users/${prop.row.id}`)
      toastSuccess("User has been deleted successfully");
      refreshKey.value++;
    } catch (error) {
      toastDanger("An Error occurred! try again later");
    }
  }
}

</script>