import * as yup from "yup";

yup.setLocale({
  mixed: {
    required: "mixed.required",
    notType: "mixed.notType",
    oneOf: "mixed.oneOf",
  },
  string: {
    min: ({ min }) => ({ key: "string.min", values: { min } }),
    max: ({ max }) => ({ key: "string.max", values: { max } }),
    length: ({ length }) => ({ key: "string.length", values: { length } }),
    email: "string.email",
    matches: "string.matches",
  },
  date: {
    max: ({ max }) => ({ key: "date.max", values: { max } }),
  },
  array: {
    min: ({ min }) => ({ key: "array.min", values: { min, count: min } }),
    max: ({ max }) => ({ key: "array.max", values: { max, count: max } }),
  },
});

export default yup;
