import { ElMessageBox, ElMessageBoxOptions, FormInstance } from "element-plus";
import { h } from "vue";
import StandardFormVue from "../components/StandardForm.vue";
import type {
  FormData,
  FormFields,
  FormSteps,
  onFinishHandler,
} from "../interfaces/standard_form";
import StandardMultiStepForm from "../components/StandardMultiStepForm.vue";

type ComponentProps = Record<string, any>;

export type ModalOptions = Omit<ElMessageBoxOptions, "message">;

export function showModal(
  title: string,
  component: any,
  componentProps?: ComponentProps,
  options?: ModalOptions
) {
  ElMessageBox({
    title,
    message: () => h(component, componentProps),
    ...options,
    showConfirmButton: options?.showConfirmButton ?? false,
    showCancelButton: options?.showCancelButton ?? false,
    draggable: options?.draggable ?? true,
  });
}

export function popupForm(
  title: string,
  fields: FormFields,
  onFinish: onFinishHandler,
  options?: ModalOptions
) {
  return showModal(title, StandardFormVue, {
    fields,
    onSubmit: async (data: FormData, form: FormInstance) => {
      if(await onFinish(data, form)) closeModal();
    },
  }, options);
}

export function popupMultiStepForm(
  title: string,
  steps: FormSteps,
  onFinish: onFinishHandler,
  options?: ModalOptions
) {

  return showModal(title, StandardMultiStepForm, {
    steps,
    onSubmit: async (data: FormData, form: FormInstance) => {
      if(await onFinish(data, form)) closeModal();
    },
  }, options);
}

export function closeModal() {
  return ElMessageBox.close();
}
