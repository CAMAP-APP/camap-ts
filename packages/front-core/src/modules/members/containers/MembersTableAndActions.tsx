import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Input,
  Paper,
  styled,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { debounce, deburr } from 'lodash';
import React from 'react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AlertError from '../../../components/utils/AlertError';
import CamapIcon, { CamapIconId } from '../../../components/utils/CamapIcon';
import {
  useGetMembersOfGroupByListTypeLazyQuery,
  UserList,
} from '../../../gql';
import { formatUserList } from '../../../utils/fomat';
import { useCamapTranslation } from '../../../utils/hooks/use-camap-translation';
import { MembersContext } from '../MembersContext';
import Member from '../MemberType';
import MembersTable from './MembersTable';
import WaitingListTable from './WaitingListTable';

const IconButtonSx: SxProps<Theme> = (theme: Theme) => ({
  color: 'action.active',
  transform: 'scale(1, 1)',
  transition: theme.transitions.create(['transform', 'color'], {
    duration: theme.transitions.duration.shorter,
    easing: theme.transitions.easing.easeInOut,
  }),
});

const SearchInput = ({
  onSearchChange,
  previousSelectedUserList,
}: {
  onSearchChange: (value: string) => void;
  previousSelectedUserList: UserList | undefined;
}) => {
  const { t } = useTranslation(['members/default']);
  const { toggleRefetch, selectedUserList } = React.useContext(MembersContext);
  const [value, setValue] = React.useState('');

  const debouncedSearchChange = debounce(onSearchChange, 500);

  React.useEffect(() => {
    if (toggleRefetch === undefined) return;
    setValue('');
  }, [toggleRefetch]);

  React.useEffect(() => {
    if (
      previousSelectedUserList &&
      previousSelectedUserList.type === selectedUserList.type &&
      previousSelectedUserList.data === selectedUserList.data
    )
      return;
    setValue('');
  }, [selectedUserList]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    debouncedSearchChange(newValue);
  };

  const resetSearch = () => {
    setValue('');
    onSearchChange('');
  };

  return (
    <Paper
      sx={{
        height: 48,
        display: 'flex',
        justifyContent: 'space-between',
        marginLeft: 'auto',
        width: '200px',
      }}
    >
      <Input
        startAdornment={
          <Box p={1} display="flex">
            <SearchIcon sx={IconButtonSx} />
          </Box>
        }
        endAdornment={
          value && (
            <Box p={1}>
              <IconButton size="small" onClick={resetSearch}>
                <CloseIcon sx={IconButtonSx} />
              </IconButton>
            </Box>
          )
        }
        placeholder={t('search')}
        inputProps={{ 'aria-label': t('search') }}
        disableUnderline
        value={value}
        onChange={onChange}
      />
    </Paper>
  );
};

const StyledCSVLink = styled(CSVLink)(({ theme }) => ({
  textDecoration: 'none',

  '&:focus,&:hover': {
    textDecoration: 'none',
  },
}));

const ButtonBottomIconSx = {
  fontSize: '1rem',
  marginRight: 0.5,
};

const MembersTableAndActions = () => {
  const { t, tLists, tCommon, tErrors } = useCamapTranslation({
    t: 'members/default',
    tLists: 'members/lists',
    tCommon: 'translation',
    tErrors: 'errors',
  });
  const navigate = useNavigate();

  const { groupId, toggleRefetch, selectedUserList } =
    React.useContext(MembersContext);

  const [
    getMembersGroupByListType,
    { data: membersData, error: membersError, refetch: membersRefetch },
  ] = useGetMembersOfGroupByListTypeLazyQuery({
    variables: { listType: selectedUserList.type, groupId },
  });
  const [filteredMembers, setFilteredMembers] = React.useState<Member[]>();
  const [loading, setLoading] = React.useState(false);

  const previousSelectedUserListRef = React.useRef<UserList>();
  const allMembersRef = React.useRef<Member[]>();

  const members = membersData && membersData.getUserListInGroupByListType;

  const csvHeaders: { key: keyof Member; label: string }[] =
    React.useMemo(() => {
      if (!filteredMembers || !filteredMembers.length) return [];
      return Object.keys(filteredMembers[0]).map((key: string) => ({
        key: key as keyof Member,
        label: tCommon(key),
      }));
    }, [filteredMembers]);

  const csvFilename = React.useMemo(
    () => `${formatUserList(selectedUserList, tLists, false)}.csv`,
    [selectedUserList],
  );

  const [unexpectedUnauthorizedError, setUnexpectedUnauthorizedError] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    if (!membersError) return;
    if (membersError.message === 'Unauthorized') {
      setUnexpectedUnauthorizedError(true);
    }
  }, [membersError]);

  React.useEffect(() => {
    if (
      previousSelectedUserListRef.current &&
      previousSelectedUserListRef.current.type === selectedUserList.type &&
      previousSelectedUserListRef.current.data === selectedUserList.data
    ) {
      return;
    }
    const previousSelectedUserListIsWaitingList =
      previousSelectedUserListRef.current?.type === 'waitingList';

    previousSelectedUserListRef.current = selectedUserList;
    if (selectedUserList.type === 'waitingList') return;
    setLoading(true);

    if (previousSelectedUserListIsWaitingList) {
      if (membersRefetch)
        membersRefetch({ listType: selectedUserList.type, groupId }).then(() =>
          setLoading(false),
        );
    } else {
      getMembersGroupByListType();
    }
  }, [getMembersGroupByListType, groupId, membersRefetch, selectedUserList]);

  React.useEffect(() => {
    if (allMembersRef.current) return;
    if (selectedUserList.type !== 'all') return;
    allMembersRef.current = members;
  }, [selectedUserList, members]);

  React.useEffect(() => {
    if (toggleRefetch === undefined) return;
    if (membersRefetch) membersRefetch();
  }, [membersRefetch, toggleRefetch]);

  React.useEffect(() => {
    if (!membersData) return;
    setFilteredMembers(
      membersData.getUserListInGroupByListType.map((m) => {
        const { __typename, ...member } = m;
        return member;
      }),
    );
  }, [membersData]);

  React.useEffect(() => {
    if (!filteredMembers) return;
    setLoading(false);
  }, [filteredMembers]);

  function filterMembers(options: Member[], inputValue: string) {
    let input = inputValue.trim();
    input = deburr(input.toLowerCase());

    const filteredOptions = options.filter((option) => {
      let candidate = `${option.firstName} ${option.lastName} ${option.firstName2} ${option.lastName2} ${option.zipCode} ${option.city} ${option.address1}`;
      candidate = deburr(candidate.toLowerCase());

      return candidate.indexOf(input) > -1;
    });

    return filteredOptions;
  }

  const onSearchChange = (inputValue: string) => {
    if (!members) return;
    setFilteredMembers(filterMembers(members, inputValue));
  };

  const onImportMembersClick = () => navigate('/import');
  const onNewMemberClick = () => navigate('/insert');

  if (membersError) {
    if (unexpectedUnauthorizedError)
      return <AlertError message={tErrors('unexpectedUnauthorized')} />;
    return <ApolloErrorAlert error={membersError} />;
  }

  return (
    <Paper>
      <Box p={2}>
        <Grid container direction="row">
          <Typography variant="h2">{t('title')}</Typography>
          <SearchInput
            onSearchChange={onSearchChange}
            previousSelectedUserList={previousSelectedUserListRef.current}
          />
        </Grid>
      </Box>
      {selectedUserList.type !== 'waitingList' ? (
        <MembersTable
          members={filteredMembers || []}
          loading={loading}
          allMembers={allMembersRef.current}
        />
      ) : (
        <WaitingListTable />
      )}
      <Box p={2}>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="outlined" onClick={onNewMemberClick}>
              <CamapIcon id={CamapIconId.plus} sx={ButtonBottomIconSx} />
              {t('newMember')}
            </Button>
          </Grid>
          <Grid item>
            <StyledCSVLink
              data={filteredMembers || []}
              headers={csvHeaders}
              separator=";"
              filename={csvFilename}
              target="_blank"
            >
              <Button variant="outlined">
                <CamapIcon id={CamapIconId.download} sx={ButtonBottomIconSx} />
                {t('export')}
              </Button>
            </StyledCSVLink>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={onImportMembersClick}>
              <CamapIcon id={CamapIconId.upload} sx={ButtonBottomIconSx} />
              {t('importMembers')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default MembersTableAndActions;
