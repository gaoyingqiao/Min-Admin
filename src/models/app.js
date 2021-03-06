import * as appServices from '../services/app';
import config from '../utils/config';
import { notification } from 'antd';

export default {
  namespace: 'app',
  state: {
    login: !config.loginConfig.needLogin || sessionStorage.getItem('login')==='true',
    menuPopoverVisible: false,
    siderFold: localStorage.getItem('antdAdminSiderFold')==='true',
    isNavbar: document.body.clientWidth < 769,
    user: JSON.parse(sessionStorage.getItem('user')) || { nickname: 'guest' },
    menuOpenKeys: [],
  },
  effects: {
    *login ({ payload }, { call, put }) {
      //登录effect，登录请自定义
      // const res = yield call(appServices.login, payload);
      // console.log(res);
      // const data = res.data;
      // if (data.errcode===0) {
        yield put({
          type: 'loginSuccess',
          payload: {
            //登录成功后的put数据
            // user: data.data.user,
            //登录展示
            user:{nickname:payload.user_id},
          }
        })
      // } else {
      //   notification.error({ message: '账号密码有误！', description: res.data.msg });
      // }
    },

    *logout ({}, { call, put }) {
      //登出effect，请自定义接口
      // const res = yield call(appServices.logout);
      // if (res.data.errcode===0) {
        yield put({
          type: 'logoutSuccess'
        })
      // }
    },

    *changeNavbar ({}, { put }) {
      if (document.body.clientWidth < 769) {
        yield put({ type: 'showNavbar' })
      } else {
        yield put({ type: 'hideNavbar' })
      }
    },
  },
  reducers: {
    loginSuccess (state, action) {
      window.sessionStorage.setItem('login', true);
      window.sessionStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        ...action.payload,
        login: true,
      }
    },
    logoutSuccess (state) {
      window.sessionStorage.setItem('login', false);
      window.sessionStorage.removeItem('user');
      return {
        ...state,
        login: false,
        user: {}
      }
    },
    //切换收缩模式
    switchSider (state, action) {
      localStorage.setItem('antdAdminSiderFold', !state.siderFold)
      return {
        ...state,
        siderFold: !state.siderFold,
        menuOpenKeys: state.siderFold ? action.payload.split('/') : [null],
      }
    },
    //切换小屏幕
    showNavbar (state) {
      return {
        ...state,
        isNavbar: true
      }
    },
    hideNavbar (state) {
      return {
        ...state,
        isNavbar: false
      }
    },
    //点击小屏幕菜单
    switchMenuPopver (state) {
      return {
        ...state,
        menuPopoverVisible: !state.menuPopoverVisible,
      }
    },
    //改变菜单
    changeMenu(state, action){
      return {
        ...state,
        menuOpenKeys: action.payload,
      }
    }
  },
  subscriptions: {
    setup({ dispatch, history }){
      window.onresize = () => dispatch({ type: 'changeNavbar' })
      //监听路由转换，转换后切换菜单
      history.listen(({ pathname }) => {
        //监听login路由
        if (pathname==='/login') {
          notification.error({ message: '出错', description: '请登录' });
          dispatch({ type: 'logoutSuccess' });
          history.push('/');
        } else {
          //路由改变时改变菜单的打开状态
          dispatch({
            type: 'changeMenu',
            payload: localStorage.getItem('antdAdminSiderFold')==='true' ? [] : pathname.split('/'),
          })
        }
      })

    }
  },
};
