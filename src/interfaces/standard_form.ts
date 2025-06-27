import { FormInstance, FormItemRule } from "element-plus";

export type FormFieldType =
| "text"
| "number"
| "email"
| "date"
| "datetime"
| "time"
| "week"
| "month"
| "year"
| "password"
| "select"
| "checkbox"
| "textarea"
| "location"
| "image"
| "repeatable";

export type FormData = Record<string, any>;
export type FormFields = Array<FormField | FormFields>;
export type FormValidationCallback = (
  error?: string | Error | undefined
) => void;
export type onFinishHandler = (data: FormData, form?: FormInstance) => Promise<boolean> | boolean;

export interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
  other?: Record<string, any>;
}

export interface RepeatableFieldConfig {
  fields: Array<{
    id: string;
    label: string;
    type: Exclude<FormFieldType, 'repeatable'>;
    span?: number;
    rules?: Array<FormItemRule>;
    props?: Record<string, any>;
    options?: Array<Option>;
    placeholder?: string;
    defaultValue?: any;
    onChange?: (value: any, index: number) => void;
  }>;
  itemLabel?: string;
  minItems?: number;
  maxItems?: number;
  initialItems?: number;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  rules?: Array<FormItemRule>;
  props?: Record<string, any>;
  options?: Array<Option>;
  remoteMethod?: (query: string, data: FormData) => Promise<Array<Option>>;
  defaultValue?: any | (() => any);
  repeatableConfig?: RepeatableFieldConfig; // Configuration for repeatable fields
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormFields;
  nextButtonText?: string;
  backButtonText?: string;
  submitButtonText?: string;
}

export type FormSteps = FormStep[];

export interface MapLocation {
  lat: number;
  lng: number;
}

