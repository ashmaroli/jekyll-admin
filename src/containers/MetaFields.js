import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import MetaField from '../components/metadata/MetaField';
import {
  storeContentFields, addField, removeField, updateFieldKey, updateFieldValue,
  moveArrayItem, convertField,
} from '../ducks/metadata';
import { fetchMeta } from '../ducks/dashboard';

export class MetaFields extends Component {

  componentDidMount() {
    const { storeContentFields, fields, fetchMeta } = this.props;
    storeContentFields(fields);
    fetchMeta();
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(nextProps.metadata, this.props.metadata);
  }

  render() {
    const {
      metadata, addField, removeField, updateFieldKey, updateFieldValue, moveArrayItem,
      convertField, key_prefix, dataview, type, appMeta
    } = this.props;

    let visibleKeys = metadata;

    if (!dataview) {
      visibleKeys = _.omit(visibleKeys, ['title', 'path', 'raw_content']);
    }

    const metafieldsClass = classnames({
      'datafields': dataview,
      'metafields': !dataview
    });

    const metafields = _.map(visibleKeys, (field, key) => {
      let type = 'simple';
      if (_.isObject(field)) type = 'object';
      if (_.isArray(field)) type = 'array';
      if (_.isArray(field) && key == 'tags') type = 'simple';
      return (
        <MetaField
          key={key}
          key_prefix={key_prefix}
          type={type}
          parentType="top"
          fieldKey={key}
          fieldValue={field}
          addField={addField}
          removeField={removeField}
          updateFieldKey={updateFieldKey}
          updateFieldValue={updateFieldValue}
          moveArrayItem={moveArrayItem}
          convertField={convertField}
          nameAttr={`metadata['${key}']`}
          namePrefix={`metadata`}
          appMeta={appMeta} />
      );
    });

    const newWrapper = dataview ? (
      <div className="data-new">
        <a onClick={() => addField('metadata')}>
          <i className="fa fa-plus-circle" /> New data field
        </a>
      </div>
    ) : (
      <div className="meta-new">
        <a onClick={() => addField('metadata')}>
          <i className="fa fa-plus-circle" /> New front matter field
        </a>
        {
          type != "templates" &&
            <small className="tooltip pull-right">
              <i className="fa fa-info-circle" />Special Keys
              <span className="tooltip-text">
                You can use special keys like
                <b> layout</b>, <b>date</b>, <b>file</b>, <b>image</b>, and <b>tags </b>
                for user-friendly functionalities.
              </span>
            </small>
        }
      </div>
    );

    return (
      <div className={metafieldsClass}>
        {metafields}
        {newWrapper}
      </div>
    );
  }
}

MetaFields.propTypes = {
  fields: PropTypes.object.isRequired,
  metadata: PropTypes.object.isRequired,
  key_prefix: PropTypes.string.isRequired,
  storeContentFields: PropTypes.func.isRequired,
  addField: PropTypes.func.isRequired,
  removeField: PropTypes.func.isRequired,
  updateFieldKey: PropTypes.func.isRequired,
  updateFieldValue: PropTypes.func.isRequired,
  moveArrayItem: PropTypes.func.isRequired,
  convertField: PropTypes.func.isRequired,
  dataview: PropTypes.bool,
  type: PropTypes.string,
  fetchMeta: PropTypes.func,
  appMeta: PropTypes.object
};

const mapStateToProps = (state) => ({
  metadata: state.metadata.metadata,
  key_prefix: state.metadata.key_prefix,
  appMeta: state.dashboard.meta
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  storeContentFields,
  addField,
  removeField,
  updateFieldKey,
  updateFieldValue,
  moveArrayItem,
  convertField,
  fetchMeta
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MetaFields);
