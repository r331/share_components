import React from 'react';
import ShareOptionAlertBase from './ShareOptionAlertBase';
import css from '../../../css/module/share-insight.css';
import { SLACK } from '../../../util/AlertRef';

class ShareOptionSlackAlert extends ShareOptionAlertBase {
  constructor(alert) {
    super(
      alert,
      'Slack',
      <img src="/img/slack-icon.png" className={css.sidebarIcon} />,
      SLACK,
    );
  }
}

export default ShareOptionSlackAlert;
