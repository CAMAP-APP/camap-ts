import React from 'react';
import { useTranslation } from 'react-i18next';
import { round } from '../../utils/fomat';

export interface VatBoxModuleProps {
  initialTtc: number;
  currency: string;
  vatRates: string;
  initialVat: number;
  formName: string;
}

// This module uses classes from Bootstrap for legacy reasons
// Because we want to match the style of the components around where it's used
const VatBoxModule = ({
  initialTtc,
  currency,
  vatRates,
  initialVat,
  formName,
}: VatBoxModuleProps) => {
  const { t } = useTranslation('vat-box');
  const [ht, setHt] = React.useState<string>(
    round(initialTtc / (1 + initialVat / 100)).toString(),
  );
  const [ttc, setTtc] = React.useState<string>(round(initialTtc).toString());
  const [vat, setVat] = React.useState<number>(initialVat);
  const [lastEdited, setLastEdited] = React.useState<'htInput' | 'ttcInput'>();

  const rates: number[] = React.useMemo(() => {
    return vatRates.split('|').map(parseFloat);
  }, [vatRates]);

  const formatInput = (input: string): [string, number] => {
    if (!input) input = '0';
    input = input.replace(',', '.');
    let value = parseFloat(input);
    if (!value) value = 0;

    return [input, value];
  };

  function onChangeHtInput(e: React.ChangeEvent<HTMLInputElement>) {
    const [input, value] = formatInput(e.currentTarget.value);

    const rate = 1 + vat / 100;
    setHt(input);
    setTtc(round(value * rate).toString());
    setLastEdited('htInput');
  }

  function onChangeTtcInput(e: React.ChangeEvent<HTMLInputElement>) {
    const [input, value] = formatInput(e.currentTarget.value);

    const rate = 1 + vat / 100;
    setHt(round(value / rate).toString());
    setTtc(input);
    setLastEdited('ttcInput');
  }

  function onChangeVat(e: React.ChangeEvent<HTMLSelectElement>) {
    const [, value] = formatInput(e.currentTarget.value);

    const rate = 1 + value / 100;
    if (lastEdited === 'htInput') {
      //compute ttc from ht
      setVat(value);
      setTtc(round(parseFloat(ht) * rate).toString());
    } else {
      //compute ht from ttc
      setVat(value);
      setHt(round(parseFloat(ttc) / rate).toString());
      setTtc(ttc);
    }
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.currentTarget.value !== '0') return;
    e.currentTarget.select();
  };

  var priceInputName = formName + '_price';
  var vatInputName = formName + '_vat';

  return (
    <div>
      <div className="row">
        <div className="col-md-4 text-center">{t('excludingTax')}</div>
        <div className="col-md-4 text-center">{t('vatRate')}</div>
        <div className="col-md-4 text-center">{t('includingAllTaxes')}</div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="input-group">
            <input
              type="text"
              name="htInput"
              value={ht.toString()}
              className="form-control"
              onChange={onChangeHtInput}
              onFocus={onFocus}
            />
            <div className="input-group-addon">{currency}</div>
          </div>
        </div>

        <div className="col-md-4">
          <select
            name="vat"
            className="form-control"
            onChange={onChangeVat}
            defaultValue={vat}
          >
            {rates.map((r) => (
              <option key={r} value={r}>
                {r} %
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <div className="input-group">
            <input
              type="text"
              name="ttcInput"
              value={ttc}
              className="form-control"
              onChange={onChangeTtcInput}
            />
            <div className="input-group-addon">{currency}</div>
          </div>
        </div>
      </div>

      <input type="hidden" name={priceInputName} value={parseFloat(ttc)} />
      <input type="hidden" name={vatInputName} value={vat} />
    </div>
  );
};

export default VatBoxModule;
