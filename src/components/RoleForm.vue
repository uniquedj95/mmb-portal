<template>
  <StandardForm
    :fields="fields"
    :data="role"
    :on-finish="onFinish"
    submit-label="Save Role"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FormFields, onFinishHandler } from "../interfaces/standard_form";
import {
  User as UserIcon,
} from '@element-plus/icons-vue'
import StandardForm from "./StandardForm.vue";

interface Role {
  id?: number;
  name: string;
  display_name: string;
  description?: string;
  permissions?: string[];
}

const props = defineProps<{ role?: Role; onFinish: onFinishHandler }>();

const fields = computed<FormFields>(() => [
  { 
    id: "name", 
    label: "Role Name", 
    type: "text",
    rules: [{ required: true, message: "Role name is required" }],
    props: { prefixIcon: UserIcon, placeholder: "Enter role name" },
    defaultValue: props.role?.name || ""
  },
  { 
    id: "display_name", 
    label: "Display Name", 
    type: "text",
    rules: [{ required: true, message: "Display name is required" }],
    props: { prefixIcon: UserIcon, placeholder: "Enter display name" },
    defaultValue: props.role?.display_name || ""
  },
  { 
    id: "description", 
    label: "Description", 
    type: "textarea",
    props: { placeholder: "Enter role description" },
    defaultValue: props.role?.description || ""
  },
]);
</script>
