export interface ILoader {
  loadFile(filename: string): Promise<void>;
  supportsExtension(extension: string): boolean;
}
