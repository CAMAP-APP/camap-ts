import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Typography } from '@mui/material';
import userEvent from '@testing-library/user-event';
import Component from './DialogTitleClosable';

describe('Components/utils/DialogTitleClosable', () => {
  afterEach(cleanup);

  it('shoul return a h2', () => {
    const title = 'A title';
    const { getByText } = render(<Component>{title}</Component>);
    getByText(title, { selector: 'h2' });
  });

  it('shoul return a h4', () => {
    const title = 'A title';
    const { getByText } = render(
      <Component disableTypography>
        <Typography variant="h4">{title}</Typography>
      </Component>,
    );
    getByText(title, { selector: 'h4' });
  });

  it('shoul return an action', () => {
    const onClose = jest.fn();
    const title = 'A title';
    const { container } = render(<Component onClose={onClose}>{title}</Component>);
    const buttonList = container.querySelectorAll('button[type=button]');
    expect(buttonList.length).toBe(1);
    userEvent.click(buttonList[0]);
    expect(onClose).toBeCalled();
  });
});
