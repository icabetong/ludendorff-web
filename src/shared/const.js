export const assetCollection = "assets";
export const categoryCollection = "categories";
export const userCollection = "users";
export const departmentCollection = "departments";
export const assignmentCollection = "assignments";
export const requestCollection = "requests";

export const categoryId = "categoryId";
export const categoryName = "categoryName";
export const categoryCount = "count";

export const assetId = "assetId";
export const assetName = "assetName";
export const dateCreated = "dateCreated";
export const assetStatus = "status";
export const assetCategory = "category";
export const assetCategoryId = `${assetCategory}.${categoryId}`
export const assetCategoryName = `${assetCategory}.${categoryName}`
export const specifications = "specifications";

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

export const assignmentId = "assignmentId";
export const assignmentAsset = "asset";
export const assignmentAssetId = `${assignmentAsset}.${assetId}`;
export const assignmentAssetName = `${assignmentAsset}.${assetName}`;
export const assignmentAssetStatus = `${assignmentAsset}.${assetStatus}`;
export const assignmentAssetCategory = `${assignmentAsset}.${assetCategory}`;
export const assignmentAssetCategoryId = `${assignmentAsset}.${assetCategory}.${categoryId}`;
export const assignmentAssetCategoryName = `${assignmentAsset}.${assetCategoryName}`
export const assignmentUser = "user";
export const assignmentUserId = `${assignmentUser}.${userId}`;
export const assignmentUserEmail = `${assignmentUser}.${email}`;
export const assignmentUserPosition = `${assignmentUser}.${position}`;
export const dateAssigned = "dateAssigned";
export const dateReturned = "dateReturned";
export const location = "location";
export const remarks = "remarks";

export const requestId = "requestId";
export const requestedAsset = "asset";
export const requestedAssetName = `${requestedAsset}.${assetName}`;
export const petitioner = "petitioner"
export const petitionerId = `${petitioner}.${userId}`;
export const endorser = "endorser"
export const endorserId = `${endorser}.${userId}`
export const submittedDate = "submittedTimestamp"