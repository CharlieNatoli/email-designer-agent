declare module 'probe-image-size' {
  export interface ProbeResult {
    width: number;
    height: number;
    type?: string;
    mime?: string;
  }
  export interface ProbeFn {
    (input: any): Promise<ProbeResult>;
    sync?: (input: any) => ProbeResult | undefined;
  }
  const probe: ProbeFn;
  export default probe;
}


