import { within, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const selectMaterialUiSelectOption = async (element: HTMLElement, optionText: string) =>
  new Promise((resolve) => {
    const selectButton = element.parentNode?.querySelector('[role=button]') as HTMLElement;

    userEvent.click(selectButton);

    const listbox = document.body.querySelector('ul[role=listbox]') as HTMLElement;

    const listItem = within(listbox).getByText(optionText);
    userEvent.click(listItem);

    waitForElementToBeRemoved(() => document.body.querySelector('ul[role=listbox]')).then(resolve);
  });

export const selectMaterialUiAutocompleteOption = async (element: HTMLElement, optionText: string) =>
  new Promise((resolve) => {
    const selectButton = element.parentNode?.querySelector('[title=Open]') as HTMLElement;

    userEvent.click(selectButton);

    const listbox = document.body.querySelector('ul[role=listbox]') as HTMLElement;

    const listItem = within(listbox).getByText(optionText);
    waitForElementToBeRemoved(() => document.body.querySelector('ul[role=listbox]')).then(resolve);
    userEvent.click(listItem);
  });
