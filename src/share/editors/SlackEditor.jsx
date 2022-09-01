import React, { Component } from 'react';
import AlertEditorContent from './AlertEditorContent';
import { get, userAction } from '../../../util';
import { HTMLToString } from '../../../util/helpers/string-helpers';
import Column from '../../../util/Column';
import css from '../../../css/module/share-insight.css';
import flex from '../../../css/module/flex.css';
import slack from '../../../css/module/slack.css';
import SlackMessage from '../../SlackMessage';
import SlackPreview from '../../SlackPreview';
import MoreInfo from '../../MoreInfo';
import SelectSlackChannel from '../../SelectSlackChannel';

class SlackEditor extends Component {
  constructor(props) {
    super(props);

    const initialState = this.initialState();
    this.state = {
      stagingChannel: initialState.stagingChannel,
      stagingMessage: initialState.stagingMessage,
      loadingSlackDetails: true,
      slackConnected: false,
      columns: [], // array of Column objs
      sampleData: [{}], // columnName -> sample value
      showGIF: true,
    };

    this.setStagingMessage = this.setStagingMessage.bind(this);
    this.readOnlyMode = this.readOnlyMode.bind(this);
    this.setStagingChannel = this.setStagingChannel.bind(this);
    this.alertSaveState = this.alertSaveState.bind(this);
    this.setSampleData = this.setSampleData.bind(this);
  }

  initialState() {
    const { shareOption } = this.props;
    return {
      stagingChannel:
        shareOption.alert().recipients().length === 0
          ? null
          : shareOption.alert().recipients()[0],
      stagingMessage: shareOption.alert().message()
        ? shareOption.alert().message()
        : '',
    };
  }

  componentDidMount() {
    const { shareOption, viewToShare } = this.props;

    const alert = shareOption.alert();

    if (!alert.id()) {
      userAction('open-add-new-slack-alert');
    } else {
      const meta = {
        alert_id: alert.id(),
      };
      userAction('view-slack-alert', meta);
    }

    // if it's an existing Slack alert, add the message (need to format)
    if (shareOption.alert().recipients().length > 0) {
      const message = shareOption.alert().message();
      this.setStagingMessage(message);
    }

    get(
      'loading columns for slack message',
      `/views/${viewToShare.series()}/columns?includeAliases=true`,
    ).then((json) => {
      this.setState({
        columns: json.map((c) => Column.build(c)),
      });
    });

    // poll for sample data
    this.getSampleData();
  }

  getSampleData() {
    const { viewToShare } = this.props;
    get(
      'loading sample data for Slack',
      `/views/${viewToShare.id()}/sample`,
    ).then((json) => this.setSampleData(json));
  }

  setSampleData(json) {
    if (json.length === 0) {
      this.samplesTimer = setTimeout(() => this.getSampleData(), 5000);
      return;
    }
    this.setState({
      sampleData: json,
    });
    clearTimeout(this.samplesTimer);
  }

  setStagingChannel(channel) {
    this.setState({
      stagingChannel: channel,
    });
  }

  editMode() {
    return (
      <div>
        <div className={css.shareOption}>
          <h5>
            {this.state.slackConnected ? 'Select Channel' : 'Connect Slack'}
          </h5>
          <SelectSlackChannel
            setStagingChannel={this.setStagingChannel}
            stagingChannel={this.state.stagingChannel}
            shareOption={this.props.shareOption}
            loadingSlackDetails={this.state.loadingSlackDetails}
            slackConnected={this.state.slackConnected}
            slackConnectionResult={(json) =>
              this.setState({
                loadingSlackDetails: false,
                slackConnected: json.connected,
              })
            }
          />
        </div>
        <div className={css.shareOption}>
          <h5>Message Template</h5>
          <span>
            Create the <b>message template</b> that will be used for{' '}
            <b>each row</b>
          </span>
          <br />
          <br />
          {!this.state.showGIF ? null : (
            <div className={`${css.slackGIF} margin-bottom-20`}>
              <div
                style={{ marginLeft: '10px', marginTop: '5px', color: '#999' }}
              >
                Example
              </div>
              <div
                className={css.removeGIF}
                onClick={() => this.setState({ showGIF: false })}
              >
                &times;
              </div>
              <img src="/img/slack_editor_2.gif" />
            </div>
          )}
          <div className="margin-bottom-20">
            <span>
              Type{' '}
              <b>
                <em>@</em>
              </b>{' '}
              and <b>click columns</b> in the dropdown to include data.
            </span>
          </div>
          <SlackMessage
            columns={this.state.columns}
            setStagingMessage={this.setStagingMessage}
            stagingMessage={this.state.stagingMessage}
          />
          <MoreInfo label="Formatting">
            <span className={css.extraInfoList}>
              <ul>
                <li>
                  <code>_italic_</code> will produce <em>italic</em> text
                </li>
                <li>
                  <code>*bold*</code> will produce <b>bold</b> text
                </li>
                <li>
                  <code>~strikethrough~</code> will produce{' '}
                  <span style={{ textDecoration: 'line-through' }}>
                    strikethrough
                  </span>{' '}
                  text
                </li>
                <li>
                  Multiple lines: you can have text on multiple lines using{' '}
                  <code>\n</code>, e.g. <code>first line\nsecond line</code>
                </li>
                <li>
                  Hyperlinks: you can type links normally (e.g. www.foo.com or
                  https://foo.com) or format them as so:{' '}
                  {'<http://www.foo.com|Foo>'} to produce{' '}
                  <a href="http://www.foo.com" target="_blank">
                    Foo
                  </a>
                </li>
                <li>Emoji: :smile: will be converted to 😄</li>
                {/* <li>To mention users: you need to provide their user ID in the following syntax: Hey {"<@U024BE7LH>"}</li> */}
              </ul>
              <small>
                View Slack's documentation{' '}
                <a
                  href="https://api.slack.com/reference/surfaces/formatting#visual-styles"
                  target="_blank"
                >
                  here
                </a>
                .
              </small>
            </span>
          </MoreInfo>
        </div>
        <div className={css.shareOption}>
          <h5 className="margin-top-20">
            Preview <small>(with sample data if possible)</small>
          </h5>
          <SlackPreview
            sample={this.state.sample}
            stagingChannel={this.state.stagingChannel}
            viewToShare={this.props.viewToShare}
            columns={this.state.columns}
            stagingMessage={this.state.stagingMessage}
            sampleData={this.state.sampleData}
            loadingSlackDetails={this.state.loadingSlackDetails}
            shareOption={this.props.shareOption}
            slackConnected={this.state.slackConnected}
          />
        </div>
      </div>
    );
  }

  readOnlyMode(recipients, editClicked) {
    const { shareOption } = this.props;
    return (
      <div>
        <div className={css.shareOption}>
          <h5>Channel</h5>
          <div>{recipients}</div>
        </div>
        <div className={css.shareOption}>
          <h5>Message Template</h5>
          <div className="user-clickable" onClick={editClicked}>
            {this.curliesToHTML(shareOption.alert().message())}
          </div>
        </div>
      </div>
    );
  }

  setStagingMessage(message) {
    this.setState({
      stagingMessage: message,
    });
  }

  // replace double curly brackets with html
  curliesToHTML(value) {
    const { columns } = this.state;

    const activeClass = this.props.shareOption.isOn() ? css.active : '';

    let message = value;

    // encode html tags (so they're not parsed as html in dangerouslySetInnerHTML) and replace line break characters with actual breaks.
    message = HTMLToString(value).split('\\n').join('<br />');

    // replace column placeholders with a div to make them standout
    columns.forEach((c) => {
      const name = c.name().toString();
      const toReplace = new RegExp(`{{${name}}}`, 'g');
      message = message.replace(
        toReplace,
        () => `<div class="${slack.anchor} ${activeClass}">${name}</div>`,
      );
    });

    return <div dangerouslySetInnerHTML={{ __html: message }} />;
  }

  readyToSave() {
    const { stagingChannel, stagingMessage, slackConnected } = this.state;

    const array = [];

    if (!slackConnected) {
      array.push('connect Slack');
    }

    if (!stagingChannel) {
      array.push('select a channel');
    }

    if (stagingMessage.length === 0) {
      array.push('create a message template');
    }

    return array;
  }

  cancelClicked() {
    // reset state
    this.setState(this.initialState());
  }

  alertSaveState(saveState) {
    return {
      ...saveState,
      _recipients: [this.state.stagingChannel],
      _message: this.state.stagingMessage,
    };
  }

  explanation() {
    return (
      <div className={`${flex.row} ${flex.alignItemsCenter}`}>
        <div className={css.showcaseImg}>
          <div className={css.showcasePreviewContainer}>
            <div className={`${slack.previewContainer} ${flex.row}`}>
              <div
                className={`${flex.row} ${flex.alignItemsStart} ${slack.slackPreviewSection}`}
              >
                <img src="/img/trevormydata-logo.png" className={slack.logo} />
                <div className={flex.column}>
                  <p>
                    <b>Trevor Bot</b>
                  </p>
                  <p>2 messages triggered</p>
                  <div className={slack.messagePreview}>
                    Yesterday we sold <b>307</b> beanbag chairs.
                    <br />
                    Yesterday we sold <b>8</b> rainbow top hats.
                    <br />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={css.showcaseText}>
          <h5>
            <b>What you'll receive</b>
          </h5>
          <span style={{ fontSize: '1.1em' }}>
            A custom message in Slack per triggered row. You can combine text
            and data to generate context-specific messages.
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

export default SlackEditor;
