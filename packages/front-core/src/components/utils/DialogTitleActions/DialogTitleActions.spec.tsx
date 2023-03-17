import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import userEvent from '@testing-library/user-event';
import Component from './DialogTitleActions';

describe('Components/utils/DialogTitleActions', () => {
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
    const actionCallback = jest.fn();
    const title = 'A title';
    const { container } = render(
      <Component
        actions={
          <IconButton onClick={actionCallback} size="large">
            <CloseIcon />
          </IconButton>
        }
      >
        {title}
      </Component>,
    );
    const buttonList = container.querySelectorAll('button[type=button]');
    expect(buttonList.length).toBe(1);
    userEvent.click(buttonList[0]);
    expect(actionCallback).toBeCalled();
  });

  it('shoul return 2 actions', () => {
    const title = 'A title';
    const { container } = render(
      <Component
        actions={
          <>
            <IconButton size="large">
              <CloseIcon />
            </IconButton>
            <IconButton size="large">
              <CloseIcon />
            </IconButton>
          </>
        }
      >
        {title}
      </Component>,
    );
    expect(container.querySelectorAll('button[type=button]').length).toBe(2);
  });
});
