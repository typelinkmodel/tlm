import { ISearcher, IQuery } from "../api/searcher";
export class Searcher implements ISearcher {
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  public async getUnique(query: IQuery): Promise<any> {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  public async findUnique(query: IQuery): Promise<any> {
    throw new Error("Not implemented");
  }
}
