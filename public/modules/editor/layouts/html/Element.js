var React = require('react');
var Utils = require('../../../../helpers/Utils');
var Mediator = require('../../../../helpers/Mediator');
var ElementComponents = require('../../../../helpers/ElementComponents');
var ReactDOM = require('react-dom');

var MediumEditor = require('medium-editor');
require('medium-editor/dist/css/medium-editor.css');

require('./MediumEditor.less');
require('./Element.less');


var SortableMixin = {
	componentDidMount: function () {
		var component = ReactDOM.findDOMNode( this );
		$( component ).sortable( {
			animation: 150,
			forceFallback: true,
            onStart: function (/**Event*/evt) {
                $('#vc_v-editor').addClass('vc-draganddrop');
                // evt.oldIndex;  // element index within parent
            },
            // dragging ended
            onEnd: function (/**Event*/evt) {
                $('#vc_v-editor').removeClass('vc-draganddrop');
                // evt.oldIndex;  // element's old index within parent
                // evt.newIndex;  // element's new index within parent
            },
			onUpdate: function ( ev ) {
				var $el = $( ev.item );
				Element.publish( 'data:move',
					$el.data( 'vcElement' ),
					$el.next( '[data-vc-element]' ).data( 'vcElement' ) );
			}
		} );
	}
};

var InlineEditorMixin = {
	componentDidMount: function () {
		var component = ReactDOM.findDOMNode( this );

		var inlineEditor = new MediumEditor(component, {
			elementsContainer: document.querySelector('.vc_ui-inline-editor-container'),
			toolbar: {
				buttons: ['bold', 'italic', 'underline', 'h2'],
				static: true
			}
		});
	}
};


require('./Sortable.less');
var Element = React.createClass(Mediator.installTo({
	// mixins: [SortableMixin],
	 mixins: [InlineEditorMixin],
    addChild: function() {
        this.publish('app:add', this.props.element.getAttribute('id'));
    },
    editElement: function() {
        this.publish('app:edit', this.props.element);
    },
    removeElement: function() {
        this.publish('data:remove', this.props.element.getAttribute('id'));
    },
    cloneElement: function() {
        this.publish('data:clone', this.props.element.getAttribute('id'));
    },
    getContent: function() {
        var ElementComponent = ElementComponents.get(this.props.element); // optimize
        if('container' == ElementComponent.type) {
            let elementsList = this.props.data.map(function( element ){
                let data = Array.prototype.slice.call(element.childNodes);
                return <Element element={element} data={data} key={element.getAttribute('id')}/>;
            });
            return elementsList;
        }
        return this.props.element.innerHTML || '';
    },
    getControls: function() {
        var element = this.props.element;
        var ElementComponent = ElementComponents.get(element);
        var addControl = 'container' == ElementComponent.type  ? <a onClick={this.addChild} className="glyphicon glyphicon-plus"></a> : null;
        return (<span className="controls">
            {addControl}
            <a onClick={this.editElement} className="glyphicon glyphicon-pencil"></a>
            <a onClick={this.removeElement} className="glyphicon glyphicon-remove"></a>
            <a onClick={this.cloneElement} className="glyphicon glyphicon-duplicate"></a>
        </span>);
    },
    render: function() {
        var element = this.props.element;
        var ElementComponent = ElementComponents.get(element);
        var ElementView = ElementComponents.getElement(element);
        return React.createElement(ElementView, {
            key: element.getAttribute('id'),
            content: this.getContent(),
            'data-vc-element': element.getAttribute('id'),
            'data-vc-element-type': ElementComponent.type.toString(),
			'data-vc-editable': 'true'
        });
    }
}));
module.exports = Element;