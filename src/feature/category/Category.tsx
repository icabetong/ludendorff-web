import { generateID } from "../../api/Backend";

export class Category {
    categoryId: string
    categoryName?: string
    count: number = 0

    minimize(): CategoryCore {
        return CategoryCore.from(this)
    }

    constructor() {
        this.categoryId = generateID()
    }

    static COLLECTION = "categories"
    static FIELD_CATEGORY_ID = "categoryId"
    static FIELD_CATEGORY_NAME = "categoryName"
    static FIELD_COUNT = "count"
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