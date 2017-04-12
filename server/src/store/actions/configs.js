const Configs = require('../../models/Configs')

const actions = {
  async setConfigs ({ commit }) {
    return Configs.getAll((err, results) => {
      if (err) return log.error(err)

      results.forEach(val => commit('updateConfig', val.toObject()))
    })
  },

  updateConfig ({ state, commit, dispatch }, config) {
    let configsCount = Object.keys(state.configs).length
    commit('updateConfig', config)

    io.emit('SOCKET_CONFIGS_UPDATE_ONE', state.configs[config.name])

    if (configsCount !== Object.keys(state.configs).length) {
      dispatch('updateCharts')
    }
  },

  updateConfigDb ({ state, commit, dispatch }, data) {
    let condition = {}
    if (data._id) {
      condition._id = data._id
    } else {
      condition.name = data.name
    }
    Configs.getOneBy(condition, (err, config) => {
      if (err) {
        log.error(err)
        return dispatch('notifyDialogErr', Object.assign({}, data, { err }))
      }

      let prevName = undefined
      if (!config) {
        config = new Configs(data)
      } else {
        if (config.name !== data.name) {
          prevName = config.name
        }
        Object.keys(data).forEach(key => {
          if (!key.startsWith('_') && (config[key] !== data[key])) {
            config[key] = data[key]
            config.markModified(key)
          }
        })
      }

      config.save(err => {
        if (err) {
          log.error(err)
          return dispatch('notifyDialogErr', Object.assign({}, data, { err }))
        }

        dispatch('notifyDialogOk', data)
        $store.dispatch('updateConfig', Object.assign({}, config.toObject(), { prevName }))
      })
    })
  },

  createEmptyConfig ({ state, dispatch }, emptyConfig) {
    if (!state.configs[emptyConfig.name]) {
      let config = new Configs(emptyConfig)
      config.type = 'AUTOGENERATED'

      config.save(err => {
        if (err) return log.error(err)

        dispatch('updateConfig', config.toObject())
      })
    }
  },

  updateConfigSorting ({ state, commit, dispatch }, newConfig) {
    Configs.getOne(newConfig.name, (err, config) => {
      if (err) return log.error(err)

      config.sortBy = newConfig.sortBy
      config.save(err => {
        if (err) return log.error(err)

        dispatch('updateConfig', config.toObject())
      })
    })
  },

  addStage ({ state, dispatch }, configWithStage) {
    let currentConfig = state.configs[configWithStage.name]
    if (!currentConfig) {
      dispatch('createEmptyConfig', configWithStage)
    } else if (!currentConfig.stages.includes(configWithStage.stages[0])) {
      Configs.getOne(configWithStage.name, (err, config) => {
        if (err) return log.error(err)

        config.stages.push(configWithStage.stages[0])
        config.markModified('stages')
        config.save(err => {
          if (err) return log.error(err)

          dispatch('updateConfig', config.toObject())
        })
      })
    }
  },

  removeConfigDb ({ state, commit, dispatch }, data) {
    Configs.removeOne(data.name, (err, doc) => {
      if (err || !doc) {
        log.error(err)
        return dispatch('notifyDeleteErr', Object.assign({}, data, { err }))
      }
      dispatch('notifyDeleteOk', data)

      commit('deleteConfig', data.name)

      if (Object.keys(state.configs).length === 0) {
        Object.keys(state.charts).forEach(chartName => {
          if (!chartName.startsWith('_')) {
            commit('deleteChart', chartName)
          }
        })
      }

      io.emit('SOCKET_CONFIGS_DELETE', { name: data.name })
      dispatch('updateCharts')
    })
  },

  recalcSorting ({ state, dispatch }, config) {
    const threshold = 0.999999999999
    const step = 2048
    const maxValue = 999999999

    if (Math.abs(config.sortBy) % 1 >= threshold || Math.abs(config.sortBy) >= maxValue) {
      Configs.getAll((err, results) => {
        if (err) return log.error(err)

        let idx = 0
        results.forEach(val => {
          let doUpdate = false
          let newSorting = step * idx
          idx++

          if (val.disabled === true && val.sortBy !== maxValue) {
            val.sortBy = maxValue
            doUpdate = true
          } else if (val.disabled !== true && val.sortBy !== newSorting) {
            val.sortBy = newSorting
            doUpdate = true
          }

          if (doUpdate) {
            val.save(err => {
              if (err) return log.error(err)

              dispatch('updateConfig', val.toObject())
            })
          }
        })
      })
    }
  }
}

module.exports = actions
