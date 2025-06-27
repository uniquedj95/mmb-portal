<template>
  <div class="repeatable-input-set">
    <div class="input-set">
      <div v-for="(item, index) in items" :key="index">
        <el-row :gutter="20">
          <el-col :span="21">
            <el-row :gutter="20">
              <el-col
                v-for="(field, fieldIndex) in fields"
                :key="field.id"
                :span="
                  field.span ||
                  (fieldIndex === fields.length - 1 && items.length === 1
                    ? field.span - 4 || 20
                    : field.span || 24)
                "
              >
                <el-form-item
                  :label="field.label"
                  :prop="`${baseId}.${index}.${field.id}`"
                  :rules="field.rules"
                >
                  <component
                    size="large"
                    :is="getComponent(field.type)"
                    :type="field.type !== 'select' ? field.type : ''"
                    :remote-method="handleRemoteSearch"
                    v-model="localModelValue[`${baseId}.${index}.${field.id}`]"
                    v-bind="field.props || {}"
                    :placeholder="field.placeholder"
                    @change="(val) => handleFieldChange(index, field.id, val)"
                  >
                    <template v-if="field.type === 'select'">
                      <el-option
                        v-for="option in field.options"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </template>
                  </component>
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
  
          <el-col :span="2" class="action-buttons">
            <!-- Delete button for all items -->
            <el-button
              type="danger"
              circle
              :icon="Delete"
              @click="removeItem(index)"
              :disabled="items.length <= 1"
              size="small"
            />
  
            <!-- Add button only for the last item or if there's only one item -->
            <el-button
              v-if="index === items.length - 1"
              type="primary"
              circle
              :icon="Plus"
              @click="addItem"
              :disabled="items.length >= props.maxItems"
              size="small"
            />
          </el-col>
        </el-row>
        <!-- <el-divider v-if="index < items.length - 1" /> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, watch } from "vue";
import { Delete, Plus } from "@element-plus/icons-vue";
import {
  ElButton,
  ElRow,
  ElCol,
  ElFormItem,
  ElDivider,
  ElOption,
} from "element-plus";
import { FormData, FormFieldType } from "../../interfaces/standard_form";

export interface RepeatableField {
  id: string;
  label: string;
  type: FormFieldType;
  span?: number;
  rules?: any[];
  props?: Record<string, any>;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  defaultValue?: any;
  onChange?: (value: any, index: number) => void;
}

const props = defineProps({
  modelValue: {
    type: Object as PropType<FormData>,
    required: true,
  },
  baseId: {
    type: String,
    required: true,
  },
  fields: {
    type: Array as PropType<RepeatableField[]>,
    required: true,
  },
  itemLabel: {
    type: String,
    default: "Item",
  },
  minItems: {
    type: Number,
    default: 1,
  },
  maxItems: {
    type: Number,
    default: 10,
  },
  initialItems: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "item-added",
  "item-removed",
  "field-changed",
]);

// Create a computed local copy of the model value
const localModelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Track the items
const items = ref<{ index: number }[]>([]);

// Initialize items
const initializeItems = () => {
  items.value = [];
  for (let i = 0; i < props.initialItems; i++) {
    addItem();
  }
};

// Add a new item
const addItem = () => {
  if (items.value.length >= props.maxItems) {
    return;
  }

  const newIndex = items.value.length;
  items.value.push({ index: newIndex });

  // Initialize form data for the new item
  const updatedModelValue = { ...localModelValue.value };

  props.fields.forEach((field) => {
    const fieldKey = `${props.baseId}.${newIndex}.${field.id}`;
    const defaultValue =
      field.defaultValue !== undefined ? field.defaultValue : "";
    updatedModelValue[fieldKey] = defaultValue;
  });

  // Update the model value
  localModelValue.value = updatedModelValue;

  emit("item-added", newIndex);
};

// Remove an item
const removeItem = (index: number) => {
  if (items.value.length <= props.minItems) {
    return;
  }

  items.value.splice(index, 1);

  // Remove form data for the removed item
  const updatedModelValue = { ...localModelValue.value };
  props.fields.forEach((field) => {
    delete updatedModelValue[`${props.baseId}.${index}.${field.id}`];
  });

  // Reindex remaining items
  for (let i = index; i < items.value.length; i++) {
    props.fields.forEach((field) => {
      const oldKey = `${props.baseId}.${i + 1}.${field.id}`;
      const newKey = `${props.baseId}.${i}.${field.id}`;

      if (updatedModelValue[oldKey] !== undefined) {
        updatedModelValue[newKey] = updatedModelValue[oldKey];
        delete updatedModelValue[oldKey];
      }
    });
  }

  // Update indices
  items.value.forEach((item, i) => {
    item.index = i;
  });

  // Update the model value
  localModelValue.value = updatedModelValue;

  emit("item-removed", index);
};

// Handle field change
const handleFieldChange = (index: number, fieldId: string, value: any) => {
  const field = props.fields.find((f) => f.id === fieldId);
  if (field && field.onChange) {
    const changes = field.onChange(value, index);

    // If the onChange handler returns an object with changes, apply them
    if (changes && typeof changes === "object") {
      const updatedModelValue = { ...localModelValue.value };

      // Apply each change to the model
      Object.entries(changes).forEach(([changeFieldId, changeValue]) => {
        updatedModelValue[`${props.baseId}.${index}.${changeFieldId}`] =
          changeValue;
      });

      // Update the model value
      localModelValue.value = updatedModelValue;
    }
  }

  emit("field-changed", { index, fieldId, value });
};

// Handle remote search for select fields
const handleRemoteSearch = (query: string) => {
  // This is a placeholder function since we're not using remote search in this component
  // But it's referenced in the template, so we need to define it
  console.log("Remote search query:", query);
  return [];
};

// Get component based on field type
const getComponent = (type: FormFieldType) => {
  switch (type) {
    case "checkbox":
      return "el-checkbox";
    case "select":
      return "el-select";
    case "number":
      return "el-input-number";
    case "date":
    case "datetime":
    case "time":
    case "month":
    case "year":
      return "el-date-picker";
    default:
      return "el-input";
  }
};

// Initialize on mount
initializeItems();

// Expose methods
defineExpose({
  addItem,
  removeItem,
  items,
});
</script>

<style scoped>
.repeatable-input-set {
  width: 100%;
}

.input-set {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 8px;
  padding-bottom: 10px; /* Align with form inputs */
}
</style>
