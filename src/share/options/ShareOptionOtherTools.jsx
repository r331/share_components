import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ShareOption from './ShareOption';
import OtherToolsEditor from '../editors/OtherToolsEditor';
import css from '../../../css/module/share-insight.css';

class ShareOptionOtherTools extends ShareOption {
  constructor(isShareable) {
    super(
      'Other tools',
      false, // has toggle
      OtherToolsEditor,
      isShareable, // is on if is shareable
      <FontAwesomeIcon icon="paper-plane" className={css.sidebarIcon} />,
      false, // can delete is off
      true, // has toggle tag
    );
  }
}

export default ShareOptionOtherTools;
