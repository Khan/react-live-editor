const React = require("react");

const CodeMirrorEditor = require("./code-mirror-editor.jsx");
const ComponentPreview = require("./live-compile.jsx");

const ReactPlayground = React.createClass({
    propTypes: {
        codeText: React.PropTypes.string.isRequired,
    },

    getInitialState: function() {
        return {
            code: this.props.codeText,
        };
    },

    handleCodeChange: function(code) {
        this.setState({code});
    },

    render: function() {
        return <div className="playground">
            <div className="playgroundCode">
                <CodeMirrorEditor key="jsx"
                    onChange={this.handleCodeChange}
                    className="playgroundStage"
                    codeText={this.state.code}
                />
            </div>
            <div className="playgroundPreview">
                <ComponentPreview code={this.state.code} />
            </div>
        </div>;
    },
});

module.exports = ReactPlayground;
