import { ElMessageBox, ElMessageBoxOptions } from "element-plus";

export async function alertConfirmation (message: string, opts?: ElMessageBoxOptions) {
  try {
    await ElMessageBox.confirm(message, opts);
    return true;
  } catch {
    return false;
  }
}