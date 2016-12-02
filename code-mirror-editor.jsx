/* global CodeMirror */

const React = require("react");

const IS_MOBILE = (
    navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
);

const OPEN_MARK = /{{{/;
const CLOSE_MARK = /}}}/;

CodeMirror.registerGlobalHelper('fold', 'marked',
    function(mode, mirror) {
        return mode.name === 'javascript';
    },
    function(mirror, start) {
        const lineNo = start.line;
        const lineText = mirror.getLine(lineNo);
        const lineCount = mirror.lineCount();

        let openMatch = OPEN_MARK.exec(lineText);
        let closeMatch = CLOSE_MARK.exec(lineText);

        if (openMatch) {
            // search forwards
            for (let i = lineNo; i < lineCount; i++) {
                closeMatch = CLOSE_MARK.exec(mirror.getLine(i));
                if (closeMatch) {
                    return {
                        from: CodeMirror.Pos(lineNo, openMatch.index),
                        to: CodeMirror.Pos(i, closeMatch.index + 3),
                    };
                }
            }

        } else if (closeMatch) {
            // search backwards
            for (let i = lineNo; i >= 0; i--) {
                openMatch = OPEN_MARK.exec(mirror.getLine(i));
                if (openMatch) {
                    return {
                        from: CodeMirror.Pos(i, openMatch.index),
                        to: CodeMirror.Pos(lineNo, closeMatch.index + 3),
                    };
                }
            }
        }
    }
);

const CodeMirrorEditor = React.createClass({
    propTypes: {
        className: React.PropTypes.string,
        codeText: React.PropTypes.string,
        onChange: React.PropTypes.func,
        readOnly: React.PropTypes.bool,
        style: React.PropTypes.any,
    },

    componentDidMount: function() {
        if (IS_MOBILE) {
            return;
        }

        this.editor = CodeMirror.fromTextArea(this.refs.editor, {
            mode: 'javascript',
            lineNumbers: false,
            lineWrapping: true,
            // javascript mode does bad things with jsx indents
            smartIndent: false,
            matchBrackets: true,
            theme: 'solarized-light',
            readOnly: this.props.readOnly,
        });

        this.editor.foldCode(0, {widget: '...'});
        this.editor.on('change', this.handleChange);

        this.editor.on('beforeSelectionChange', (instance, obj) => {
            // why is ranges plural?
            const selection = obj.ranges ?
                    obj.ranges[0] :
                    obj;

            const noRange = selection.anchor.ch === selection.head.ch &&
                selection.anchor.line === selection.head.line;
            if (!noRange) {
                return;
            }

            const cursor = selection.anchor;
            const line = instance.getLine(cursor.line);
            const match = OPEN_MARK.exec(line) || CLOSE_MARK.exec(line);

            // the opening or closing mark appears on this line
            if (match &&
                // and the cursor is on it
                // (this is buggy if both occur on the same line)
                cursor.ch >= match.index &&
                cursor.ch < match.index + 3) {

                // TODO(joel) - figure out why this doesn't fold although it
                // seems like it should work.
                instance.foldCode(cursor, {widget: '...'});
            }
        });
    },

    componentDidUpdate: function() {
        if (this.props.readOnly) {
            this.editor.setValue(this.props.codeText);
        }
    },

    handleChange: function() {
        if (!this.props.readOnly && this.props.onChange) {
            this.props.onChange(this.editor.getValue());
        }
    },

    render: function() {
        // wrap in a div to fully contain CodeMirror
        let editor;

        if (IS_MOBILE) {
            editor = <pre style={{overflow: 'scroll'}}>
                {this.props.codeText}
            </pre>;
        } else {
            editor = <textarea
                ref="editor"
                defaultValue={this.props.codeText}
            />;
        }

        return (
            <div style={this.props.style} className={this.props.className}>
                {editor}
            </div>
        );
    },
});

module.exports = CodeMirrorEditor;
