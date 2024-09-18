import React from 'react';
import type { NotificationClickHandler, NotificationActionClickHandler, InboxPage } from '@novu/js/ui';
import { useRenderer } from '../context/RenderContext';
import { Mounter } from './Mounter';
import { NotificationsRenderer } from '../utils/types';

export type InboxContentProps = {
  renderNotification?: NotificationsRenderer;
  onNotificationClick?: NotificationClickHandler;
  onPrimaryActionClick?: NotificationActionClickHandler;
  onSecondaryActionClick?: NotificationActionClickHandler;
  initialPage?: InboxPage;
  hideNav?: boolean;
};

export const InboxContent = React.memo((props: InboxContentProps) => {
  const {
    onNotificationClick,
    onPrimaryActionClick,
    renderNotification,
    onSecondaryActionClick,
    initialPage,
    hideNav,
  } = props;
  const { novuUI, mountElement } = useRenderer();

  const mount = React.useCallback(
    (element: HTMLElement) => {
      return novuUI.mountComponent({
        name: 'InboxContent',
        element,
        props: {
          renderNotification: renderNotification
            ? (el, notification) => mountElement(el, renderNotification(notification))
            : undefined,
          onNotificationClick,
          onPrimaryActionClick,
          onSecondaryActionClick,
          initialPage,
          hideNav,
        },
      });
    },
    [renderNotification, onNotificationClick, onPrimaryActionClick, onSecondaryActionClick]
  );

  return <Mounter mount={mount} />;
});
