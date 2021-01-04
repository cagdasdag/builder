import React from 'react'
import classNames from 'classnames'
import Item from './item'
import MobileDetect from 'mobile-detect'
import { env, getService } from 'vc-cake'

const dataManager = getService('dataManager')

export default class LayoutButtonControl extends React.Component {
  static localizations = dataManager.get('localizations')
  static devices = [
    {
      type: LayoutButtonControl.localizations ? LayoutButtonControl.localizations.desktop : 'Desktop',
      className: 'desktop',
      viewport: {
        width: '1200',
        height: '880',
        min: '1200',
        max: Infinity
      }
    },
    {
      type: LayoutButtonControl.localizations ? LayoutButtonControl.localizations.tabletLandscape : 'Tablet Landscape',
      className: 'tablet-landscape',
      viewport: {
        width: '1220',
        height: '818',
        min: '992',
        max: '1199'
      }
    },
    {
      type: LayoutButtonControl.localizations ? LayoutButtonControl.localizations.tabletPortrait : 'Tablet Portrait',
      className: 'tablet-portrait',
      viewport: {
        width: '818',
        height: '1220',
        min: '768',
        max: '991'
      }
    },
    {
      type: LayoutButtonControl.localizations ? LayoutButtonControl.localizations.mobileLandscape : 'Mobile Landscape',
      className: 'mobile-landscape',
      viewport: {
        width: '664',
        height: '340',
        min: '554',
        max: '767'
      }
    },
    {
      type: LayoutButtonControl.localizations ? LayoutButtonControl.localizations.mobilePortrait : 'Mobile Portrait',
      className: 'mobile-portrait',
      viewport: {
        width: '340',
        height: '664',
        min: '0',
        max: '553'
      }
    },
    {
      type: LayoutButtonControl.localizations ? LayoutButtonControl.localizations.responsiveView : 'Responsive View',
      className: 'multiple-devices',
      viewport: {
        width: null,
        min: null,
        max: null
      }
    }
  ]

  constructor (props) {
    super(props)
    this.state = {
      activeDevice: 0,
      isControlActive: false
    }
    this.contentRef = React.createRef()

    const mobileDetect = new MobileDetect(window.navigator.userAgent)
    if (mobileDetect.mobile()) {
      this.isMobile = true
    }

    if (env('VCV_JS_THEME_EDITOR')) {
      this.editorType = dataManager.get('editorType')
    }

    this.handleClickSetSelectedLayout = this.handleClickSetSelectedLayout.bind(this)
    this.handleControlClick = this.handleControlClick.bind(this)
    this.handleWindowResize = this.handleWindowResize.bind(this)
  }

  handleClickSetSelectedLayout (index) {
    const variableName = LayoutButtonControl.devices[index]
    this.setViewport(variableName.viewport.width, variableName.viewport.height, variableName.className)
    this.setState({
      activeDevice: index
    })
  }

  handleWindowResize () {
    const bodyClasses = document.body.classList
    const contentRect = this.contentRef.current.getBoundingClientRect()
    if (!this.state.isVerticalPositioned && (bodyClasses.contains('vcv-layout-dock--left') || bodyClasses.contains('vcv-layout-dock--right'))) {
      if (contentRect.bottom > window.innerHeight) {
        this.setState({ isVerticalPositioned: true })
      }
    } else if (!this.state.isHorizontalPositioned && (bodyClasses.contains('vcv-layout-dock--top') || bodyClasses.contains('vcv-layout-dock--bottom'))) {
      if (contentRect.right > window.innerWidth) {
        this.setState({ isHorizontalPositioned: true })
      }
    }
  }

  handleControlClick () {
    this.setState({ isControlActive: !this.state.isControlActive })
    if (!this.state.isControlActive) {
      window.addEventListener('resize', this.handleWindowResize)
      setTimeout(this.handleWindowResize, 1)
    } else {
      window.removeEventListener('resize', this.handleWindowResize)
      this.setState({
        isVerticalPositioned: false,
        isHorizontalPositioned: false
      })
    }
  }

  setViewport (width, height, device) {
    const layoutContent = window.document.querySelector('.vcv-layout-content')
    const iframeContainer = window.document.querySelector('.vcv-layout-iframe-container')
    layoutContent.style.padding = width ? '30px' : ''
    iframeContainer.style.width = width ? width + 'px' : ''
    iframeContainer.style.minHeight = height ? height + 'px' : ''
    iframeContainer.setAttribute('data-vcv-device', device)
  }

  render () {
    const controlIconClasses = classNames(
      'vcv-ui-navbar-control-icon',
      'vcv-ui-icon',
      'vcv-ui-icon-' + LayoutButtonControl.devices[this.state.activeDevice].className
    )

    const activeDevice = (
      <span className='vcv-ui-navbar-control-content'>
        <i className={controlIconClasses} />
        <span>{LayoutButtonControl.devices[this.state.activeDevice].type}</span>
      </span>
    )

    const navbarControlClasses = classNames({
      'vcv-ui-navbar-dropdown': true,
      'vcv-ui-navbar-dropdown--active': this.state.isControlActive,
      'vcv-ui-navbar-dropdown-linear': true,
      'vcv-ui-pull-end': true
    })
    const navbarContentClasses = classNames({
      'vcv-ui-navbar-dropdown-content': true,
      'vcv-ui-navbar-dropdown-content--visible': this.state.isControlActive,
      'vcv-ui-navbar-dropdown-content--vertical': this.state.isVerticalPositioned,
      'vcv-ui-navbar-dropdown-content--horizontal': this.state.isHorizontalPositioned
    })

    const layoutItems = []
    LayoutButtonControl.devices.forEach((item, index) => {
      layoutItems.push(
        <Item key={index} device={item} index={index} onChange={this.handleClickSetSelectedLayout} />
      )
    })

    if (this.isMobile || (env('VCV_JS_THEME_EDITOR') && this.editorType === 'sidebar')) {
      return null
    }

    return (
      <dl
        className={navbarControlClasses}
        tabIndex='0'
        data-vcv-guide-helper='layout-control'
      >
        <dt
          className='vcv-ui-navbar-dropdown-trigger vcv-ui-navbar-control'
          title={LayoutButtonControl.devices[this.state.activeDevice].type}
          onClick={this.handleControlClick}
        >
          {activeDevice}
        </dt>
        <dd className={navbarContentClasses} ref={this.contentRef}>
          {layoutItems}
        </dd>
      </dl>
    )
  }
}
