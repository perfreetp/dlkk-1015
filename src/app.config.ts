export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/activity/index',
    'pages/message/index',
    'pages/mine/index',
    'pages/post/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '邻里社区',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F9FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#00B578',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/category/index',
        text: '分类'
      },
      {
        pagePath: 'pages/activity/index',
        text: '活动'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
