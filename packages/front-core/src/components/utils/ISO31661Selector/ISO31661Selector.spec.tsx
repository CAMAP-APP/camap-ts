/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import fetch from 'jest-fetch-mock';
import waait from 'waait';
import Component, { ISO_3166_1 } from './ISO31661Selector';
import { fixBeforeAll, fixAfterAll } from '../../../../test/fix-react-16-8';
// import i18n from '../../../../test/initI18n';
import { iso31661FrenchDatas } from './mock';
import withTestI18nMocker from '../../../../test/withTestI18nMocker';

fetch.enableMocks();
const Wrapped = withTestI18nMocker(Component);

describe('ISO31661Selector', () => {
  beforeAll(() => {
    fixBeforeAll();
  });
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(cleanup);
  afterAll(fixAfterAll);

  const france = iso31661FrenchDatas.find((d) => d.id === 250) as ISO_3166_1;

  it('should display loader', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));
    // @ts-ignore
    const { getByRole } = render(<Wrapped onChange={() => {}} />);
    getByRole('progressbar');
  });

  it('should display error', async () => {
    fetch.mockRejectOnce(new Error('Error'));
    // @ts-ignore
    const { getByRole, getByText } = render(<Wrapped onChange={() => {}} />);
    await waait(0);
    getByRole('alert');
    getByText('error');
  });

  it('should diplay 3 options', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));
    const { getByTestId, getAllByRole } = render(
      // @ts-ignore
      <Wrapped
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={() => {}}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'fra' } });
    expect(getAllByRole('option').length).toBe(3); // France, Polynésie française, Terres australes et antarctiques françaises
  });

  /** */
  it('should display input value with default value : id', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));

    const { getByTestId } = render(
      // @ts-ignore
      <Wrapped
        defaultValue={france.id}
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={() => {}}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe(france.name);
  });

  it('should display input value with default value : name', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));

    const { getByTestId } = render(
      // @ts-ignore
      <Wrapped
        defaultValue={france.name}
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={() => {}}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe(france.name);
  });

  it('should display input value with default value : alpha2', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));

    const { getByTestId } = render(
      // @ts-ignore
      <Wrapped
        defaultValue={france.alpha2}
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={() => {}}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe(france.name);
  });

  it('should display input value with default value : alpha3', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));

    const { getByTestId } = render(
      // @ts-ignore
      <Wrapped
        defaultValue={france.alpha3}
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={() => {}}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe(france.name);
  });

  /**
   * RESULTS
   */
  it('should return full-iso', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));

    const onChange = jest.fn((value: ISO_3166_1) => {
      expect(value.id).toBe(france.id);
    });
    const { getByTestId, getAllByRole } = render(
      // @ts-ignore
      <Wrapped
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={onChange}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'fra' } });
    fireEvent.click(getAllByRole('option')[0]);
    expect(onChange).toHaveBeenCalled();
  });

  it('should return id', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));
    const onChange = jest.fn((value: number) => {
      expect(value).toBe(france.id);
    });
    const { getByTestId, getAllByRole } = render(
      // @ts-ignore
      <Wrapped
        format="id"
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={onChange}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'fra' } });
    fireEvent.click(getAllByRole('option')[0]);
    expect(onChange).toHaveBeenCalled();
  });

  it('should return name', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));
    const onChange = jest.fn((value: string) => {
      expect(value).toBe(france.name);
    });
    const { getByTestId, getAllByRole } = render(
      // @ts-ignore
      <Wrapped
        format="name"
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={onChange}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'fra' } });
    fireEvent.click(getAllByRole('option')[0]);
    expect(onChange).toHaveBeenCalled();
  });

  it('should return alpha2', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));
    const onChange = jest.fn((value: string) => {
      expect(value).toBe(france.alpha2);
    });
    const { getByTestId, getAllByRole } = render(
      // @ts-ignore
      <Wrapped
        format="alpha2"
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={onChange}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'fra' } });
    fireEvent.click(getAllByRole('option')[0]);
    expect(onChange).toHaveBeenCalled();
  });

  it('should return alpha3', async () => {
    fetch.mockResponse(JSON.stringify(iso31661FrenchDatas));
    const onChange = jest.fn((value: string) => {
      expect(value).toBe(france.alpha3);
    });
    const { getByTestId, getAllByRole } = render(
      // @ts-ignore
      <Wrapped
        format="alpha3"
        textFieldProps={{ inputProps: { 'data-testid': 'input' } }}
        onChange={onChange}
      />,
    );
    await waait(0);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'fra' } });
    fireEvent.click(getAllByRole('option')[0]);
    expect(onChange).toHaveBeenCalled();
  });
});
