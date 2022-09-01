import React from 'react';
import ShareOption from './ShareOption';
import AlertRef, { SLACK } from '../../../util/AlertRef';
import { post } from '../../../util';
import SlackEditor from '../editors/SlackEditor';
import EmailEditor from '../editors/EmailEditor';

class ShareOptionAlertBase extends ShareOption {
  constructor(alert, name, icon, triggerType) {
    super(
      alert.recipients().length === 0 ? (
        <span>Create {name} alert</span>
      ) : (
        <span>{name} alert</span>
      ), // title
      alert.recipients().length > 0, // has toggle if has recipients
      triggerType === SLACK ? SlackEditor : EmailEditor, // editor
      !alert.disabled(), // is on
      icon, // logo
      true, // can delete
      true, // alert.recipients().length === 0 //has toggle tag
    );
    this._alert = alert;
    this._name = name;
    this._icon = icon;
    this._triggerType = triggerType;
  }

  alert() {
    return this._alert;
  }

  name() {
    return this._name;
  }

  icon() {
    return this._icon;
  }

  triggerType() {
    return this._triggerType;
  }

  canDelete() {
    return true;
  }

  toggle() {
    return post(
      `toggling ${this.name()} alert`,
      `/alerts/${this.alert().id()}/disable/${!this.alert().disabled()}`,
      {},
    ).then((json) => {
      const updated = json._alerts
        .map((a) => AlertRef.build(a))
        .find((a) => a.id() === this.alert().id());
      return new ShareOptionAlertBase(
        updated,
        this.name(),
        this.icon(),
        this.triggerType(),
      );
    });
  }

  delete() {
    return post(
      `deleting${this.name()} alert`,
      `/alerts/${this.alert().id()}`,
      {},
      'DELETE',
    ).catch((e) => window.console.error('problem deleting alert', e));
  }
}

export default ShareOptionAlertBase;
