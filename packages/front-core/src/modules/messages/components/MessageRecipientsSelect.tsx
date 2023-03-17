import withHelperTextTranslation from '@components/forms/shared/withHelperTextTranslation';
import ApolloErrorAlert from '@components/utils/errors/ApolloErrorAlert';
import {
  Catalog,
  useContractsUserListsLazyQuery,
  useDistributionsUserListsLazyQuery,
  useGetActiveVendorsFromGroupLazyQuery,
  useGetUserListInGroupByListTypeLazyQuery,
  useMeQuery,
  User,
  Vendor,
} from '@gql';
import { Edit, ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Autocomplete,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderGroupParams,
  AutocompleteRenderInputParams,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  formatUserAndPartnerNames,
  formatUserList,
  formatUserName,
} from '@utils/fomat';
import { isEmail, UserLists, UserListsType } from 'camap-common';
import { FieldInputProps, FieldMetaProps, FormikProps } from 'formik';
import { fieldToTextField, TextFieldProps } from 'formik-mui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessagesContext, Recipient } from '../MessagesContext';
import { MessagesFormValues } from './MessagesFormFormikTypes';

interface MessageRecipientsSelectProps {
  field: FieldInputProps<string | string[]>;
  meta: FieldMetaProps<string>;
  form: FormikProps<MessagesFormValues>;
  value: string;
  defaultRecipientsOptions: RecipientOption[];
  label: string;
}

type DistributionWithCatalogName = {
  id: number;
  multiDistribId: number;
  catalogName: string;
};

export enum RecipientOptionGroup {
  DEFAULT = '1DefaultGroup',
  CONTRACTS = '2ContractsGroup',
  DISTRIBUTION = '3DistributionGroup',
}

export interface RecipientOption {
  label: string;
  value: string;
  group: RecipientOptionGroup;
  disabled: boolean;
}

const mapVendorToUser = (
  v: Pick<Vendor, 'name' | 'email' | 'id'>,
): Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> => {
  return {
    id: v.id,
    firstName: v.name,
    lastName: '',
    email: v.email || '',
  };
};

const FREE_VALUES_EMPTY_OPTIONS: Recipient[] = [];
const DEFAULT_CONTRACT_OPTION = {
  value: '',
  label: '',
  disabled: false,
  group: RecipientOptionGroup.CONTRACTS,
};
const DEFAULT_DISTRIBUTION_OPTION = {
  value: '',
  label: '',
  disabled: false,
  group: RecipientOptionGroup.DISTRIBUTION,
};
const EMPTY_GROUP_OPTION = { value: 'empty', disabled: true };

const CustomTextField: React.ComponentType<TextFieldProps> =
  withHelperTextTranslation(TextField, fieldToTextField);

const MessageRecipientsSelect = ({
  defaultRecipientsOptions,
  label,
  field,
  meta,
  form,
}: MessageRecipientsSelectProps) => {
  const { t } = useTranslation(['messages/default']);
  const { t: tLists } = useTranslation(['members/lists']);

  const {
    groupId,
    setError,
    setRecipients,
    selectedUserList,
    setSelectedUserList,
    recipients,
  } = React.useContext(MessagesContext);

  const [freeValue, setFreeValue] = React.useState<Recipient[]>([]);
  const [freeValueInput, setFreeValueInput] = React.useState<string>('');
  const [listValue, setListValue] = React.useState<RecipientOption[]>([]);
  const [groupOpenByKey, setGroupOpenByKey] = React.useState(
    new Map<number, boolean>(),
  );
  const [contractsRecipientsOptions, setContractsRecipientsOptions] =
    React.useState([DEFAULT_CONTRACT_OPTION]);
  const [distributionsRecipientsOptions, setDistributionsRecipientsOptions] =
    React.useState([DEFAULT_DISTRIBUTION_OPTION]);

  const [
    getUserListInGroupByListType,
    {
      data: userListInGroupByListTypeData,
      error: userListInGroupByListTypeError,
    },
  ] = useGetUserListInGroupByListTypeLazyQuery();
  const { data: meData } = useMeQuery();
  const me = meData && meData.me;

  const [
    getDistributionsUserLists,
    {
      data: distributionsListData,
      loading: distributionsListLoading,
      error: distributionsListError,
    },
  ] = useDistributionsUserListsLazyQuery({
    variables: {
      groupId,
    },
  });
  const [
    getContractsUserLists,
    {
      data: contractsListData,
      loading: contractsListLoading,
      error: contractsListError,
    },
  ] = useContractsUserListsLazyQuery({
    variables: {
      groupId,
    },
  });

  const [
    getActiveVendorsFromGroup,
    { data: vendorsData, error: vendorsError },
  ] = useGetActiveVendorsFromGroupLazyQuery({
    variables: { groupId },
  });

  let listOptions = defaultRecipientsOptions.concat(contractsRecipientsOptions);
  listOptions = listOptions.concat(distributionsRecipientsOptions);

  const previousSelectedList = React.useRef<UserLists>();
  const wrongEmails = React.useRef<string[]>([]);

  const showFreeList = !!freeValue.length;

  const isInFreeValue = (value: string) => {
    let email = value;
    try {
      // value can be something like [{"email":"example@email.com"}]
      const parsedValue = JSON.parse(value);
      if (parsedValue.length > 0 && parsedValue[0].email) {
        email = parsedValue[0].email;
      }
    } catch {
      // Parse failed which means that the email is the value.
    }
    return freeValue.findIndex((v) => v.email === email) !== -1;
  };

  React.useEffect(() => {
    setError(userListInGroupByListTypeError);
  }, [userListInGroupByListTypeError]);

  React.useEffect(() => {
    if (
      (field.value === '' && !showFreeList) ||
      (field.value === undefined && showFreeList)
    ) {
      // Form has been reset
      setListValue([]);
      setFreeValue([]);
    }
  }, [field.value]);

  React.useEffect(() => {
    if (
      !selectedUserList ||
      selectedUserList.type === 'freeList' ||
      showFreeList
    )
      return;
    const selectedUserListType = selectedUserList?.type;
    if (selectedUserListType === 'test') {
      setRecipients([me!]);
    } else if (selectedUserListType === 'vendors') {
      getActiveVendorsFromGroup();
    } else if (
      previousSelectedList.current &&
      previousSelectedList.current.type === selectedUserList.type &&
      previousSelectedList.current.getData() === selectedUserList.getData() &&
      userListInGroupByListTypeData
    ) {
      setRecipients(userListInGroupByListTypeData.getUserListInGroupByListType);
    } else {
      getUserListInGroupByListType({
        variables: {
          listType: selectedUserListType,
          groupId,
          data: selectedUserList.getData(),
        },
      });
    }
    previousSelectedList.current = selectedUserList;
  }, [selectedUserList]);

  React.useEffect(() => {
    if (!userListInGroupByListTypeData) return;
    if (selectedUserList && selectedUserList.type === 'test') return;
    setRecipients(userListInGroupByListTypeData.getUserListInGroupByListType);
  }, [userListInGroupByListTypeData]);

  React.useEffect(() => {
    if (!vendorsData) return;
    if (!selectedUserList || selectedUserList.type !== 'vendors') return;
    setRecipients(vendorsData.getActiveVendorsFromGroup.map(mapVendorToUser));
  }, [vendorsData]);

  React.useEffect(() => {
    if (!vendorsError) return;
    setError(vendorsError);
  }, [vendorsError]);

  React.useEffect(() => {
    if (showFreeList) return;
    if (!listValue) return;
    let newSelectedList;
    if (listValue.length > 0) {
      let userListType = listValue[0].value;
      if (userListType.startsWith('contractSubscribers')) {
        userListType = 'contractSubscribers';
      }
      newSelectedList = UserLists.getListByType(userListType as UserListsType);
      if (userListType.startsWith('contractSubscribers')) {
        const contractId = listValue[0].value.substring(
          'contractSubscribers'.length,
        );
        const data = contractId;
        newSelectedList = new UserLists('contractSubscribers');
        newSelectedList.setData(data);
      }
      if (userListType.startsWith('withProductToGetOnDistribution')) {
        const distributionId = listValue[0].value.substring(
          'withProductToGetOnDistribution'.length,
        );
        const data = distributionId;
        newSelectedList = new UserLists('withProductToGetOnDistribution');
        newSelectedList.setData(data);
      }
    }
    if (newSelectedList === selectedUserList) return;
    setSelectedUserList(newSelectedList);
  }, [listValue]);

  React.useEffect(() => {
    if (!contractsListData?.getContractsUserLists) return;

    if (!contractsListData.getContractsUserLists.length) {
      setContractsRecipientsOptions([
        {
          ...EMPTY_GROUP_OPTION,
          label: tLists(EMPTY_GROUP_OPTION.value),
          group: RecipientOptionGroup.CONTRACTS,
        },
      ]);
      return;
    }

    setContractsRecipientsOptions(
      contractsListData.getContractsUserLists.map((ul) => {
        let value = ul.type;
        if (ul.data) {
          const contract: Catalog | undefined = JSON.parse(ul.data);
          if (contract) {
            value += contract.id;
          }
        }
        return {
          value,
          label: formatUserList(ul, tLists),
          group: RecipientOptionGroup.CONTRACTS,
          disabled: ul.count === 0,
        };
      }),
    );
  }, [contractsListData?.getContractsUserLists]);

  React.useEffect(() => {
    if (!distributionsListData?.getDistributionsUserLists) return;

    if (!distributionsListData.getDistributionsUserLists.length) {
      setDistributionsRecipientsOptions([
        {
          ...EMPTY_GROUP_OPTION,
          label: tLists(EMPTY_GROUP_OPTION.value),
          group: RecipientOptionGroup.DISTRIBUTION,
        },
      ]);
      return;
    }

    setDistributionsRecipientsOptions(
      distributionsListData.getDistributionsUserLists.map((ul) => {
        let value = ul.type;
        if (ul.data) {
          const distribution: DistributionWithCatalogName | undefined =
            JSON.parse(ul.data);
          if (distribution) {
            value += distribution.id;
          }
        }
        return {
          value,
          label: formatUserList(ul, tLists),
          group: RecipientOptionGroup.DISTRIBUTION,
          disabled: ul.count === 0,
        };
      }),
    );
  }, [distributionsListData?.getDistributionsUserLists]);

  const onFreeValueInputChange = (
    _event: React.SyntheticEvent,
    value: string,
  ) => {
    setFreeValueInput(value);
  };

  const onFreeValueChange = (_event: any, newValue: (Recipient | string)[]) => {
    const lastValue = newValue[newValue.length - 1];
    if (typeof lastValue === 'string') {
      if (isInFreeValue(lastValue)) return;
      const newRecipients = [...freeValue, { email: lastValue }];
      setFreeValue(newRecipients);
      if (lastValue && !isEmail(lastValue)) {
        wrongEmails.current.push(lastValue);
      } else {
        setRecipients(
          newRecipients.filter(
            (r) => r.email && !wrongEmails.current.includes(r.email),
          ),
        );
      }
    } else {
      setFreeValue(newValue as Recipient[]);
      const correctEmails = (newValue as Recipient[]).filter((recipient) => {
        if (!recipient.email) return false;
        if (wrongEmails.current.includes(recipient.email)) {
          return false;
        }
        if (!isEmail(recipient.email)) {
          wrongEmails.current.push(recipient.email);
          return false;
        }
        return true;
      });
      setRecipients(correctEmails);
      field.onChange(field.name)(JSON.stringify(correctEmails));
      const userList = UserLists.getListByType('freeList');
      userList?.setData(correctEmails);
    }
    if (!selectedUserList || selectedUserList.type !== 'freeList')
      setSelectedUserList(UserLists.getListByType('freeList'));
  };

  const renderFreeValueTags = React.useCallback(
    (tagValue: Recipient[], getTagProps: AutocompleteRenderGetTagProps) => {
      return tagValue.map((option: Recipient, index) => {
        const isError =
          option.email && wrongEmails.current.includes(option.email);
        let title = '';

        if (isError) title = `${t('form.emailError')}`;
        if (option.firstName !== undefined && option.lastName !== undefined) {
          if (option.firstName2 && option.lastName2) {
            title = formatUserAndPartnerNames(option as User);
          } else {
            title = formatUserName(option as User);
          }
        }
        let { email } = option;
        if (option.email2) {
          email += ` & ${option.email2}`;
        }
        return (
          <Tooltip
            key={option.email}
            title={title}
            disableHoverListener={title === ''}
            sx={{ margin: 3 }}
            arrow
          >
            <Chip
              label={email}
              {...getTagProps({ index })}
              size="small"
              sx={
                isError
                  ? (theme) => ({
                      borderColor: `${theme.palette.error.main}80`,
                      backgroundColor: `${theme.palette.error.light}3D`,
                      '&.MuiChip-outlined:hover': {
                        backgroundColor: `${theme.palette.error.light}3D`,
                      },
                      '&.MuiChip-outlined:focus': {
                        backgroundColor: `${theme.palette.error.light}3D`,
                      },
                    })
                  : undefined
              }
            />
          </Tooltip>
        );
      });
    },
    [],
  );

  const renderFreeValueInput = React.useCallback(
    (params: AutocompleteRenderInputParams) => {
      return (
        <CustomTextField
          {...params}
          inputProps={{ ...params.inputProps, value: freeValueInput }}
          field={field}
          meta={meta}
          form={form}
          label={label}
        />
      );
    },
    [field, form, freeValueInput, label, meta],
  );

  const onListValueChange = (
    _event: any,
    value: RecipientOption[] | string[],
  ) => {
    const lastValue = value[value.length - 1];
    if (typeof lastValue === 'string') {
      onFreeValueChange(
        // eslint-disable-next-line no-restricted-globals
        event,
        (value as string[]).map((email) => ({ email })),
      );
      return;
    }
    const lastOption = (value as RecipientOption[]).pop();
    setListValue(lastOption ? [lastOption] : []);
    field.onChange(field.name)(lastOption ? lastOption.value : '');
  };

  const onClose = (event: React.ChangeEvent<{}>) => {
    field.onBlur(field.name)(event);
  };

  const handleEditList = () => {
    const recipientEmails: Recipient[] = [];
    recipients.forEach((r) => {
      if (r.email)
        recipientEmails.push({
          email: r.email,
          firstName: r.firstName,
          lastName: r.lastName,
        });
      if (r.email2 && r.firstName2 && r.lastName2)
        recipientEmails.push({
          email: r.email2,
          firstName: r.firstName2,
          lastName: r.lastName2,
        });
    });

    setFreeValue(recipients);
    setRecipients(recipientEmails);
    if (recipientEmails.length)
      field.onChange(field.name)(JSON.stringify(recipientEmails));
    else field.onChange(field.name)('');
    setSelectedUserList(UserLists.getListByType('freeList'));
    setListValue([]);
  };

  const onKeyDown = (event: React.KeyboardEvent, isListValue: boolean) => {
    if (event.key !== ' ') return;
    const currentValue = field.value as string;
    if (!currentValue || !currentValue.trim()) return;
    if (currentValue === '[]' && listValue.length === 0) return;
    if (isListValue) {
      const isRecipientMatch =
        defaultRecipientsOptions.findIndex((r) =>
          r.value.includes(currentValue),
        ) !== -1;
      if (isRecipientMatch) return;
    } else if (isInFreeValue(currentValue)) return;
    event.preventDefault();
    setFreeValueInput('');
    onFreeValueChange(null, [currentValue]);
  };

  const onKeyDownFreeValue = (event: React.KeyboardEvent) => {
    onKeyDown(event, false);
  };

  const onKeyDownListValue = (event: React.KeyboardEvent) => {
    if (listValue.length > 0) {
      event.preventDefault();
      return;
    }
    onKeyDown(event, true);
  };

  const renderGroup = (params: AutocompleteRenderGroupParams) => {
    const { key } = params;
    if (!!params.group && groupOpenByKey[key] === undefined) {
      const newGroupOpenByKey = { ...groupOpenByKey };
      newGroupOpenByKey[key] = false;
      setGroupOpenByKey(newGroupOpenByKey);
    }

    const isDefault = params.group === RecipientOptionGroup.DEFAULT;
    const isContracts = params.group === RecipientOptionGroup.CONTRACTS;

    const toggleList = () => {
      if (isContracts) {
        if (!contractsListData?.getContractsUserLists) {
          getContractsUserLists();
        }
      } else if (!distributionsListData?.getDistributionsUserLists) {
        getDistributionsUserLists();
      }

      const newGroupOpenByKey = { ...groupOpenByKey };
      newGroupOpenByKey[key] = !groupOpenByKey[key];
      setGroupOpenByKey(newGroupOpenByKey);
    };

    const renderNestedList = () => {
      const error = isContracts ? contractsListError : distributionsListError;
      const loading = isContracts
        ? contractsListLoading
        : distributionsListLoading;
      if (error) return <ApolloErrorAlert error={error} />;
      if (loading)
        return (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        );
      return params.children;
    };

    const isOpen = groupOpenByKey[key];

    return (
      <List key={key}>
        {isDefault ? (
          <List component="div" disablePadding>
            {params.children}
          </List>
        ) : (
          <>
            <ListItem
              button
              onClick={toggleList}
              sx={{
                paddingTop: 0.25,
                paddingBottom: 0.25,
              }}
            >
              <ListItemText primary={`${t(params.group)}`} />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={isOpen} timeout="auto">
              <List component="div" disablePadding sx={{ paddingLeft: 4 }}>
                {renderNestedList()}
              </List>
            </Collapse>
          </>
        )}
      </List>
    );
  };

  const onBlur = () => {
    if (selectedUserList !== undefined && selectedUserList.type !== 'freeList')
      return;
    const currentValue = field.value;
    if (typeof currentValue !== 'string') return;
    if (isInFreeValue(currentValue)) return;
    if (currentValue.trim() === '') return;
    if ((showFreeList || !listValue.length) && currentValue !== '[]')
      onFreeValueChange(null, [currentValue]);
  };

  if (showFreeList) {
    return (
      <Box mt={0.5}>
        <Autocomplete
          multiple
          limitTags={10}
          value={freeValue}
          onChange={onFreeValueChange}
          onClose={onClose}
          options={FREE_VALUES_EMPTY_OPTIONS}
          fullWidth
          onInputChange={onFreeValueInputChange}
          renderInput={renderFreeValueInput}
          renderTags={renderFreeValueTags}
          disableClearable
          freeSolo
          onKeyDown={onKeyDownFreeValue}
          onBlur={onBlur}
        />
      </Box>
    );
  }

  return (
    <Box mt={0.5}>
      <Autocomplete
        multiple
        value={listValue}
        onChange={onListValueChange}
        onClose={onClose}
        options={listOptions.sort((a, b) => -b.group.localeCompare(a.group))}
        groupBy={(option) => option.group}
        getOptionDisabled={(option) => option.disabled}
        fullWidth
        getOptionLabel={(option) => option.label}
        renderTags={(value: RecipientOption[], getTagProps) => (
          <Chip
            variant="outlined"
            label={value[0].label}
            {...getTagProps({ index: 0 })}
            deleteIcon={<Edit />}
            onDelete={handleEditList}
          />
        )}
        renderGroup={renderGroup}
        renderInput={(params) => {
          return (
            <CustomTextField
              {...params}
              field={field}
              meta={meta}
              form={form}
              label={label}
            />
          );
        }}
        disableClearable
        freeSolo
        onKeyDown={onKeyDownListValue}
        onBlur={onBlur}
      />
    </Box>
  );
};

export default React.memo(MessageRecipientsSelect);
