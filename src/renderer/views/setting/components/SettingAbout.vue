<template lang="pug">
dt#about {{$t('setting__about')}}
dd
  p.small
    | 本软件完全免费：
    span.hover.underline(:aria-label="$t('setting__click_open')" @click="openUrl('/')") NONE
  p.small
  
  br
  p.small
    strong 本软件没有客服
    | ，但我们整理了一些常见的使用问题，
    strong 仔细 仔细 仔细
    | 地阅读常见问题后，

  br
  p.small 由于软件开发的初衷仅是为了对新技术的学习与研究，因此软件直至停止维护都将会一直保持纯净。

  p.small
    | 你已签署本软件的&nbsp;
    base-btn(min @click="handleShowPact") 许可协议
    | ，协议的在线版本在&nbsp;
    strong.hover.underline(:aria-label="$t('setting__click_open')" @click="openUrl('/')") 这里
    | &nbsp;。
  br

  p
    | 作者By: 
    | 清韵云
  p
    | 主题By: 
    | Folltoshe
  p
    | 部分主题By: 
    | lerd
</template>

<script>
// import { ref, onBeforeUnmount } from '@renderer/utils/vueTools'
import { isShowPact } from '@renderer/core/share'
import { openUrl, clipboardWriteText } from '@renderer/utils'
import { currentStting } from '../setting'

export default {
  name: 'SettingAbout',
  setup() {
    const handleShowPact = () => {
      isShowPact.value = true
    }
    return {
      currentStting,
      openUrl,
      clipboardWriteText,
      handleShowPact,
    }
  },
}
</script>
