import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import { Button } from '@mui/material';
import withConfirmDialog from './withConfirmDialog';

const cancelButtonLabelValue = 'cancelButtonLabel';
const confirmButtonLabelValue = 'confirmButtonLabel';
const buttonLabel = 'a label';
const ButtonWithConfirm = withConfirmDialog(Button, {
  cancelButtonLabel: cancelButtonLabelValue,
  confirmButtonLabel: confirmButtonLabelValue,
});

describe('withConfirmDialog', () => {
  afterEach(cleanup);

  it('should be not open', () => {
    const { queryByRole } = render(<ButtonWithConfirm>{buttonLabel}</ButtonWithConfirm>);
    expect(queryByRole('presentation')).toBeNull();
  });

  it('onClick should be not called', () => {
    const onClick = jest.fn();
    const { getByText, getByRole } = render(<ButtonWithConfirm onClick={onClick}>{buttonLabel}</ButtonWithConfirm>);
    fireEvent.click(getByText(buttonLabel));
    getByRole('presentation');
    fireEvent.click(getByText(cancelButtonLabelValue));
    expect(onClick).toHaveBeenCalledTimes(0);
  });

  it('onClick should be called', () => {
    const onClick = jest.fn();
    const { getByText, getByRole } = render(<ButtonWithConfirm onClick={onClick}>{buttonLabel}</ButtonWithConfirm>);
    fireEvent.click(getByText(buttonLabel));
    getByRole('presentation');
    fireEvent.click(getByText(confirmButtonLabelValue));
    expect(onClick).toHaveBeenCalled();
  });
});
