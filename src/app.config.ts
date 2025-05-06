export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/edit/edit',
    'pages/login/login',
    'pages/personal/personal',
    'pages/travelogue/travelogue',

    'pages/admin/admin',
    'pages/adminlogin/adminlogin',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
