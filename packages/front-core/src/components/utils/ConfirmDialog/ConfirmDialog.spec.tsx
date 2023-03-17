import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import Component, { ConfirmDialogProps as ComponentProps } from './ConfirmDialog';

const titleValue = 'A title';
const messageValue = 'A message';
const cancelButtonLabelValue = 'Cancel';
const confirmButtonLabelValue = 'Confirm';
const props: ComponentProps = {
  open: true,
  cancelButtonLabel: cancelButtonLabelValue,
  confirmButtonLabel: confirmButtonLabelValue,
  title: titleValue,
  message: messageValue,
  onCancel: () => {},
  onConfirm: () => {},
};

describe('ConfirmDialog', () => {
  afterEach(cleanup);

  it('should be not open', async () => {
    const { queryByRole } = render(<Component {...props} open={false} />);
    expect(queryByRole('presentation')).toBeNull();
  });

  it('should be open', async () => {
    const { getByRole, getByText } = render(<Component {...props} />);
    getByRole('presentation');
    const title = getByText(titleValue);
    expect(title.tagName).toBe('H2');
    const message = getByText(messageValue);
    expect(message.tagName).toBe('P');
  });

  it('should not display title', async () => {
    const { queryByText } = render(<Component {...props} title={undefined} />);
    expect(queryByText(titleValue)).toBeNull();
  });

  it('should not display messsage', async () => {
    const { queryByText } = render(<Component {...props} message={undefined} />);
    expect(queryByText(messageValue)).toBeNull();
  });

  it('onCancel should be called', async () => {
    const onCancel = jest.fn();
    const { getByText } = render(<Component {...props} onCancel={onCancel} />);
    const cancelButtonLabel = getByText(cancelButtonLabelValue);
    expect(cancelButtonLabel.parentElement?.tagName).toBe('BUTTON');
    fireEvent.click(cancelButtonLabel);
    expect(onCancel).toHaveBeenCalled();
  });

  it('onConfirm should be called', async () => {
    const onConfirm = jest.fn();
    const { getByText } = render(<Component {...props} onConfirm={onConfirm} />);
    const confirmButtonLabel = getByText(confirmButtonLabelValue);
    expect(confirmButtonLabel.parentElement?.tagName).toBe('BUTTON');
    fireEvent.click(confirmButtonLabel);
    expect(onConfirm).toHaveBeenCalled();
  });
});
