import { ElNotification, NotificationParams } from "element-plus";

function createToastMessage (options?: NotificationParams) {
  return ElNotification(options);
}

export function toastSuccess(message: string, duration = 3000, dangerouslyUseHTMLString = false) {
  createToastMessage({
    message,
    duration,
    dangerouslyUseHTMLString,
    type: "success",
  })
}

export function toastWarning(message: string, duration = 3000, dangerouslyUseHTMLString = false) {
  createToastMessage({
    message,
    duration,
    dangerouslyUseHTMLString,
    type: "warning",

  })
}

export function toastDanger(message: string, duration = 3000, dangerouslyUseHTMLString = false) {
  createToastMessage({
    message,
    duration,
    dangerouslyUseHTMLString,
    type: "error",

  })
}