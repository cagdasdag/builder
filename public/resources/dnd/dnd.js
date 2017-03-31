import $ from 'jquery'
import _ from 'lodash'
import { getService, setData, getData } from 'vc-cake'
import SmartLine from './smartLine'
import Helper from './helper'
import HelperClone from './helperClone'
import Api from './api'
import DOMElement from './domElement'

const documentManager = getService('document')
const cook = getService('cook')

export default class DnD {
  /**
   * Drag&drop builder.
   *
   * @param {string} container DOMNode to use as container
   * @param {Object} options Settings for Dnd builder to define how it should interact with layout
   * @constructor
   */
  constructor (container, options) {
    Object.defineProperties(this, {
      /**
       * @memberOf! DnD
       */
      helper: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
      },
      /**
       * @memberOf! DnD
       */
      position: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
      },
      /**
       * @memberOf! DnD
       */
      placeholder: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
      },
      /**
       * @memberOf! DnD
       */
      currentElement: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
      },
      /**
       * @memberOf! DnD
       */
      draggingElement: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
      },
      /**
       * @memberOf! DnD
       */
      point: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: null
      },
      /**
       * @memberOf! DnD
       */
      hover: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: ''
      },
      /**
       * @memberOf! DnD
       */
      items: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: {}
      },
      /**
       * @memberOf! DnD
       */
      container: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: container
      },
      /**
       * @memberOf! DnD
       */
      manualScroll: {
        enumerable: false,
        configurable: false,
        writable: true,
        value: false
      },
      /**
       * @memberOf! DnD
       */
      options: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: _.defaults(options, {
          cancelMove: false,
          moveCallback: function () {
          },
          startCallback: function () {
          },
          endCallback: function () {
          },
          document: document,
          container: document.body,
          boundariesGap: 10,
          rootContainerFor: ['RootElements'],
          rootID: 'vcv-content-root',
          handler: null,
          ignoreHandling: null,
          disabled: false,
          helperType: null
        })
      }
    })
  }
  static api (dnd) {
    return new Api(dnd)
  }
  option (name, value) {
    this.options[name] = value
  }
  init () {
    this.items[this.options.rootID] = new DOMElement(this.options.rootID, this.container, {
      containerFor: this.options.rootContainerFor
    })
    this.handleDragFunction = this.handleDrag.bind(this)
    this.handleDragStartFunction = this.handleDragStart.bind(this)
    this.handleDragEndFunction = this.handleDragEnd.bind(this)
    this.handleRightMouseClickFunction = this.handleRightMouseClick.bind(this)
  }
  addItem (id) {
    let element = cook.get(documentManager.get(id))
    if (!element) { return }
    let containerFor = element.get('containerFor')
    let relatedTo = element.get('relatedTo')
    let domNode = this.container.querySelector('[data-vcv-element="' + id + '"]')
    if (!domNode || !domNode.ELEMENT_NODE) { return }
    this.items[ id ] = new DOMElement(id, domNode, {
      containerFor: containerFor ? containerFor.value : null,
      relatedTo: relatedTo ? relatedTo.value : null,
      parent: element.get('parent') || this.options.rootID,
      handler: this.options.handler,
      tag: element.get('tag')
    })
      .on('dragstart', function (e) { e.preventDefault() })
      .on('mousedown', this.handleDragStartFunction)
      .on('mousedown', this.handleDragFunction)
  }
  updateItem (id) {
    if (!this.items[ id ]) { return }
    this.items[ id ]
      .refresh()
      .off('mousedown', this.handleDragStartFunction)
      .off('mousedown', this.handleDragFunction)
      .on('dragstart', function (e) { e.preventDefault() })
      .on('mousedown', this.handleDragStartFunction)
      .on('mousedown', this.handleDragFunction)
  }
  removeItem (id) {
    this.items[ id ] && this.items[ id ]
      .off('mousedown', this.handleDragStartFunction)
      .off('mousedown', this.handleDragFunction)
    delete this.items[ id ]
  }
  removePlaceholder () {
    if (this.placeholder !== null) {
      this.placeholder.remove()
      this.placeholder = null
    }
  }
  findElementWithValidParent (domElement) {
    var parentElement = domElement.parent() ? this.items[domElement.parent()] : null
    if (parentElement && this.draggingElement.isChild(parentElement)) {
      return domElement
    } else if (parentElement) {
      return this.findElementWithValidParent(parentElement)
    }
    return null
  }
  isDraggingElementParent (domElement) {
    return domElement.$node.parents('[data-vcv-dnd-element="' + this.draggingElement.id + '"]').length > 0
  }
  findDOMNode (point) {
    let domNode
    let targetDomNode = this.options.document.elementFromPoint(point.x, point.y)
    if (targetDomNode && !targetDomNode.getAttribute('data-vcv-dnd-element')) {
      let closest = $(targetDomNode).closest('[data-vcv-dnd-element]').get(0)
      if (closest && closest.dataset.vcvModule !== 'content-layout') {
        domNode = closest
      }
    }
    return domNode
  }
  checkItems (point) {
    let domNode = this.findDOMNode(point)
    if (!domNode || !domNode.ELEMENT_NODE) { return }
    let domElement = this.items[domNode.getAttribute('data-vcv-dnd-element')]
    let parentDOMElement = this.items[domElement.parent()] || null
    if (domElement.isNearBoundaries(point, this.options.boundariesGap) && parentDOMElement && parentDOMElement.id !== this.options.rootID) {
      domElement = this.findElementWithValidParent(parentDOMElement) || domElement
      parentDOMElement = this.items[domElement.parent()] || null
    }
    if (this.isDraggingElementParent(domElement)) {
      return
    }
    let position = this.placeholder.redraw(domElement.node, point, {
      allowBeforeAfter: parentDOMElement && this.draggingElement.isChild(parentDOMElement),
      allowAppend: !this.isDraggingElementParent(domElement) &&
        domElement && this.draggingElement.isChild(domElement) &&
        !documentManager.children(domElement.id).length
    })

    if (position) {
      this.point = point
      this.setPosition(position)
      this.currentElement = domElement.id
      this.placeholder.setCurrentElement(domElement.id)
    }
  }
  setPosition (position) {
    this.position = position
  }
  start (id, point) {
    this.draggingElement = id ? this.items[id] : null
    if (!this.draggingElement) {
      this.draggingElement = null
      return false
    }
    this.options.document.addEventListener('mousedown', this.handleRightMouseClickFunction, false)
    this.options.document.addEventListener('mouseup', this.handleDragEndFunction, false)
    // Create helper/clone of element
    if (this.options.helperType === 'clone') {
      this.helper = new HelperClone(this.draggingElement.node, point)
    } else {
      this.helper = new Helper(this.draggingElement, {
        container: this.options.container
      })
    }

    // Add css class for body to enable visual settings for all document
    this.options.document.body.classList.add('vcv-dnd-dragging--start', 'vcv-is-no-selection')

    this.watchMouse()
    this.createPlaceholder()
    this.scrollEvent = () => {
      this.placeholder.clearStyle()
      this.placeholder.setPoint(0, 0)
      this.check(this.point || {})
    }
    this.options.document.addEventListener('scroll', this.scrollEvent)
    if (typeof this.options.startCallback === 'function') {
      this.options.startCallback(this.draggingElement)
    }
    window.setTimeout(() => {
      this.helper && this.helper.show()
    }, 200)
  }
  end () {
    // Remove helper
    this.helper && this.helper.remove()
    // Remove css class for body
    this.options.document.body.classList.remove('vcv-dnd-dragging--start', 'vcv-is-no-selection')

    this.forgetMouse()
    this.removePlaceholder()
    this.options.document.removeEventListener('scroll', this.scrollEvent)
    this.point = null
    this.manualScroll = false
    if (typeof this.options.endCallback === 'function') {
      this.options.endCallback(this.draggingElement)
    }
    if (this.draggingElement && typeof this.options.moveCallback === 'function' && this.draggingElement.id !== this.currentElement) {
      this.position && this.options.moveCallback(
        this.draggingElement.id,
        this.position,
        this.currentElement
      )
    }
    this.draggingElement = null
    this.currentElement = null
    this.position = null
    this.helper = null
    this.startPoint = null
    if (getData('vcv:layoutCustomMode') !== 'contentEditable' && getData('vcv:layoutCustomMode') !== 'columnResizer' && getData('vcv:layoutCustomMode') !== null) {
      setData('vcv:layoutCustomMode', null)
    }
    // Set callback on dragEnd
    this.options.document.removeEventListener('mouseup', this.handleDragEndFunction, false)
  }
  scrollManually (point) {
    let body = this.options.document.body
    let clientHeight = this.options.document.documentElement.clientHeight
    let top = null
    let speed = 30
    let gap = 10
    if (clientHeight - gap <= point.y) {
      top = body.scrollTop + speed
    } else if (point.y <= gap && body.scrollTop >= speed) {
      top = body.scrollTop - speed
    }
    if (top !== null) {
      body.scrollTop = top > 0 ? top : 0
    }
  }
  check (point = null) {
    if (this.options.disabled === true) {
      this.handleDragEnd()
      return
    }
    if (getData('vcv:layoutCustomMode') !== 'dnd') {
      setData('vcv:layoutCustomMode', 'dnd')
    }
    this.manualScroll && this.scrollManually(point)
    window.setTimeout(() => {
      if (!this.startPoint) {
        this.startPoint = point
      }
    }, 0)
    this.helper && this.helper.setPosition(point)
    this.placeholder && this.checkItems(point)
  }

  // Mouse events
  watchMouse () {
    this.options.document.body.addEventListener('mousemove', this.handleDragFunction, false)
  }
  forgetMouse () {
    this.options.document.body.removeEventListener('mousemove', this.handleDragFunction, false)
  }
  createPlaceholder () {
    this.placeholder = new SmartLine(_.pick(this.options, 'document', 'container'))
  }
  /**
   * Drag handlers
   */
  handleDrag (e) {
    // disable dnd on right button click
    if (e.button && e.button === 2) {
      this.handleDragEnd()
      return false
    }
    e.clientX !== undefined && e.clientY !== undefined && this.check({ x: e.clientX, y: e.clientY })
  }
  /**
   * @param {object} e Handled event
   */
  handleDragStart (e) {
    if (this.options.disabled === true || this.dragStartHandled) { // hack not to use stopPropogation
      return
    }
    if (this.options.ignoreHandling && $(e.currentTarget).is(this.options.ignoreHandling)) {
      return
    }
    if (!this.dragStartHandled) {
      this.dragStartHandled = true
    }
    if (e.which > 1) {
      return
    }
    let id = e.currentTarget.getAttribute('data-vcv-dnd-element-handler')
    this.start(id, { x: e.clientX, y: e.clientY })
  }
  handleDragEnd () {
    this.dragStartHandled = false
    this.end()
  }
  handleRightMouseClick (e) {
    if (e.button && e.button === 2) {
      this.options.document.removeEventListener('mousedown', this.handleRightMouseClickFunction, false)
      this.handleDragEnd()
    }
  }
}
