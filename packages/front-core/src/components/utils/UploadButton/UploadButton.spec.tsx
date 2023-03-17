import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import Component, { UploadButtonProps } from './UploadButton';

describe('Components/utils/UploadButton', () => {
  afterEach(cleanup);

  const setup = (props: Omit<UploadButtonProps, 'children'>, label: string) => {
    const utils = render(<Component {...props}>{label}</Component>);
    const { getByText, container } = utils;

    getByText(label, { selector: 'span' });
    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    expect(container.querySelector('input[type=file]')).not.toBeNull();

    return {
      ...utils,
      input,
    };
  };

  it('should return a file', () => {
    const file = new File([], 'filename', { type: 'image/jpg' });
    const onChange = jest.fn((files: FileList | null) => {
      if (files) {
        expect(files[0].name).toBe(file.name);
      }
    });
    const { input } = setup(
      {
        onChange,
      },
      'A label',
    );
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalled();
  });
});
