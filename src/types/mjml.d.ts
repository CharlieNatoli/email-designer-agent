declare module "mjml" {
  export interface MJMLResult {
    html: string;
    errors: Array<unknown>;
  }
  const mjml2html: (mjml: string, options?: Record<string, unknown>) => MJMLResult;
  export default mjml2html;
}
