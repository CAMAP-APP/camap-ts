import * as yup from 'yup';

export default yup.object().shape({
  NODE_ENV: yup
    .string()
    .oneOf(['development', 'production', 'test', 'provision'])
    .default('development'),

  FRONT_URL: yup.string().required(),
  FRONT_GRAPHQL_URL: yup.string().required(),

  CAMAP_HOST: yup.string().required(),

  MAPBOX_KEY: yup.string().required(),
});
