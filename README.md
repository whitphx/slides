# talks

Presentations built with [Slidev](https://sli.dev/).

## Deployment

This site is deployed on Vercel. The build process:
1. Finds all presentations in */src directories
2. Builds each presentation with Slidev
3. Outputs to the dist directory
4. Deploys static files to Vercel

Environment variables:
- BASE_PATH=/talks
