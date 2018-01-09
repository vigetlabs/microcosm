module.exports = {
  siteMetadata: {
    title: `Microcosm`
  },
  plugins: [`gatsby-plugin-react-helmet`, `gatsby-plugin-sass`],
  pathPrefix: process.env.PUBLIC_PATH || '/'
}
