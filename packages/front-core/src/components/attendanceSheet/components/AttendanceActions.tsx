import GetAppIcon from '@mui/icons-material/GetApp';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Button } from '@mui/material';
import ReactToPrint from 'react-to-print';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { ATTENDANCE_TABLE_CONTAINER_ID } from './AttendanceTableWrapper';

export interface AttendanceActionsProps {
  onExportCSVClick: () => void;
  onExportXLSXClick: () => void;
}

export const AttendanceActions = ({
  onExportCSVClick,
  onExportXLSXClick,
}: AttendanceActionsProps) => {
  const { t } = useCamapTranslation({
    tAttendance: 'attendance',
  });

  /** */
  return (
    <Box p={2} display="flex" justifyContent="center">
      <Box mx={1}>
        <Button
          variant="outlined"
          startIcon={<GetAppIcon />}
          onClick={onExportCSVClick}
        >
          {t('actions.csv')}
        </Button>
      </Box>

      <Box mx={1}>
        <Button
          variant="outlined"
          startIcon={<GetAppIcon />}
          onClick={onExportXLSXClick}
        >
          {t('actions.xlsx')}
        </Button>
      </Box>

      <Box mx={1}>
        <ReactToPrint
          trigger={() => (
            <Button variant="outlined" startIcon={<PrintIcon />}>
              {t('actions.print')}
            </Button>
          )}
          content={() => document.getElementById(ATTENDANCE_TABLE_CONTAINER_ID)}
        />
      </Box>
    </Box>
  );
};

export default AttendanceActions;
