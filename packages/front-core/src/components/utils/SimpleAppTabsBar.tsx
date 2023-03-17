import React from 'react';
import { AppBar, AppBarProps, Tab, Tabs, TabsProps } from '@mui/material';

export interface SimpleAppTabsBarProps<T> {
  value: T;
  tabs: { value: T; label: string; disabled?: boolean }[];
  appBarProps?: Pick<AppBarProps, 'children'>;
  tabProps?: Pick<TabsProps, 'children' | 'value' | 'onChange'>;
  onChange: (newValue: T) => void;
}

const SimpleAppTabsBar = <T extends {}>({ value, tabs, appBarProps, tabProps, onChange }: SimpleAppTabsBarProps<T>) => {
  /** */
  const onTabChane = (_: any, newValue: T) => {
    onChange(newValue);
  };

  /** */
  return (
    <AppBar position="relative" elevation={0} {...appBarProps}>
      <Tabs centered {...tabProps} value={value} onChange={onTabChane}>
        {tabs
          .slice()
          .map((tab, i) => ({ ...tab, key: `${i}` }))
          .map((tab) => (
            <Tab key={tab.key} value={tab.value} label={tab.label} disabled={tab.disabled} />
          ))}
      </Tabs>
    </AppBar>
  );
};

export default SimpleAppTabsBar;
