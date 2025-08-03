<template>
  <standard-form :fields="fields" @submit="onFinish" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { FormFields, onFinishHandler } from "../interfaces/standard_form";
import {
  User as UserIcon,
  Lock as LockIcon,
  Message as MessageIcon,
  Position as RoleIcon,
} from '@element-plus/icons-vue'
import StandardForm from "./StandardForm.vue";
import { User } from "../composables/useAuth";
import { isEmpty } from "lodash";
import { isValidPassword } from "../utils/validate";

const props = defineProps<{ user?: User; onFinish: onFinishHandler }>();
const editMode = computed(() => !isEmpty(props.user));
const fields = computed<FormFields>(() => [
  { 
    id: "name", 
    label: "Name", 
    type: "text", 
    defaultValue: props.user?.name,
    rules: [{ required: true }],
    props: {
      placeholder: "Enter your full name",
      prefixIcon: UserIcon,
      autofocus: true
    },
  },
  { 
    id: "email",
    label: "Email Address",
    type: "text",
    defaultValue: props.user?.email,
    props: {
      placeholder: "Enter your email address",
      disabled: editMode.value,
      prefixIcon: MessageIcon
    },
    rules:  [
      { required: true },
      { type: "email" },
    ]
  },
  { 
    id: "password",
    label: "Password",
    type: "password",
    rules: [
      { required: !editMode.value },
      { validator: isValidPassword, trigger: 'blur'}
    ],
    props: {
      placeholder: "Enter your password",
      prefixIcon: LockIcon,
      showPassword: true,
    }
  },
  {
    id: 'roles',
    label: 'Role',
    type: 'text',
    rules: [{ required: true }],
    defaultValue: props.user?.role,
    props: {
      placeholder: "Enter user role",
      prefixIcon: RoleIcon,
    }
  }
])
</script>