import { Option } from "../interfaces/standard_form";

/**
 * Converts an array of objects into an array of options suitable for form selections.
 * 
 * @param {Array<any>} arr - The array of objects to be converted.
 * @param {string} [label="name"] - The property of the object to be used as the label in the option. Defaults to "name".
 * @param {string} [value="id"] - The property of the object to be used as the value in the option. Defaults to "id".
 * @returns {Array<Option>} An array of options with 'label' and 'value' properties.
 */
export function toOptions(arr: Array<any>, label: string = "name", value: string = "id"): Array<Option> {
  return arr.map(i => ({
    label: typeof i === "string" ? i : i[label],
    value: typeof i === "string" ? i : i[value],
  }));
}
