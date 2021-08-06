export interface ILoader {
  loadFile(filename: string): Promise<void>;
}
