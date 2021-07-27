import { generateID } from "../infrastructure/Backend";

export class Category {
    categoryId: string
    categoryName?: string
    count: number = 0

    constructor() {
        this.categoryId = generateID()
    }

    minimize(): CategoryCore {
        return CategoryCore.from(this)
    }
}

export class CategoryCore {
    categoryId: string
    categoryName?: string

    constructor(id: string = generateID()) {
        this.categoryId = id
    }

    static from(category: Category): CategoryCore {
        let core = new CategoryCore(category.categoryId)
        core.categoryName = category.categoryName
        return core
    }
}