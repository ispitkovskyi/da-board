'use strict'

module.exports = io => {
  io.on('connection', function (socket) {
    console.log('a user connected')

    // charts
    socket.on('GET_CHARTS', (data) => {
      Object.keys($store.getters.charts).forEach(key => {
        let chart = $store.getters.charts[key]
        if (chart.data) {
          socket.emit('SOCKET_CHARTS_UPDATE_ONE', chart)
        }
      })
    })

    // tiles
    socket.on('GET_TILES', (data) => {
      socket.emit('SOCKET_TILES', $store.getters.tiles)
    })

    // configs
    socket.on('GET_CONFIGS', (data) => {
      socket.emit('SOCKET_CONFIGS', $store.getters.configs)
    })
    socket.on('CONFIGS_UPDATE_SORTING', (data) => {
      console.log('CONFIGS_UPDATE_SORTING')
      $store.dispatch('updateConfigSorting', data)
      $store.dispatch('recalcSorting', data)
    })

    // build
    socket.on('GET_BUILD', (data) => {
      socket.emit('SOCKET_BUILD', $store.getters.build)
    })

    // integrations
    socket.on('GET_INTEGRATIONS', (data) => {
      socket.emit('SOCKET_INTEGRATIONS', $store.getters.integrations)
    })

    // integrations
    socket.on('GET_HOMELINKS', (data) => {
      console.log('SOCKET_HOMELINKS')
      socket.emit('SOCKET_HOMELINKS', $store.getters.homelinks)
    })

    // time sync
    socket.on('TIME_SYNC', (data) => {
      socket.emit('SOCKET_TIME_SYNC', { time: new Date().getTime() })
    })

    // run process
    socket.on('INTEGRATION_ACTION', (data) => {
      console.log('INTEGRATION_ACTION', data.action)
      $store.dispatch('integrationAction', data)
    })
  })
}
