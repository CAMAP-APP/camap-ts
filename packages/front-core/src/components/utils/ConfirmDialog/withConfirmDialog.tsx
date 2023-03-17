import React from 'react';
import ConfirmDialog, { ConfirmDialogProps } from './ConfirmDialog';

type ConfirmProps = Omit<ConfirmDialogProps, 'open' | 'onCancel' | 'onConfirm'>;

const withConfirmDialog = function <T>(
  Component: React.ComponentType<T>,
  dialogProps: ConfirmProps,
) {
  const Wrapper = (props: T) => {
    const [open, toggleOpen] = React.useState(false);

    /** */
    const close = () => {
      toggleOpen(false);
    };

    /** */
    // eslint-disable-next-line no-underscore-dangle
    const _onClick = () => {
      toggleOpen(true);
    };

    const onConfirm = () => {
      close();
      // @ts-ignore
      if (props.onClick) props.onClick();
    };

    /** */
    return (
      <>
        <Component {...props} onClick={_onClick} />
        <ConfirmDialog
          {...dialogProps}
          open={open}
          onCancel={close}
          onConfirm={onConfirm}
        />
      </>
    );
  };

  return Wrapper;
};

export default withConfirmDialog;
