import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React from 'react';

function withTestMuiPickersPovider<T>(Component: React.ComponentType<T>) {
  const Wrapper: React.FC<T> = (props: T) => {
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Component {...props} />
      </LocalizationProvider>
    );
  };

  Wrapper.displayName = 'withTestMuiPickersPovider';

  return Wrapper;
}

export default withTestMuiPickersPovider;
