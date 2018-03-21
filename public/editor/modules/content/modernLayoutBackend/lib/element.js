import vcCake from 'vc-cake'
import React from 'react'
import DefaultElement from './defaultElement'
import ContentControls from '../../../../../resources/components/layoutHelpers/contentControls/component'
import {isEqual} from 'lodash'
import PropTypes from 'prop-types'

const cook = vcCake.getService('cook')
const DocumentData = vcCake.getService('document')
const elementsStorage = vcCake.getStorage('elements')
const assetsStorage = vcCake.getStorage('assetsBackend')

export default class Element extends React.Component {
  static propTypes = {
    element: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired,
    layoutWidth: PropTypes.number.isRequired
  }

  // element (row/column) options to prevent applying of in the backend view
  elementOptions = [ 'columnGap', 'fullHeight', 'equalHeight', 'rowWidth', 'designOptionsAdvanced', 'dividers' ]

  constructor (props) {
    super(props)
    this.state = {
      element: props.element
    }
    this.dataUpdate = this.dataUpdate.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (!isEqual(this.props, nextProps)) {
      assetsStorage.trigger('updateElement', this.state.element.id)
    }
    this.setState({ element: nextProps.element })
  }

  componentDidMount () {
    this.props.api.notify('element:mount', this.props.element.id)
    if (vcCake.env('TF_RENDER_PERFORMANCE')) {
      elementsStorage.on(`element:${this.state.element.id}`, this.dataUpdate)
    } else {
      elementsStorage.state('element:' + this.state.element.id).onChange(this.dataUpdate)
    }
    assetsStorage.trigger('addElement', this.state.element.id)
    // rename row/column id to prevent applying of DO
    let element = document.querySelector(`#el-${this.props.element.id}`)
    if (element) {
      element.id = `el-${this.props.element.id}-temp`
    }
  }

  componentWillUnmount () {
    this.props.api.notify('element:unmount', this.props.element.id)
    if (vcCake.env('TF_RENDER_PERFORMANCE')) {
      elementsStorage.off(`element:${this.state.element.id}`, this.dataUpdate)
    } else {
      elementsStorage.state('element:' + this.state.element.id).ignoreChange(this.dataUpdate)
    }
    assetsStorage.trigger('removeElement', this.state.element.id)
    let element = document.querySelector(`#el-${this.props.element.id}-temp`)
    if (element) {
      element.id = `el-${this.props.element.id}`
    }
  }

  componentDidUpdate () {
    this.props.api.notify('element:didUpdate', this.props.element.id)
  }

  dataUpdate (data, source, options) {
    this.setState({ element: data || this.props.element })
    assetsStorage.trigger('updateElement', this.state.element.id, options)
  }

  getContent () {
    let { element, api, layoutWidth } = this.props
    const currentElement = cook.get(element)
    let elementsList = DocumentData.children(currentElement.get('id')).map((childElement) => {
      return <Element
        element={childElement}
        key={'vcvGetContentElement' + childElement.id}
        api={api}
        layoutWidth={layoutWidth}
      />
    })
    return elementsList.length ? elementsList : <ContentControls api={api} id={currentElement.get('id')} />
  }

  visualizeAttributes (element) {
    let layoutAtts = {}
    let atts = element.getAll(false)
    Object.keys(atts).forEach((key) => {
      let findOption = this.elementOptions.find((option) => {
        return option === key
      })
      if (findOption) {
        layoutAtts[ key ] = element.settings(findOption).settings.value
      } else {
        layoutAtts[ key ] = atts[ key ]
      }
    })
    return layoutAtts
  }

  getOutput (el) {
    let { api, layoutWidth, ...other } = this.props
    let { element } = this.state
    if (!el) {
      return null
    }
    let id = el.get('id')
    let ContentComponent = el.getContentComponent()
    if (!ContentComponent) {
      return null
    }
    let editor = {
      'data-vcv-element': id
    }
    if (el.get('metaDisableInteractionInEditor')) {
      editor[ 'data-vcv-element-disable-interaction' ] = true
    }

    if (el.get('backendView') === 'frontend') {
      return <ContentComponent
        id={id}
        isBackend={'true'}
        key={'vcvLayoutContentComponent' + id}
        atts={this.visualizeAttributes(el)}
        editor={editor}
        {...other}
      >
        {this.getContent()}
      </ContentComponent>
    }
    return <DefaultElement
      key={'vcvLayoutDefaultElement' + id}
      api={api}
      element={element}
      layoutWidth={layoutWidth}
    />
  }

  render () {
    let el = cook.get(this.state.element)
    return this.getOutput(el)
  }
}
