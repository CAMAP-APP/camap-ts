import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Box, Card, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Meta } from '@storybook/react';
import { subMonths } from 'date-fns';
import React from 'react';
import HaxeDatePicker from './HaxeDatePicker';

const padDateFrag = (value: number) => String(value).padStart(2, '0');

export const Component = () => {
  const [value, setValue] = React.useState<Date>(subMonths(new Date(), 6));

  // const haxeDate = `${value.getFullYear()}-${padDateFrag(
  //   value.getMonth(),
  // )}-${padDateFrag(value.getDate())} ${padDateFrag(
  //   value.getHours(),
  // )}:${padDateFrag(value.getMinutes())}:${padDateFrag(value.getSeconds())}`;
  const haxeDate = '2021-12-10 20:00:00';

  /** */
  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" justifyContent="center">
          <Card>
            <Box p={2} display="flex" alignItems="center">
              <DateTimePicker
                label="js"
                value={value}
                onChange={(d) => {
                  setValue(d as Date);
                }}
                renderInput={(props) => (
                  <TextField {...props} variant="outlined" />
                )}
              />
            </Box>
          </Card>

          <Box ml={2}>
            <Card>
              <Box p={2}>
                <TextField
                  label="utc"
                  variant="outlined"
                  disabled
                  value={JSON.stringify(value)
                    .replace(/\"/g, '')
                    .replace(/\.\d{3}Z$/g, '')
                    .replace('T', ' ')}
                />
              </Box>
            </Card>
          </Box>
        </Box>

        <Box>
          <ArrowDropDownIcon />
        </Box>

        <Card>
          <Box p={2}>
            <TextField
              label="haxe string"
              variant="outlined"
              disabled
              value={haxeDate}
            />
          </Box>
        </Card>

        <Box>
          <ArrowDropDownIcon />
        </Box>

        <Box minWidth={500}>
          <Card>
            <Box id="container" p={2}>
              <Box mb={2}>
                <HaxeDatePicker
                  name={'date-demo'}
                  type="date"
                  value={haxeDate}
                />
              </Box>
              <Box mb={2}>
                <HaxeDatePicker
                  name={'time-demo'}
                  type="time"
                  value={haxeDate}
                />
              </Box>
              <Box mb={0}>
                <HaxeDatePicker
                  name={'datetime-demo'}
                  type="datetime-local"
                  value={haxeDate}
                />
              </Box>
            </Box>
          </Card>
        </Box>

        <Box>
          <ArrowDropDownIcon />
        </Box>

        <Box p={2} bgcolor="#ccc">
          <pre>
            {[
              ...(document
                .getElementById('container')
                ?.getElementsByTagName('input') || []),
            ]
              .filter((input) => input.type === 'hidden')
              .map((input) => (
                <Box key={`input-${input.name}`}>{input.outerHTML}</Box>
              ))}
          </pre>
        </Box>
      </Box>
    </>
  );
};

export default {
  title: 'modules/HaxeDatePicker',
  decorators: [
    (Story: React.ComponentType<{}>) => (
      <Box p={2} maxWidth={764}>
        <Story />
      </Box>
    ),
  ],
} as Meta;
