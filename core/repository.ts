import { IPageRequest, IPagedResponse } from './pagination';

export interface IRepository<
  MutationModel,
  CompleteModel extends MutationModel
> {
  create(dat: MutationModel): CompleteModel;
  update(id: number, dat: MutationModel): CompleteModel | null;
  delete(id: number): CompleteModel | null;
  getById(id: number): CompleteModel | null;
  list(params: IPageRequest): IPagedResponse<CompleteModel>;
}
