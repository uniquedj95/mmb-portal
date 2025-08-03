<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { reactive, ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue'
import {
  ElContainer,
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElImage,
  ElLink,
  ElCheckbox
} from 'element-plus';
import { useRouter } from 'vue-router';
import { toastDanger, toastWarning } from '../utils/toasts';
import { BadEntityError } from '../api/errors';
import useAuth from '../composables/useAuth';

const formRef = ref<FormInstance>()
const { login } = useAuth();
const router = useRouter();
const form = reactive({ identifier: '', password: '' });
const loading = ref(false);
const rememberMe = ref(false);

const rules = reactive<FormRules<typeof form>>({
  identifier: [
    { required: true, message: "Email or phone number is required", trigger: 'blur' },
    { 
      validator: (_rule, value, callback) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!emailRegex.test(value) && !phoneRegex.test(value)) {
          callback(new Error('Please enter a valid email or phone number'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  password: [{ required: true, message: "Password is required", trigger: 'blur' }],
})

async function submitForm(formEl: FormInstance | undefined) {
  if (!formEl) return;

  formEl.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      await login(form.identifier, form.password, rememberMe.value);
      router.push('/');
    } catch (error) {
      if (error instanceof BadEntityError) {
        toastWarning('Invalid credentials');
      } else if (error instanceof Error) {
        toastDanger(error.message || "Unable to login");
      } else {
        toastDanger("Unable to login");
      }
      console.error(error);
    } finally {
      loading.value = false;
    }
  });
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.resetFields()
}

</script>

<template>
  <el-container class="outer-wrapper">
    <el-row class="inner-wrapper">
      <el-col :span="12" class="logo-section">
        <el-image class="logo" src="/assets/images/logo.png" />
        <h3>Mizu Micro Bank</h3>
        <p class="text-center">Admin Portal - Manage loans, transactions, and member accounts.</p>
      </el-col>
      <el-col :span="12" class="form-section">
        <h2>Admin Login</h2>
        <p>Welcome to Mizu Admin Portal!</p>
        <p>Please enter your credentials to access the admin dashboard</p>
        <el-form ref="formRef" :model="form" status-icon :rules="rules">
          <el-form-item prop="identifier">
            <el-input v-model="form.identifier" type="text" :prefix-icon="User" placeholder="Email or phone number" size="large" autofocus />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" show-password :prefix-icon="Lock" placeholder="Password" size="large"/>
          </el-form-item>
          <el-form-item>
            <el-col :span="18">
              <el-form-item>
                <el-checkbox v-model="rememberMe" label="Remember me" size="large" style="color: white"/>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button @click="resetForm(formRef)" link type="success">forget password</el-button>
              </el-form-item>
            </el-col>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm(formRef)"
              class="block mb-5"
              size="large"
              :loading="loading"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </el-button>
          </el-form-item>
        </el-form>
        <p>
          Don't have an account?
          <el-link type="success">contact your administrator</el-link>
        </p>
      </el-col>
    </el-row>
  </el-container>
</template>

<style scoped>
.outer-wrapper {
  background-image: url("/assets/images/bg.jpeg");
  height: 100vh;
  width: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inner-wrapper {
  width: max-content;
}

.form-section {
  background-color: rgb(42, 132, 184);
  padding: 2rem;
  opacity: 1;
  color: white;
}

.logo-section {
  background-color: white;
  opacity: 0.8;
  align-items: center;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.logo-section h3 {
  margin-bottom: 0.5rem;
}

.logo-section p {
  text-align: center;
  margin-top: 0;
}

.block {
  width: 100% !important;
}

.logo {
  width: 130px;
  height: auto;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>