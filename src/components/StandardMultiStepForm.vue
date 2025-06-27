<template>
  <div class="multi-step-form">
    <!-- Step indicator -->
    <el-steps :active="currentStep" finish-status="success" simple>
      <el-step 
        v-for="(step, index) in steps" 
        :key="index" 
        :title="step.title" 
        :description="step.description"
      />
    </el-steps>

    <!-- Form content -->
    <div class="form-content">
      <standard-form
        :ref="handleFormRef"
        :key="currentStep"
        :fields="currentFields"
        :rules="currentRules"
        @submit="handleStepSubmit"
        hide-buttons
      >
        <template #footer>
          <div class="step-actions">
            <el-button 
              v-if="currentStep > 0" 
              @click="prevStep"
              size="default"
            >
              {{ currentStepConfig.backButtonText || 'Back' }}
            </el-button>
            
            <el-button 
              type="primary" 
              @click="nextStep"
              size="default"
            >
              {{ isLastStep 
                ? (currentStepConfig.submitButtonText || 'Submit') 
                : (currentStepConfig.nextButtonText || 'Next') 
              }}
            </el-button>
          </div>
        </template>
      </standard-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue';
import { ElSteps, ElStep, ElButton, FormInstance } from 'element-plus';
import StandardForm from './StandardForm.vue';
import type { FormSteps, FormFields, FormData,  } from '../interfaces/standard_form';

const props = defineProps({
  steps: {
    type: Array as PropType<FormSteps>,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'submit', data: FormData): void
}>();

interface StepFormRef {
  formRef: FormInstance,
  formData: FormData,
  validate: (callback?: (valid: boolean) => void) => void,
  submitForm: () => void,
}

const currentStep = ref(0);
const stepFormRef = ref<StepFormRef>();

const currentStepConfig = computed(() => props.steps[currentStep.value]);
const currentFields = computed(() => currentStepConfig.value.fields);
const currentRules = computed(() => {
  const rules: Record<string, any> = {};
  const extractRules = (fields: FormFields) => {
    fields.forEach(field => {
      if (Array.isArray(field)) {
        extractRules(field);
      } else if (field.rules) {
        rules[field.id] = field.rules;
      }
    });
  };
  extractRules(currentFields.value);
  return rules;
});

const isLastStep = computed(() => currentStep.value === props.steps.length - 1);
const isFirstStep = computed(() => currentStep.value === 0);

const formData = ref<FormData>({});

function handleFormRef(ref: any) {
  stepFormRef.value = ref;
}

function nextStep() {
  stepFormRef.value?.submitForm();
}

function prevStep() {
  if(!isFirstStep.value) currentStep.value--;
}

function handleStepSubmit(data: FormData) {
  formData.value[currentStepConfig.value.id] = data;
  if (isLastStep.value) {
    emit('submit', formData.value);
  } else {
    currentStep.value++;
  }
}
</script>

<style scoped>
.multi-step-form {
  width: 100%;
}

.form-content {
  margin-top: 20px;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>