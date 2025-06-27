<template>
  <div>
    <el-upload
      drag
      class="image-uploader"
      accept="image/*"
      :show-file-list="false"
      :auto-upload="false"
      :on-change="handleImageChange"
    >
      <template #default>
        <img v-if="preview" :src="preview" class="image-preview" />
        <div v-else class="upload-placeholder">
          <el-icon><Upload /></el-icon>
          <div>Click or Drag image to upload</div>
        </div>
      </template>
    </el-upload>

    <el-dialog v-model="cropDialogVisible" title="Crop Image" width="700px">
      <cropper
        class="cropper"
        :src="rawImage"
        :stencil-props="{ aspectRatio }"
        :auto-zoom="true"
        @change="updateCroppedPreview"
        ref="cropperRef"
      />
      <template #footer>
        <el-button @click="cropDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="applyCrop">Apply</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElUpload, ElButton, ElDialog, ElIcon } from "element-plus";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import { Upload } from "@element-plus/icons-vue";
import { toastDanger } from "../../utils/toasts";
import api from "../../api";

const model = defineModel<string | null>({
  type: String,
  default: "",
});

const props = defineProps<{ mode?: "avatar" | "cover" }>();
const aspectRatio = computed(() => (props.mode === "cover" ? 800 / 530 : 1));

const cropDialogVisible = ref(false);
const rawImage = ref<string | null>(null);
const preview = ref<string | null>(null);
const cropperRef = ref();

function handleImageChange(file: any) {
  const reader = new FileReader();
  reader.onload = () => {
    rawImage.value = reader.result as string;
    cropDialogVisible.value = true;
  };
  reader.onerror = () => toastDanger("Failed to load image");
  reader.readAsDataURL(file.raw);
}

function updateCroppedPreview() {
  const canvas = cropperRef.value?.getResult()?.canvas;
  if (canvas) {
    preview.value = canvas.toDataURL("image/jpeg");
  }
}

function applyCrop() {
  const canvas = cropperRef.value?.getResult()?.canvas;
  if (!canvas) return;

  canvas.toBlob(
    async (blob: Blob) => {
      try {
        if (!blob) throw new Error("Failed to crop image");
        const data = await api.uploadBlob(blob);
        if (!data.path) throw new Error("Failed to upload image");
        preview.value = URL.createObjectURL(blob);
        model.value = data.path;
        cropDialogVisible.value = false;
      } catch (error) {
        toastDanger("Failed to upload image");
        console.error(error);
      }
    },
    "image/jpeg",
    0.85
  );
}
</script>

<style scoped>
.image-uploader {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.image-uploader:hover {
  border-color: #409eff;
}

.image-preview {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 6px;
}

.upload-placeholder {
  text-align: center;
  color: #c0c4cc;
  font-size: 14px;
}

.cropper {
  width: 100%;
  height: 500px;
}
</style>
