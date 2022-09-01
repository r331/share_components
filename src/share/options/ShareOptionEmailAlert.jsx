import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ShareOptionAlertBase from './ShareOptionAlertBase';
import css from '../../../css/module/share-insight.css';
import { EMAIL } from '../../../util/AlertRef';

class ShareOptionEmailAlert extends ShareOptionAlertBase {
  constructor(alert) {
    super(
      alert,
      'Email',
      <FontAwesomeIcon
        icon="envelope"
        className={`${css.sidebarIcon} ${css.email}`}
      />,
      EMAIL,
    );
  }
}

export default ShareOptionEmailAlert;
