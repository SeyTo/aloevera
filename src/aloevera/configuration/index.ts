export default function () {
  return (app: AloeVera) => {
    let config = require('config')

    // take root configs and set into app
    for (const key in config) {
      if (config.hasOwnProperty(key))
        app.set(key, config[key])
    }
  };
}
