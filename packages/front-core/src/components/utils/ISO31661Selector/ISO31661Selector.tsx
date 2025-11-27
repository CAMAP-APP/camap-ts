import { Box, CircularProgress } from '@mui/material';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { Alert } from '@mui/material';
import Autocomplete, {
  AutocompleteProps,
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { getRuntimeCfg } from '../../../lib/runtimeCfg';

export const FRANCE_ISO_3166_1 = 250;

export interface ISO_3166_1 {
  id: number;
  name: string;
  alpha2: string;
  alpha3: string;
}

export type ResultFormat = 'full-iso' | keyof ISO_3166_1;

type P = AutocompleteProps<ISO_3166_1, false, false, false>;

export interface ISO31661SelectorProps {
  defaultValue?: ISO_3166_1 | number | string;
  value: ISO_3166_1 | string | number;
  format?: ResultFormat;
  autocompleteProps?: Omit<
    P,
    | 'defaultValue'
    | 'options'
    | 'getOptionLabel'
    | 'isOptionEqualToValue'
    | 'renderInput'
  >;
  textFieldProps?: TextFieldProps;
  onChange: (
    value: ISO_3166_1 | string | number | null,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

/**
 * Construit l’URL du fichier iso-3166-1.json à partir de la config runtime.
 *
 * Priorités :
 *  1) CAMAP_HOST  (ex: https://camapdev.amap44.org)
 *  2) window.location.origin (fallback générique)
 *
 * Le backend doit exposer /data/<locale>/iso-3166-1.json sur ce host.
 */
function buildIsoUrl(locale: string): string {
  const cfg = getRuntimeCfg();

  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';

  // Priorité absolue : CAMAP_HOST
  const base =
    (cfg as any).CAMAP_HOST && (cfg as any).CAMAP_HOST.trim() !== ''
      ? (cfg as any).CAMAP_HOST
      : origin;

  return `${base}/data/${locale}/iso-3166-1.json`;
}

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
    e: React.SyntheticEvent<Element, Event>,
    value: ISO_3166_1 | null,
  ) => {
    if (!value) {
      onChange(null, e as ChangeEvent<HTMLInputElement>);
      return;
    }
    if (format === 'full-iso') {
      onChange(value, e as ChangeEvent<HTMLInputElement>);
      return;
    }
    // @ts-ignore
     onChange((value as any)[format], e as ChangeEvent<HTMLInputElement>);
  };

  /** */
  React.useEffect(() => {
    let active = true;

    const load = async () => {
      toggleLoading(true);
      setError(undefined);

      try {
        const url = buildIsoUrl('fr');
        const d = await fetch(url).then((res) => {
          if (!res.ok) throw new Error(res.statusText);
          return res.json();
        });
        if (!active) return;
        setData(d);
      } catch (err: any) {
        if (!active) return;
        setError(t('error', { message: (err instanceof Error) ? err.message : err }));
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
  }, [t]);

  /** */
  const getValue = React.useCallback(
    (v?: string | number | ISO_3166_1) => {
      if (!v) return null;
      if (typeof v === 'number') {
        return data?.find((d) => d.id === v) ?? null;
      }
      if (typeof v === 'string') {
        return (
          data?.find(
            (d) =>
              d.name.toLowerCase() === v.toLowerCase() ||
              d.alpha2.toLowerCase() === v.toLowerCase() ||
              d.alpha3.toLowerCase() === v.toLowerCase(),
          ) ?? null
        );
      }
      return v;
    },
    [data],
  );

  const getOptionLabel = React.useCallback((option: ISO_3166_1) => {
    return option.name;
  }, []);

  const getOptionSelected = React.useCallback(
    (option: ISO_3166_1, v: ISO_3166_1 | null) => {
      if (!v) return false;
      return option.id === v.id;
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
  return (
    <Autocomplete<ISO_3166_1>
      {...autocompleteProps}
      value={getValue(value)}
      defaultValue={getValue(defaultValue)}
      options={data}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={getOptionSelected}
      renderInput={renderInput}
      onChange={(_e, v, _reason, details) => {
        // Material UI passe value via le 2ème paramètre, l’event réel
        // est dans details, mais on garde la signature existante :
        const event =
          (details && (details as any).event) ||
          ({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        onAutocompleteChange(event, v as ISO_3166_1 | null);
      }}
    />
  );
};

export default ISO31661Selector;
