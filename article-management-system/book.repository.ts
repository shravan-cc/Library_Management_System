import { IPageRequest, IPagedResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { IBook, IBookBase } from "./models/book.model";

export class BookRepository implements IRepository<IBookBase, IBook> {
    create(dat: IBookBase): IBook {
        throw new Error("Method not implemented.");
    }
    update(id: number, dat: IBookBase): IBook | null {
        throw new Error("Method not implemented.");
    }
    delete(id: number): IBook | null {
        throw new Error("Method not implemented.");
    }
    getById(id: number): IBook | null {
        throw new Error("Method not implemented.");
    }
    list(params: IPageRequest): IPagedResponse<IBook> {
        throw new Error("Method not implemented.");
    } 
    
}