<template>
  <template v-if="Array.isArray(field)">
    <el-col v-for="(subField, i) in field" :key="i" :span="Math.floor(24/field.length)">
      <standard-form-field  :field="subField" :form-data="formData" />
    </el-col>
  </template>
  <el-col :span="24" v-else>
    <el-form-item :rules="field.rules" :prop="field.id" :label="field.label">
      <component
        v-if="field.type !== 'repeatable'"
        size="large"
        :is="getComponent(field.type)"
        :type="field.type !== 'select' ? field.type : ''"
        :remote-method="handleRemoteSearch"
        v-model="formData[field.id]"
        v-bind="field.props"
        style="width: 100%;"
      >
        <template v-if="field.type === 'select'">
          <el-option v-for="item in activeOptions" :key="item.value" v-bind="item" />
        </template>
      </component>

      <!-- Repeatable Input Set -->
      <repeatable-input
        v-else
        :model-value="formData"
        @update:model-value="updateFormData"
        :base-id="field.id"
        :fields="field.repeatableConfig?.fields || []"
        :item-label="field.repeatableConfig?.itemLabel || 'Item'"
        :min-items="field.repeatableConfig?.minItems || 1"
        :max-items="field.repeatableConfig?.maxItems || 10"
        :initial-items="field.repeatableConfig?.initialItems || 1"
      />
    </el-form-item>
  </el-col>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';
import { ElCol, ElFormItem, ElOption } from 'element-plus';
import { FormData, FormFieldType, FormFields, FormField, Option, RepeatableFieldConfig } from '../interfaces/standard_form';
import LocationPicker from './inputs/LocationPicker.vue';
import ImagePicker from './inputs/ImagePicker.vue';
import RepeatableInput from './inputs/RepeatableInput.vue';

const props = defineProps({
  field: {
    type: [Object, Array] as PropType<FormField | FormFields>,
    required: true,
  },
  formData: {
    type: Object as PropType<FormData>,
    default: () => ({}),
  }
});

const emit = defineEmits(['update:formData']);

// Method to update form data from repeatable input set
const updateFormData = (newFormData: FormData) => {
  emit('update:formData', newFormData);
};

const activeOptions = ref(initFieldOptions());

function initFieldOptions() {
  return !Array.isArray(props.field) &&
    props.field.type === 'select' &&
    props.field.options
    ? props.field.options
    : [];
}

async function handleRemoteSearch(query: string) {
  const field = props.field as FormField;
  if (field.props?.remote && typeof field.remoteMethod === "function") {
    activeOptions.value = await field.remoteMethod(query, props.formData);
  } else {
    activeOptions.value = field.options?.filter((cat: Option) =>
      cat.label.toLowerCase().includes(query.toLowerCase())
    ) ?? [];
  }
}

function getComponent(type: FormFieldType) {
  switch (type) {
    case 'checkbox':
      return 'ElCheckbox';
    case 'select':
      return 'ElSelect';
    case "date":
    case "datetime":
    case "time":
    case "month":
    case "year":
      return 'ElDatePicker';
    case 'location':
      return LocationPicker;
    case 'image':
      return ImagePicker;
    case 'repeatable':
      return RepeatableInput;
    default:
      return 'ElInput';
  }
}
</script>