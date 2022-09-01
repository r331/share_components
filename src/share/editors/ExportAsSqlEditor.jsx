import React, { Component } from 'react';
import { connect } from 'react-redux';
import css from '../../../css/module/share-insight.css';
import flex from '../../../css/module/flex.css';
import buttons from '../../../css/module/buttons.css';
import { post, userAction } from '../../../util';
import LayerHelper from '../../../util/LayerHelper';
import AceEditor from '../../AceEditor';
import AjaxSpinner from '../../AjaxSpinner';

class ExportAsSqlEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sql: null,
      error: null,
    };
  }

  componentDidMount() {
    const { viewToShare, layers, selectedLayerId } = this.props;
    const layerHelper = new LayerHelper(layers, selectedLayerId);
    const activeLayers = layerHelper.activeLayers();
    post('generating SQL for query', '/exportSql', {
      _layers: activeLayers,
      _viewId: !viewToShare ? null : viewToShare.id(),
    })
      .then((json) => {
        userAction('use-sql-export', {
          view_id: viewToShare ? viewToShare.id() : null,
          active_layers: viewToShare ? null : activeLayers,
        });
        this.setState({
          sql: json._sql,
        });
      })
      .catch((e) => {
        window.console.error('problem exporting SQL', e);
        this.setState({
          error:
            'There is a problem generating SQL for your saved query. Please open the query in Query Builder to see the specific error message.',
        });
      });
  }

  content(sql) {
    if (!sql) {
      return (
        <div className={flex.middle}>
          <AjaxSpinner />
        </div>
      );
    }
    return (
      <div>
        <div style={{ margin: '10px 30px' }}>
          <AceEditor
            onChange={() => null}
            initialSql={sql}
            readOnly
            schema={[]}
            maxLines={19}
          />
        </div>
        <div className="position-relative">
          <button
            className={`copyBtn ${buttons.btn} ${buttons.lg} ${buttons.rounded} ${buttons.dark}`}
            onClick={this.copySQL.bind(this)}
            style={{ marginLeft: '20px' }}
          >
            copy SQL to clipboard
          </button>
          <span
            className="copySuccess hidden"
            style={{ marginLeft: '36px', marginTop: '9px' }}
            ref={(d) => (this._notification = d)}
          >
            Copied to clipboard!
          </span>
          <textarea
            data-gramm="false"
            className="hidden-ta"
            onChange={() => true}
            value={sql}
            ref={(ta) => (this._textareas = ta)}
          />
        </div>
      </div>
    );
  }

  copySQL() {
    try {
      this._textareas.select();
      document.execCommand('copy');
      $(this._notification).removeClass('hidden');
      userAction('use-copy-SQL');
      setTimeout(() => {
        $(this._notification).addClass('hidden');
      }, 2500);
    } catch (err) {
      alert('Oops, unable to copy');
    }
  }

  render() {
    if (this.state.error) {
      return <div className="alert alert-info">{this.state.error}</div>;
    }

    return (
      <div className={`${css.shareSection} margin-top-30`}>
        {this.content(this.state.sql)}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    layers: state.layers.all,
    selectedLayerId: state.layers.selectedLayerId,
  };
};

export default connect(mapStateToProps)(ExportAsSqlEditor);
