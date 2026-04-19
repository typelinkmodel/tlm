import type { IQuery, ISearcher } from "../api/searcher";
export class Searcher implements ISearcher {
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  public async getUnique(_query: IQuery): Promise<any> {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  public async findUnique(_query: IQuery): Promise<any> {
    throw new Error("Not implemented");
  }
}
