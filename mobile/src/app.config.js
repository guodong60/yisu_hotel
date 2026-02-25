export default defineAppConfig({
  pages: [
    'pages/home/index',   // 首页
    'pages/mine/index',   // 新增的“我的”页面
    'pages/list/index',
    'pages/detail/index',
    'pages/login/index',
    'pages/register/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0066FF',
    navigationBarTitleText: '易宿酒店',
    navigationBarTextStyle: 'white'
  },
  // 👇 核心配置：底部导航栏
  tabBar: {
    color: "#999",
    selectedColor: "#0066FF",
    backgroundColor: "#fff",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/home/index",
        text: "首页",
        iconPath: "./assets/home.png",          // 👈 重点：前面一定要加 ./
        selectedIconPath: "./assets/home.png"   // 👈 顺便把选中状态的图也补上
      },
      {
        pagePath: "pages/mine/index",
        text: "我的",
        iconPath: "./assets/user.png",          // 👈 重点：前面一定要加 ./
        selectedIconPath: "./assets/user.png"   // 👈 顺便把选中状态的图也补上
      }
    ]
  }
})