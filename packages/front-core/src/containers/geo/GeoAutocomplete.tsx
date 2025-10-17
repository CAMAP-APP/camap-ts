import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Grid, TextField, Typography } from '@mui/material';
import Autocomplete, {
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';
import React from 'react';
import { GeoAutocompleteOptionType } from './GeoAutocomplete.interface';

interface Props {
  initialValue?: string;
  label?: string;
  noOptionsText?: React.ReactNode;
  onChange: (value: GeoAutocompleteOptionType | null) => void;
}

function adaptInput(value: string) {
  let adapted = value;
  if (adapted.startsWith('saint')) {
    // replace the space by a dash
    adapted = adapted.replaceAll(/\s/g, '-');
  }
  return adapted;
}

// France, Belgium and overseas departments and regions of France
const GEOCODING_COUNTRIES =
  'fr%2Cbe%2Cre%2Cnc%2Cgp%2Cgy%2Cmq%2Cyt%2Cbl%2Cmf%2Cpf%2Cpm%2Cwf';

const mapboxApiUrlBuilder = (
  service: string,
  request: string,
  options?: Map<string, any>,
) => {
  let url = `https://api.mapbox.com/geocoding/v5/${service}/${request}.json?access_token=${process.env.MAPBOX_KEY}&language=fr&country=${GEOCODING_COUNTRIES}&types=postcode%2Cplace&autocomplete=true`;
  if (options) {
    url += '&';
    url += Object.keys(options)
      .map((key) => `${key}=${options.get(key)}`)
      .join('&');
  }
  return url;
};

const getOptionLabel = (option: GeoAutocompleteOptionType) => option.place_name;

const GeoAutocomplete = ({
  initialValue,
  label,
  noOptionsText,
  onChange,
}: Props) => {
  const [options, setOptions] = React.useState<GeoAutocompleteOptionType[]>([]);
  const [inputValue, setInputValue] = React.useState(initialValue || '');
  const [adaptedInputValue, setAdaptedInputValue] = React.useState('');

  React.useEffect(() => {
    if (!initialValue) return;
    setAdaptedInputValue(adaptInput(initialValue));
  }, [initialValue]);

  /** */
  const fetchAddress = React.useMemo(
    () =>
      throttle((request: string, callback: (results: any) => void) => {
        fetch(mapboxApiUrlBuilder('mapbox.places', request))
          .then((res) => {
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
          })
          .then(callback);
      }, 200),
    [],
  );

  /** */
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setInputValue(value);
    setAdaptedInputValue(adaptInput(value));
  };

  const onAutocompleteChange = (
    _e: React.SyntheticEvent,
    value: GeoAutocompleteOptionType | null,
  ) => {
    if (value) {
      setInputValue(getOptionLabel(value));
    }
    onChange(value);
  };

  /** */
  React.useEffect(() => {
    let active = true;

    if (adaptedInputValue === '') {
      setOptions([]);
      return undefined;
    }

    fetchAddress(adaptedInputValue, (results) => {
      if (active && results.features) {
        setOptions(results.features);

        if (
          !!initialValue &&
          initialValue !== '' &&
          inputValue === initialValue &&
          results.features.length > 0
        ) {
          // When initialValue is set, take the first result
          onChange(results.features[0]);
        }
      }
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adaptedInputValue, fetchAddress]);

  /** */
  const renderInput = (inputProps: AutocompleteRenderInputParams) => (
    <TextField
      {...inputProps}
      label={label}
      variant="outlined"
      onChange={onInputChange}
      inputProps={{ ...inputProps.inputProps, value: inputValue }}
    />
  );

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: GeoAutocompleteOptionType,
  ) => {
    const optionValue = option.place_name;
    const parts = parse(optionValue, match(optionValue, inputValue));
    return (
      <Grid component={'li'} container {...props}>
        <Grid item>
          <LocationOnIcon sx={{ marginRight: 3, color: 'text.secondary' }} />
        </Grid>
        <Grid item xs>
          <Typography />
          {parts.map((part, index) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              style={{ fontWeight: part.highlight ? 700 : 400 }}
            >
              {part.text}
            </span>
          ))}
        </Grid>
      </Grid>
    );
  };

  const getOptionSelected = (option: any, value: any) => {
    return option && value && option.id === value.id;
  };

  /** */
  return (
    <Autocomplete
      options={options}
      inputValue={adaptedInputValue}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      renderInput={renderInput}
      noOptionsText={noOptionsText}
      onChange={onAutocompleteChange}
      isOptionEqualToValue={getOptionSelected}
    />
  );
};

export default GeoAutocomplete;
