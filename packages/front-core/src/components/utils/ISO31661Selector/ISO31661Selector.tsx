import { Box, CircularProgress } from '@mui/material';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { Alert } from '@mui/material';
import Autocomplete, {
  AutocompleteProps,
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const FRANCE_ISO_3166_1 = 250;

export interface ISO_3166_1 {
  id: number;
  name: string;
  alpha2: string;
  alpha3: string;
}

export type ResultFormat = 'full-iso' | keyof ISO_3166_1;

type P = AutocompleteProps<{}, undefined, undefined, undefined>;

export interface ISO31661SelectorProps {
  defaultValue?: ISO_3166_1 | number | string;
  value: ISO_3166_1 | string | number;
  format?: ResultFormat;
  autocompleteProps?: Omit<
    P,
    | 'defaultValue'
    | 'options'
    | 'getOptionLabel'
    | 'getOptionSelected'
    | 'renderInput'
  >;
  textFieldProps?: TextFieldProps;
  onChange: (
    value: ISO_3166_1 | string | number | null,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

const URL = `${process.env.FRONT_URL}/data/<LOCALE>/iso-3166-1.json`;

const ISO31661Selector = ({
  defaultValue,
  format = 'full-iso',
  autocompleteProps,
  textFieldProps,
  onChange,
  value,
}: ISO31661SelectorProps) => {
  const { t } = useTranslation();
  const [loading, toggleLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [data, setData] = React.useState<ISO_3166_1[] | undefined>(undefined);

  /** */
  const onAutocompleteChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: ISO_3166_1 | null,
  ) => {
    if (!value) {
      onChange(null, e);
      return;
    }
    if (format === 'full-iso') {
      onChange(value, e);
      return;
    }
    // @ts-ignore
    onChange(value[format], e);
  };

  /** */
  React.useEffect(() => {
    let active = true;

    const load = async () => {
      toggleLoading(true);
      setError(undefined);

      try {
        let url = URL.replace('<LOCALE>', 'fr');
        url = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        const d = await fetch(url).then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        });
        if (!active) return;
        setData(d);
      } catch (err) {
        if (!active) return;
        setError(t('error', { message: err.message }));
      } finally {
        if (active) {
          toggleLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  /** */
  const getValue = React.useCallback(
    (value?: string | number | ISO_3166_1) => {
      if (!value) return null;
      if (typeof value === 'number') {
        return data?.find((d) => d.id === value);
      }
      if (typeof value === 'string') {
        return data?.find(
          (d) =>
            d.name.toLowerCase() === value.toLowerCase() ||
            d.alpha2.toLowerCase() === value.toLowerCase() ||
            d.alpha3.toLowerCase() === value.toLowerCase(),
        );
      }
      return value;
    },
    [data],
  );

  const getOptionLabel = React.useCallback((option: ISO_3166_1) => {
    return option.name;
  }, []);

  const getOptionSelected = React.useCallback(
    (option: ISO_3166_1, value: ISO_3166_1 | null) => {
      if (!value) return false;
      return option.id === value.id;
    },
    [],
  );

  const renderInput = (params: AutocompleteRenderInputParams) => {
    return (
      <TextField
        variant="outlined"
        {...textFieldProps}
        {...params}
        inputProps={{
          ...textFieldProps?.inputProps,
          ...params.inputProps,
        }}
      />
    );
  };

  /** */
  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (loading || !data)
    return (
      <Box>
        <CircularProgress />
      </Box>
    );
  return <>
    <Autocomplete
      {...autocompleteProps}
      value={getValue(value)}
      defaultValue={getValue(defaultValue)}
      options={data}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={getOptionSelected}
      renderInput={renderInput}
      onChange={onAutocompleteChange}
    />
  </>;
};

export default ISO31661Selector;
