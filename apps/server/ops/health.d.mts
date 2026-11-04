export function operationalHealth(url: string): Promise<{
  ready(): Promise<boolean>;
  pulse(): () => void;
  close(): Promise<void>;
}>;
