import zh_cn from './zh-cn.json'
import zh_tw from './zh-tw.json'

const langs = [
  {
    name: '简体中文',
    locale: 'zh-cn',
    alternate: 'zh-hans',
    country: 'cn',
    fallback: true,
    message: zh_cn,
  },
  {
    name: '繁体中文',
    locale: 'zh-tw',
    alternate: 'zh-hk',
    country: 'cn',
    message: zh_tw,
  },
  {
    name: 'English',
    locale: 'en-us',
    country: 'us',
    message: en_us,
  },
]

const langList = []
const messages = {}
langs.forEach(item => {
  langList.push({
    name: item.name,
    locale: item.locale,
    alternate: item.alternate,
  })
  messages[item.locale] = item.message
})

export {
  langList,
  messages,
}
