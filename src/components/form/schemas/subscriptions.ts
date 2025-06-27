import { ref } from "vue";
import api from "../../../api";
import { Subscription } from "../../../interfaces";
import { FormFields } from "../../../interfaces/standard_form";
import { toOptions } from "../../../utils/arrays";
import { DISPLAY_DATE, STANDARD_DATE, toStandardDate } from "../../../utils/date";
import { toastDanger } from "../../../utils/toasts";
import dayjs from "dayjs";

/**
 * Generates form fields for subscription creation or editing.
 * 
 * @param {Subscription} subscription - The subscription object to populate the form fields with.
 * @returns {FormFields} An array of form fields for the subscription.
 */
export function getSubscriptionFields (subscription?: Subscription): FormFields {
  const startDate = ref(toStandardDate(subscription?.start_date));
  const endDate = ref(toStandardDate(subscription?.end_date));
  return [
    {
      id: "package",
      label: "Subscription Package",
      type: "select",
      rules: [{ required: true }],
      defaultValue: subscription?.package_id,
      props: {
        placeholder: "Select Subscription Package",
        filterable: true,
        clearable: true,
        remote: true,
        reserveKeyword: true,
      },
      remoteMethod: async (filter) => {
        try {
          const res = await api.getJson("packages", {
            filter,
            per_page: 20,
          });
          return toOptions(res.data);
        } catch (e) {
          toastDanger("Unable to load subscription packages");
          console.error("Unable to load subscription packages", e);
          return [];
        }
      },
    },
    {
      id: "start_date",
      label: "Start Date",
      type: "date",
      defaultValue: startDate.value,
      rules: [{ required: true }],
      props:{
        onChange: (value: string) => startDate.value = value,
        format: DISPLAY_DATE,
        valueFormat: STANDARD_DATE,
        placeholder: "Select Start Date",
        clearable: true,
      }
    },
    {
      id: "end_date",
      label: "End Date",
      type: "date",
      defaultValue: endDate.value,
      props: {
        format: DISPLAY_DATE,
        valueFormat: STANDARD_DATE,
        placeholder: "Select End Date",
        clearable: true,
      },
      rules: [
        { required: true },
        {
          validator: (_rule, value, callback) => {
            console.log("Validating end date", value, "using start date", startDate.value);
            if (dayjs(value).isBefore(startDate.value)) {
              callback(new Error("End date must be after start date"));
            } else {
              callback();
            }
          },
        },
      ],
    },
  ];
}