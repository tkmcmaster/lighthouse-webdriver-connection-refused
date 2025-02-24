declare module "lighthouse/lighthouse-core/fraggle-rock/api.js" {
  /* eslint-disable */
  export async function startFlow (page: Page, options: ConstructorParameters<LH.UserFlow>[1]): UserFlow {
    return new UserFlow(page, options);
  }
}