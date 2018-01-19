import React from 'react'
import classNames from 'classnames'
import NavbarContent from '../navbarContent'
import MobileDetect from 'mobile-detect'
import { getStorage, env } from 'vc-cake'

// const assetsStorage = getService('assetsStorage')
const workspaceStorage = getStorage('workspace')
const settingsStorage = getStorage('settings')
const workspaceContentStartState = getStorage('workspace').state('contentStart')
const workspaceContentEndState = workspaceStorage.state('contentEnd')
const workspaceContentState = getStorage('workspace').state('content')
const workspaceSettings = getStorage('workspace').state('settings')

export default class SettingsButtonControl extends NavbarContent {
  constructor (props) {
    super(props)
    this.state = {
      isActive: workspaceContentState.get() === 'settings',
      showWarning: false // !!assetsStorage.getCustomCss()
    }
    this.toggleSettings = this.toggleSettings.bind(this)
    this.checkSettings = this.checkSettings.bind(this)
    this.setActiveState = this.setActiveState.bind(this)
    if (env('editor') === 'frontend' && env('PAGE_TITLE_FE')) {
      this.checkPageTitle()
    }
  }

  componentWillReceiveProps () {
    this.checkSettings()
  }

  setActiveState (state) {
    this.setState({ isActive: state === 'settings' })
  }

  componentDidMount () {
    if (env('NAVBAR_SINGLE_CONTENT')) {
      workspaceContentState.onChange(this.setActiveState)
    } else {
      workspaceContentEndState.onChange(this.setActiveState)
    }
    settingsStorage.state('customCss').onChange(this.checkSettings)
    settingsStorage.state('globalCss').onChange(this.checkSettings)
  }

  componentWillUnmount () {
    if (env('NAVBAR_SINGLE_CONTENT')) {
      workspaceContentState.ignoreChange(this.setActiveState)
    } else {
      workspaceContentEndState.ignoreChange(this.setActiveState)
    }
    settingsStorage.state('customCss').ignoreChange(this.checkSettings)
    settingsStorage.state('globalCss').ignoreChange(this.checkSettings)
  }

  checkPageTitle () {
    let titleData = window.VCV_PAGE_TITLE && window.VCV_PAGE_TITLE() || {}
    let pageTitle = settingsStorage.state('pageTitle').get()
    let pageTitleDisabled = settingsStorage.state('pageTitleDisabled').get()
    let data = {
      current: pageTitle !== undefined ? pageTitle : titleData.current,
      disabled: pageTitleDisabled !== undefined ? pageTitleDisabled : titleData.disabled
    }
    let iframe = document.getElementById('vcv-editor-iframe')
    if (iframe) {
      let titles = [].slice.call(iframe.contentDocument.querySelectorAll('vcvtitle'))
      if (titles) {
        titles.forEach(title => {
          title.innerText = data.current
          title.style.display = data.disabled ? 'none' : ''
          title.onclick = () => {
            workspaceContentState.set('settings')
          }
        })
      }
    }
  }

  checkSettings () {
    const customCss = settingsStorage.state('customCss').get() || ''
    const globalCss = settingsStorage.state('globalCss').get() || ''
    this.setState({ showWarning: customCss.length || globalCss.length })
  }

  toggleSettings (e) {
    e && e.preventDefault()
    if (env('MOBILE_DETECT')) {
      const mobileDetect = new MobileDetect(window.navigator.userAgent)
      if (mobileDetect.mobile() && (mobileDetect.tablet() || mobileDetect.phone())) {
        workspaceContentStartState.set(false)
      }
    }
    if (env('NAVBAR_SINGLE_CONTENT')) {
      workspaceContentState.set(!this.state.isActive ? 'settings' : false)
      if (env('HUB_REDESIGN')) {
        workspaceSettings.set({ action: 'settings' })
      }
      return
    }
    workspaceContentEndState.set(!this.state.isActive ? 'settings' : false)
  }

  render () {
    const localizations = window.VCV_I18N && window.VCV_I18N()
    const name = localizations ? localizations.settings : 'Settings'

    let controlClass = classNames({
      'vcv-ui-navbar-control': true,
      'vcv-ui-pull-end': true,
      'vcv-ui-state--active': this.state.isActive
    })
    let iconClass = classNames({
      'vcv-ui-navbar-control-icon': true,
      'vcv-ui-icon': true,
      'vcv-ui-icon-cog': true,
      'vcv-ui-badge--warning': false
    })

    return (
      <span className={controlClass} title={name} onClick={this.toggleSettings}>
        <span className='vcv-ui-navbar-control-content'>
          <i className={iconClass} />
          <span>{name}</span>
        </span>
      </span>
    )
  }
}
