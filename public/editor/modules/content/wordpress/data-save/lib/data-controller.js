import vcCake from 'vc-cake'
import $ from 'jquery'
import React from 'react'

// const AssetManager = vcCake.getService('assets-manager')
const DocumentData = vcCake.getService('document')

class SaveController {
  constructor (props) {
    this.props = props
    this.props.api.reply('wordpress:save', (options) => {
      options = $.extend({}, {
        elements: DocumentData.all()
      }, options)
      this.save(options)
    })

    this.props.api.reply('wordpress:load', this.load)
  }

  ajax (data, successCallback, failureCallback) {
    data = $.extend({}, {
      'vcv-nonce': window.vcvNonce,
      'vcv-source-id': window.vcvSourceID
    }, data)

    let request = new window.XMLHttpRequest()
    request.open('POST', window.vcvAjaxUrl, true)
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        successCallback.call(this, request)
      } else {
        if (typeof failureCallback === 'function') {
          failureCallback.call(this, request)
        }
      }
    }

    request.send($.param(data))
  }

  save (data) {
    let content = document.getElementsByClassName('vcv-layouts-clean-html')[ 0 ].innerHTML.replace(
      /\s+data-reactid="[^"]+"/,
      '')
    let scripts = 'body {color: red}' // AssetManager.getAssets('scripts')
    let styles = 'console.log(3)' // AssetManager.get
    this.ajax(
      {
        'vcv-action': 'setData:adminNonce',
        'vcv-content': content,
        'vcv-data': encodeURIComponent(JSON.stringify(data)),
        'vcv-scripts': scripts,
        'vcv-styles': styles,
        'vcv-elements-list': encodeURIComponent(JSON.stringify({}))
      },
      this.saveSuccess.bind(this),
      this.saveFailed.bind(this)
    )
  }

  saveSuccess (request) {
    let data = JSON.parse(request.responseText || '{}')
    if (data.postData) {
      window.vcvPostData = data.postData
    }

    this.props.api.request('wordpress:data:saved', {
      status: 'success',
      request: request
    })
  }

  saveFailed (request) {
    this.props.api.request('wordpress:data:saved', {
      status: 'failed',
      request: request
    })
  }

  load = (data) => {
    this.ajax(
      {
        'vcv-action': 'getData:adminNonce',
        'vcv-data': encodeURIComponent(JSON.stringify(data))
      },
      this.loadSuccess,
      this.loadFailed
    )
  }

  loadSuccess = (request) => {
    this.props.api.request('wordpress:data:loaded', {
      status: 'success',
      request: request
    })
  }

  loadFailed = (request) => {
    this.props.api.request('wordpress:data:loaded', {
      status: 'failed',
      request: request
    })
  }
}
SaveController.propTypes = {
  api: React.PropTypes.object.isRequired
}

export default SaveController
