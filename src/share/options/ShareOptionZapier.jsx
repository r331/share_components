import React from 'react';
import ShareOption from './ShareOption';
import ZapierEditor from '../editors/ZapierEditor';
import css from '../../../css/module/share-insight.css';

class ShareOptionZapier extends ShareOption {
  constructor(zaps) {
    super(
      'Send to any app via Zapier', // title
      false, // has toggle
      ZapierEditor, // editor
      zaps.filter((z) => z.disabled() === false).length > 0, // is on
      <img src="/img/zapier.png" className={css.sidebarIcon} />, // logo
      false, // can delete
      true, // has toggle tag
    );
    this._zaps = zaps; // array of AlertRefs representing the zaps
  }

  zaps() {
    return this._zaps;
  }
}

export default ShareOptionZapier;
