import { Box, Button, Paper, Typography } from '@mui/material';
import CircularProgressBox from '../../components/utils/CircularProgressBox';
import ApolloErrorAlert from '../../components/utils/errors/ApolloErrorAlert';
import { GroupDisabledReason, useGroupDisabledQuery } from '../../gql';
import { useCamapTranslation } from '../../utils/hooks/use-camap-translation';

const GroupDisabled = ({ groupId }: { groupId: number }) => {
  const { t } = useCamapTranslation({ t: 'group-disabled' });

  const { data, loading, error } = useGroupDisabledQuery({
    variables: { id: groupId },
  });

  if (error) return <ApolloErrorAlert error={error} />;
  if (loading || !data) return <CircularProgressBox />;

  const group = data.groupPreview;

  if (!group.disabled) return null;

  return (
    <Paper elevation={0} sx={{ mb: 2 }}>
      <Box p={2} width={'100%'} textAlign="center">
        <Typography variant="h2" gutterBottom>
          {t(group.disabled)}
        </Typography>

        {group.disabled === GroupDisabledReason.MOVED && group.extUrl && (
          <Button href={group.extUrl} variant="contained" sx={{ mt: 1 }}>
            {t('goToNewAddress')}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default GroupDisabled;
