/** توسيع Express حتى يعرف TypeScript حقولنا على res.locals */

declare global {
  namespace Express {
    interface Locals {
      requestId?: string;
    }
  }
}

export {};
