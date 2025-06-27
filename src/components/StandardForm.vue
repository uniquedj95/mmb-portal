
<template>
  <el-form :model="formData" ref="formRef" :rules="rules" label-position="top">
    <keep-alive>
      <el-row :gutter="2">
        <standard-form-field
          v-for="field in fields"
          :field="field"
          :form-data="formData"
          @update:form-data="updateFormData"
        />
      </el-row>
    </keep-alive>
    <el-form-item class="padding-top" v-if="!hideButtons">
      <el-button type="warning" @click="clearForm" size="default">Clear</el-button>
      <el-button type="primary" @click="submitForm" size="default">Submit</el-button>
    </el-form-item>
    <slot name="footer"></slot>
  </el-form>
</template>

<script setup lang="ts">
import { ElForm, ElFormItem, ElButton, FormInstance, FormRules, ElRow } from 'element-plus';
import { PropType, reactive, ref } from "vue";
import StandardFormField from './StandardFormField.vue';
import isEmpty from 'lodash/isEmpty';
import { FormField, FormFields, FormData } from '../interfaces/standard_form';

const props = defineProps({
  fields: {
    type: Array as PropType<FormFields>,
    required: true
  },
  rules: {
    type: Object as PropType<FormRules<FormData>>,
  },
  hideButtons: {
    type: Boolean,
    default: false
  }
});

const formRef = ref<FormInstance>()
const formData = reactive(extractIds(props.fields));
const emit = defineEmits<{(e: 'submit', data: FormData, form?: FormInstance): void }>();

function extractIds(formFields: FormFields) {
  const result = {} as FormData;
  function processField(field: FormField | FormFields) {
    if ('id' in field) {
      result[field.id] = getDefaultValue(field);
    } else if (Array.isArray(field)) {
      field.forEach(processField);
    }
  }

  formFields.forEach(processField);

  return result;
}

function getDefaultValue(field: FormField) {
  return typeof field.defaultValue === "function"
    ? field.defaultValue()
    : field.defaultValue;
}

function sanitizeData(data: FormData) {
  const sanitizedData: FormData = {};
  Object.entries(data).forEach(([key, value]) => {
    if(typeof value === "number" || !isEmpty(value)) sanitizedData[key] = value
  });
  return sanitizedData;
}


function submitForm () {
  formRef.value?.validate((isValid) => {
    if(isValid) {
      emit("submit", sanitizeData({...formData}), formRef.value)
    }
  });
}

function clearForm () {
  formRef.value?.resetFields();
}

function updateFormData(newFormData: FormData) {
  // Update the formData object with the new values
  Object.keys(newFormData).forEach(key => {
    formData[key] = newFormData[key];
  });
}

defineExpose({
  formRef,
  formData,
  submitForm,
  clearForm
})

</script>

