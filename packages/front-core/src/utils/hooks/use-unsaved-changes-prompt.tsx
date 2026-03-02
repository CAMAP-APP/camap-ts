import React from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import type { Location, Navigator } from 'react-router-dom';

type Transition = {
  action: string;
  location: Location;
  retry: () => void;
};

type Blocker = (transition: Transition) => void;

const useBlocker = (blocker: Blocker, when = true) => {
  const navigationContext = React.useContext(NavigationContext) as unknown as
    | { navigator?: Navigator }
    | null
    | undefined;
  const navigator = navigationContext?.navigator;

  React.useEffect(() => {
    if (!when) return;
    if (!navigator) return;

    const maybeBlockableNavigator = navigator as unknown as {
      block?: (fn: (transition: Transition) => void) => () => void;
    };

    if (typeof maybeBlockableNavigator.block !== 'function') {
      return;
    }

    const unblock = maybeBlockableNavigator.block((transition: Transition) => {
      const autoUnblockingTransition: Transition = {
        ...transition,
        retry: () => {
          unblock();
          transition.retry();
        },
      };
      blocker(autoUnblockingTransition);
    });

    return unblock;
  }, [navigator, blocker, when]);
};

export const useUnsavedChangesPrompt = ({
  when,
  message,
}: {
  when: boolean;
  message: string;
}) => {
  const messageRef = React.useRef(message);

  React.useEffect(() => {
    messageRef.current = message;
  }, [message]);

  React.useEffect(() => {
    if (!when) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Modern browsers ignore the custom text but still show a confirmation dialog.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);

  const blocker = React.useCallback((transition: Transition) => {
    const confirmed = window.confirm(messageRef.current);
    if (confirmed) transition.retry();
  }, []);

  useBlocker(blocker, when);
};

