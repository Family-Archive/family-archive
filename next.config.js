/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
    webpack(config) {
        config.experiments = { ...config.experiments, topLevelAwait: true }
        return config
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
        prependData: `@import "variables.scss";`
    }
}

module.exports = nextConfig
