import React from 'react';
import ShareOption from './ShareOption';
import S3BucketEditor from '../editors/S3BucketEditor';
import { post } from '../../../util';
import css from '../../../css/module/share-insight.css';
import S3BucketShareRef from '../../../util/S3BucketShareRef';

class ShareOptionS3Bucket extends ShareOption {
  constructor(shareRef) {
    super(
      'Send to Amazon S3',
      shareRef.id(), // has toggle
      S3BucketEditor, // editor
      !shareRef.disabled(), // is on
      <img src="/img/s3.png" className={css.sidebarIcon} />,
      true, // can delete
      true, // has toggle tag
    );
    this._shareRef = shareRef;
  }

  shareRef() {
    return this._shareRef;
  }

  toggle(viewToShare) {
    const newState = !this.shareRef().disabled();
    return post(
      'toggling S3 Bucket Feed',
      `/views/${viewToShare.id()}/bucketFeeds/${this.shareRef().id()}/disable/${newState}`,
      {},
    ).then((json) => {
      return new ShareOptionS3Bucket(S3BucketShareRef.build(json));
    });
  }

  delete(viewId) {
    return post(
      'deleting bucket feed',
      `/views/${viewId}/bucketFeeds/${this.shareRef().id()}`,
      {},
      'DELETE',
    );
  }
}

export default ShareOptionS3Bucket;
