import * as types from '../../mutation-types'
import lazyLoading from './lazyLoading'
import admin from './admin'

// show: meta.label -> name
// name: component name
// meta.label: display label

const state = {
  items: [
    {
      name: 'Home',
      path: '/',
      meta: {
        icon: 'fa-home'
      },
      component: lazyLoading('Home', false)
    },
    {
      name: 'Charts',
      path: '/charts',
      meta: {
        icon: 'fa-tachometer'
      },
      component: lazyLoading('charts', true)
    },
    {
      name: 'Configurations',
      path: '/configurations',
      meta: {
        icon: 'fa-laptop'
      },
      component: lazyLoading('tiles', true)
    },
    {
      name: 'Results',
      path: '/results',
      meta: {
        icon: 'fa-table'
      },
      component: lazyLoading('results', true)
    },
    admin
  ]
}

const mutations = {
  [types.EXPAND_MENU] (state, menuItem) {
    if (menuItem.index > -1) {
      if (state.items[menuItem.index] && state.items[menuItem.index].meta) {
        state.items[menuItem.index].meta.expanded = menuItem.expanded
      }
    } else if (menuItem.item && 'expanded' in menuItem.item.meta) {
      menuItem.item.meta.expanded = menuItem.expanded
    }
  }
}

export default {
  state,
  mutations
}
