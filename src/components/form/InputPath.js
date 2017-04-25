import React, { Component, PropTypes } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import moment from 'moment';

export default class InputFilename extends Component {

  handleChange(e){
    const { onChange } = this.props;
    onChange(e.target.value);
  }

  render() {
    const { path, type } = this.props;

    let placeholder = 'example.md';
    if (type == 'posts') {
      const date = moment().format('YYYY-MM-DD');
      placeholder = `${date}-your-title.md`;
    }else if (type == 'data files') {
      placeholder = 'directory/your-filename.yml';
    }

    let tooltip, info = null;
    if (type == 'data files') {
      info = (
        <span className="tooltip-text">
          Enter the path relative to your <b>data_dir</b> setting.<br />(<b>_data/</b> by default.)
        </span>
      );
    } else {
      info = (
        <span className="tooltip-text">
          If you leave <b>path</b> blank, it will be autogenerated from title.
        </span>
      );
    }

    tooltip = (
      <span className="tooltip">
        <i className="fa fa-info-circle" aria-hidden="true" />
        {info}
      </span>
    );

    return (
      <div className="input-path">
        <label>Path {tooltip}</label>
        <TextareaAutosize
          key={path}
          onChange={(e) => this.handleChange(e)}
          placeholder={placeholder}
          defaultValue={path}
          ref="input" />
      </div>
    );
  }
}

InputFilename.propTypes = {
  path: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
