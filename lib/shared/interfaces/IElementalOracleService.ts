export interface IElementalOracleService {
  fetchElementalInsights(params: any): Promise<any>;
  elementalOracle(query: any): Promise<any>;
}