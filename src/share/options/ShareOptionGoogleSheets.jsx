import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ShareOption from './ShareOption';
import GoogleSheetsEditor from '../editors/GoogleSheetsEditor';
import css from '../../../css/module/share-insight.css';
import { get } from '../../../util';

class ShareOptionGoogleSheets extends ShareOption {
  constructor(isSheetsShareable) {
    super(
      'Google Sheets',
      true, // has toggle
      GoogleSheetsEditor,
      isSheetsShareable, // is on if sheets is shareable
      <FontAwesomeIcon
        icon="table"
        className={`${css.sidebarIcon} ${css.googleSheets}`}
      />,
      false, // can delete is off
      true, // has toggle tag
    );
  }

  async toggle(viewToShare) {
    const { _isActive } = await get(
      'toggling Google Sheets',
      `/views/${viewToShare.id()}/toggle-googlesheets`,
    );
    return new ShareOptionGoogleSheets(_isActive);
  }
}

export default ShareOptionGoogleSheets;
