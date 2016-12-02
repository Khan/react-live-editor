/* global JSXTransformer */

const React = require("react");
const ReactDOM = require("react-dom");

const selfCleaningTimeout = {
    componentDidUpdate: function() {
        clearTimeout(this.timeoutID);
    },

    setTimeout: function() {
        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(...arguments);
    },
};

const ComponentPreview = React.createClass({
    propTypes: {
        code: React.PropTypes.string.isRequired,
    },

    mixins: [selfCleaningTimeout],

    componentDidMount: function() {
        this.executeCode();
    },

    componentDidUpdate: function(prevProps) {
        // execute code only when the state's not being updated by switching tab
        // this avoids re-displaying the error, which comes after a certain
        // delay
        if (this.props.code !== prevProps.code) {
            this.executeCode();
        }
    },

    compileCode: function() {
        return JSXTransformer.transform(
            '(function() {' +
                this.props.code +
            '\n})();',
            {harmony: true}
        ).code;
    },

    executeCode: function() {
        const mountNode = this.refs.mount;

        try {
            React.unmountComponentAtNode(mountNode);
        } catch (e) {
            // Ignore errors
        }

        try {
            const compiledCode = this.compileCode();
            ReactDOM.render(eval(compiledCode), mountNode);
        } catch (err) {
            this.setTimeout(function() {
                ReactDOM.render(
                    <div className="playgroundError">{err.toString()}</div>,
                    mountNode
                );
            }, 500);
        }
    },

    render: function() {
        return <div ref="mount" />;
    },
});

module.exports = ComponentPreview;
