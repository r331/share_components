import React, { Component } from 'react';
import AlertEditorContent from './AlertEditorContent';
import css from '../../../css/module/share-insight.css';
import flex from '../../../css/module/flex.css';
import EmailInvites from '../../EmailInvites';
import { userAction } from '../../../util';

class EmailEditor extends Component {
  constructor(props) {
    super(props);
    const { shareOption } = props;
    this.state = {
      stagingRecipients: shareOption.alert().recipients(),
    };
    this.setStagingRecipients = this.setStagingRecipients.bind(this);
    this.readOnlyMode = this.readOnlyMode.bind(this);
    this.alertSaveState = this.alertSaveState.bind(this);
  }

  componentDidMount() {
    const { shareOption } = this.props;
    const alert = shareOption.alert();

    if (!alert.id()) {
      userAction('open-add-new-email-alert');
    } else {
      const meta = {
        alert_id: alert.id(),
      };
      userAction('view-email-alert', meta);
    }
  }

  // used by email input component
  setStagingRecipients(newArray) {
    this.setState(() => ({
      stagingRecipients: newArray,
    }));
  }

  editMode() {
    return (
      <div className={css.shareOption}>
        <h5>Recipients</h5>
        <EmailInvites
          stagingRecipients={this.state.stagingRecipients}
          setStagingRecipients={this.setStagingRecipients}
        />
      </div>
    );
  }

  readOnlyMode(recipients) {
    return (
      <div className={css.shareOption}>
        <h5>Recipients</h5>
        <div>{recipients}</div>
      </div>
    );
  }

  readyToSave() {
    return this.state.stagingRecipients.length > 0;
  }

  cancelClicked() {
    const { shareOption } = this.props;
    const recipients = shareOption.alert().recipients();
    this.setState({
      stagingRecipients: recipients,
    });
  }

  alertSaveState(saveState) {
    return { ...saveState, _recipients: this.state.stagingRecipients };
  }

  explanation() {
    return (
      <div className={`${flex.row} ${flex.alignItemsCenter}`}>
        <div className={css.showcaseImg}>
          <div className={css.showcasePreviewContainer}>
            <table className={`table-bordered ${css.showcaseTable}`}>
              <thead>
                <tr>
                  <th />
                  <th>id</th>
                  <th>email</th>
                  <th>city</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>+ new</td>
                  <td>18</td>
                  <td>j@dean.com</td>
                  <td>Fairmount</td>
                </tr>
                <tr>
                  <td>+ new</td>
                  <td>502</td>
                  <td>s@jobs.com</td>
                  <td>San Francisco</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className={css.showcaseText}>
          <h5>
            <b>What you'll receive</b>
          </h5>
          <span style={{ fontSize: '1.1em' }}>
            An email each time your alert is triggered, highlighting which rows
            have changed.
          </span>
        </div>
      </div>
    );
  }

  render() {
    const { shareOption, viewToShare, saveAlert } = this.props;

    return (
      <AlertEditorContent
        shareOption={shareOption}
        viewToShare={viewToShare}
        saveAlert={saveAlert}
        editMode={() => this.editMode()}
        readOnlyMode={this.readOnlyMode}
        readyToSave={() => this.readyToSave()}
        cancelClicked={() => this.cancelClicked()}
        alertSaveState={this.alertSaveState}
        explanation={this.explanation}
      />
    );
  }
}

export default EmailEditor;
