const { getNow, TimeoutTools } = require('./utils')

// const fontFormateRxp = /(?=<\d+,\d+>).*?/g
const fontSplitRxp = /(?=<\d+,\d+>).*?/g
const timeRxp = /<(\d+),(\d+)>/


// Create animation
const createAnimation = (dom, duration) => new window.Animation(new window.KeyframeEffect(dom, [
  { backgroundSize: '0 100%' },
  { backgroundSize: '100% 100%' },
], {
  duration,
  easing: 'linear',
},
), document.timeline)


// https://jsfiddle.net/ceqpnbky/
// https://jsfiddle.net/ceqpnbky/1/

module.exports = class FontPlayer {
  constructor({ time = 0, lyric = '', extendedLyrics = '', lineClassName = '', fontClassName = '', extendedLrcClassName = '', lineModeClassName = '', shadowContent = false, shadowClassName = '' }) {
    this.time = time
    this.lyric = lyric
    this.extendedLyrics = extendedLyrics

    this.lineClassName = lineClassName
    this.fontClassName = fontClassName
    this.extendedLrcClassName = extendedLrcClassName
    this.lineModeClassName = lineModeClassName
    this.shadowContent = shadowContent
    this.shadowClassName = shadowClassName

    this.isPlay = false
    this.curFontNum = 0
    this.maxFontNum = 0
    this._performanceTime = 0
    this._startTime = 0

    this.fontContent = null

    this.timeoutTools = new TimeoutTools(80)
    this.waitPlayTimeout = new TimeoutTools(80)

    this._init()
  }

  _init() {
    if (this.lyric == null) this.lyric = ''

    this.isLineMode = false

    this.lineContent = document.createElement('div')
    this.lineContent.time = this.time
    if (this.lineClassName) this.lineContent.classList.add(this.lineClassName)
    this.fontContent = document.createElement('div')
    this.fontContent.style = 'position:relative;display:inline-block;'
    if (this.fontClassName) this.fontContent.classList.add(this.fontClassName)
    if (this.shadowContent) {
      this.fontShadowContent = document.createElement('div')
      this.fontShadowContent.style = 'position:absolute;top:0;left:0;width:100%;z-index:-1;'
      this.fontShadowContent.className = this.shadowClassName
      this.fontContent.appendChild(this.fontShadowContent)
    }
    this.lineContent.appendChild(this.fontContent)
    for (const lrc of this.extendedLyrics) {
      const extendedLrcContent = document.createElement('div')
      extendedLrcContent.style = 'position:relative;display:inline-block;'
      extendedLrcContent.className = this.extendedLrcClassName
      extendedLrcContent.textContent = lrc
      this.lineContent.appendChild(document.createElement('br'))
      this.lineContent.appendChild(extendedLrcContent)

      if (this.shadowContent) {
        const extendedLrcShadowContent = document.createElement('div')
        extendedLrcShadowContent.style = 'position:absolute;top:0;left:0;width:100%;z-index:-1;'
        extendedLrcShadowContent.className = this.shadowClassName
        extendedLrcShadowContent.textContent = lrc
        extendedLrcContent.appendChild(extendedLrcShadowContent)
      }
    }
    this._parseLyric()
  }

  _parseLyric() {
    const fonts = this.lyric.split(fontSplitRxp)
    // console.log(fonts)

    this.maxFontNum = fonts.length - 1
    this.fonts = []
    let text
    for (const font of fonts) {
      text = font.replace(timeRxp, '')
      if (RegExp.$2 == '') return this._handleLineParse()
      const time = parseInt(RegExp.$2)

      const dom = document.createElement('span')
      let shadowDom
      dom.textContent = text
      const animation = createAnimation(dom, time)
      this.fontContent.appendChild(dom)

      if (this.shadowContent) {
        shadowDom = document.createElement('span')
        shadowDom.textContent = text
        this.fontShadowContent.appendChild(shadowDom)
      }
      // dom.style = shadowDom.style = this.fontStyle
      // dom.className = shadowDom.className = this.fontClassName

      this.fonts.push({
        text,
        startTime: parseInt(RegExp.$1),
        time,
        dom,
        shadowDom,
        animation,
      })
    }
    // console.log(this.fonts)
  }

  _handleLineParse() {
    this.isLineMode = true
    const dom = document.createElement('span')
    let shadowDom
    dom.classList.add(this.lineModeClassName)
    dom.textContent = this.lyric
    if (this.shadowContent) {
      shadowDom = document.createElement('span')
      shadowDom.textContent = this.lyric
      this.fontShadowContent.appendChild(shadowDom)
    }
    this.fontContent.appendChild(dom)
    this.fonts.push({
      text: this.lyric,
      dom,
      shadowDom,
    })
  }

  _currentTime() {
    return getNow() - this._performanceTime + this._startTime
  }

  _findcurFontNum(curTime, startIndex = 0) {
    const length = this.fonts.length
    for (let index = startIndex; index < length; index++) if (curTime < this.fonts[index].startTime) return index == 0 ? 0 : index - 1
    return length - 1
  }

  _handlePlayMaxFontNum() {
    let curFont = this.fonts[this.curFontNum]
    // console.log(curFont.text)
    const currentTime = this._currentTime()
    const driftTime = currentTime - curFont.startTime
    if (currentTime > curFont.startTime + curFont.time) {
      this._handlePlayFont(curFont, driftTime, true)
      this.pause()
    } else {
      this._handlePlayFont(curFont, driftTime)
      this.isPlay = false
    }
  }

  _handlePlayFont(font, currentTime, toFinishe) {
    switch (font.animation.playState) {
      case 'finished':
        break
      case 'idle':
        font.dom.style.backgroundSize = '100% 100%'
        if (!toFinishe) font.animation.play()
        break
      default:
        if (toFinishe) {
          font.animation.cancel()
        } else {
          font.animation.currentTime = currentTime
          font.animation.play()
        }
        break
    }
  }

  _handlePlayLine(isPlayed) {
    this.isPlay = false
    this.fonts[0].dom.style.backgroundSize = isPlayed ? '100% 100%' : '100% 0'
  }

  _handlePauseFont(font) {
    if (font.animation.playState == 'running') font.animation.pause()
  }

  _refresh() {
    this.curFontNum++
    // console.log('curFontNum time', this.fonts[this.curFontNum].time)
    if (this.curFontNum >= this.maxFontNum) return this._handlePlayMaxFontNum()
    let curFont = this.fonts[this.curFontNum]
    // console.log(curFont, nextFont, this.curFontNum, this.maxFontNum)
    const currentTime = this._currentTime()
    // console.log(curFont.text)
    const driftTime = currentTime - curFont.startTime

    // console.log(currentTime, driftTime)

    if (driftTime >= 0 || this.curFontNum == 0) {
      let nextFont = this.fonts[this.curFontNum + 1]
      this.delay = nextFont.startTime - curFont.startTime - driftTime
      if (this.delay > 0) {
        if (this.isPlay) {
          this.timeoutTools.start(() => {
            if (!this.isPlay) return
            this._refresh()
          }, this.delay)
        }
        this._handlePlayFont(curFont, driftTime)
        return
      } else {
        let newCurLineNum = this._findcurFontNum(currentTime, this.curFontNum + 1)
        if (newCurLineNum > this.curFontNum) this.curFontNum = newCurLineNum - 1
        for (let i = 0; i <= this.curFontNum; i++) this._handlePlayFont(this.fonts[i], 0, true)
        this._refresh()
        return
      }
    } else if (this.curFontNum == 0) {
      this.curFontNum--
      if (this.isPlay) {
        this.waitPlayTimeout.start(() => {
          if (!this.isPlay) return
          this._refresh()
        }, -driftTime)
      }
      return
    }

    this.curFontNum = this._findcurFontNum(currentTime, this.curFontNum) - 1
    for (let i = 0; i <= this.curFontNum; i++) this._handlePlayFont(this.fonts[i], 0, true)
    // this.curFontNum--
    this._refresh()
  }

  play(curTime = 0) {
    // console.log('play', curTime)
    if (!this.fonts.length) return
    this.pause()

    if (this.isLineMode) return this._handlePlayLine(true)
    this.isPlay = true
    this._performanceTime = getNow()
    this._startTime = curTime

    this.curFontNum = this._findcurFontNum(curTime)

    for (let i = this.curFontNum; i > -1; i--) {
      this._handlePlayFont(this.fonts[i], 0, true)
    }
    for (let i = this.curFontNum, len = this.fonts.length; i < len; i++) {
      let font = this.fonts[i]
      font.animation.cancel()
      font.dom.style.backgroundSize = '0 100%'
    }

    this.curFontNum--

    this._refresh()
  }

  pause() {
    if (!this.isPlay) return
    this.isPlay = false
    this.timeoutTools.clear()
    this.waitPlayTimeout.clear()
    this._handlePauseFont(this.fonts[this.curFontNum])
    if (this.curFontNum === this.maxLine) return
    const curFontNum = this._findcurFontNum(this._currentTime())
    if (this.curFontNum === curFontNum) return
    for (let i = 0; i < this.curFontNum; i++) this._handlePlayFont(this.fonts[i], 0, true)
  }

  finish() {
    this.pause()
    if (this.isLineMode) return this._handlePlayLine(true)

    for (const font of this.fonts) {
      font.animation.cancel()
      font.dom.style.backgroundSize = '100% 100%'
    }
    this.curFontNum = this.maxFontNum
  }

  reset() {
    this.pause()
    if (this.isLineMode) return this._handlePlayLine(false)
    for (const font of this.fonts) {
      font.animation.cancel()
      font.dom.style.backgroundSize = '0 100%'
    }
    this.curFontNum = 0
  }
}

