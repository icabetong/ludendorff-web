export const assetCollection = "assets";
export const typeCollection = "types";
export const userCollection = "users";
export const departmentCollection = "departments";

export const typeId = "typeId";
export const typeName = "typeName";
export const typeCount = "count";

export const assetStockNumber = "stockNumber";
export const assetDescription = "description";
export const assetClassification = "classification";
export const assetUnitOfMeasure = "unitOfMeasure";
export const assetUnitValue = "unitValue";
export const assetRemarks = "remarks";
export const dateCreated = "dateCreated";
export const assetStatus = "status";
export const assetType = "category";
export const assetTypeId = `${assetType}.${typeId}`
export const assetTypeName = `${assetType}.${typeName}`

export const userId = "userId";
export const departmentId = "departmentId";
export const departmentName = "name";
export const departmentManager = "manager";
export const departmentManagerId = `${departmentManager}.${userId}`;
export const departmentManagerName = `${departmentManager}.name`;
export const departmentCount = "count";

export const firstName = "firstName";
export const lastName = "lastName";
export const email = "email";
export const imageUrl = "imageUrl";
export const permissions = "permissions";
export const position = "position";
export const department = "department";
export const userDepartmentId = `${department}.${departmentId}`;
export const userDepartmentName = `${department}.${departmentName}`;