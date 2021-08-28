import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            app_name: "Ludendorff",
            auth: {
                hello: "Hello.",
                welcome_back: "Welcome Back."
            },
            navigation: {
                manage: "Manage",
                account: "Account",
                home: "Home",
                scan: "Scan",
                assets: "Assets",
                users: "Users",
                assignments: "Assignments",
                categories: "Categories",
                departments: "Departments",
                profile: "Profile",
                settings: "Settings",
            },
            field: {
                email: "Email",
                password: "Password",
                first_name: "First Name",
                last_name: "Last Name",
                permissions: "Permissions",
                position: "Position",
                department: "Department",
                id: 'ID',
                name: 'Name',
                date_created: 'Date Created',
                date_assigned: 'Date Assigned',
                date_returned: 'Date Returned',
                category: "Category",
                category_name: "Category Name", 
                specification: "Specification",
                specification_key: "Name",
                specification_value: "Value",
                status: "Status",
                asset_name: "Asset Name",
                count: "Count: {{count}}",
                department_name: "Department Name",
                manager: "Manager",
                user: "User",
                location: "Location"
            },
            status: {
                operational: "Operational",
                idle: "Idle",
                under_maintenance: "Under Maintenance",
                retired: "Retired",
            },
            permission: {
                read: "Read",
                write: "Write",
                delete: "Delete",
                audit: "Audit",
                manage_users: "Manage Users",
                administrative: "Administrative",
            },
            confirm: {
                signout: "Sign out?",
                signout_message: "Are you sure you want to end your session? You will need to enter your credentials again next time.",
                category_remove: "Remove category?",
                category_remove_summary: "Do you want to remove this category? This action cannot be undone.",
            },
            action: {
                change_name: "Change Name",
                change_password: "Change Password",
                request_reset: "Request Password Reset"
            },
            button: {
                go_to_home: "Go to Home"
            },
            error: {
                not_found_header: "Whoops!",
                not_found_summary: "We couldn't find that page.",
                not_found_info: "Maybe you can head back home and find it there instead?"
            },
            signout: "Sign-out",
            continue: "Continue",
            cancel: "Cancel",
            add: "Add",
            save: "Save",
            select: "Select",
            previous: "Previous",
            next: "Next",
            close: "Close",
            delete: "Delete",
            show_menu: "Show menu",
            show_drawer: "Show drawer",
            authenticating: "Authenticating",
            sign_in: "Sign in",
            unknown: "Unknown",
            actions: "Actions",
            not_set: "Not Set",
            asset_details: "Asset Details",
            category_details: "Category Details",
            specification_details: "Specification Details",
            user_details: "User Details",
            department_details: "Department Details",
            asset_select: "Select Asset",
            category_select: "Select Category",
            user_select: "Select User",
            department_select: "Select Department",
            view_qr_code: "View QR-Code",
            view_qr_code_summary: "To save the code, right-click the image then select \"Save Image\".",
            empty_asset: "No Assets Added",
            empty_asset_summary: "There are no assets available.",
            empty_category: "No Categories Added",
            empty_category_summary: "There are no categories available that can be used to organize the assets.",
            empty_user: "No Users Added",
            empty_user_summary: "There are no users available.",
            empty_department: "No Departments Added",
            empty_department_summary: "There are no departments available that can be used to assign the users from.",
            empty_assignment: "No Assignments Available",
            empty_assignment_summary: "There are currently no records of assigned assets to the users.",
            empty_scanned_code: "Scan a QR-Code",
            empty_scanned_code_summary: "You'll need to scan a valid QR-Code first to view its embedded data.",
            feedback_asset_created: "Asset created successfully",
            feedback_asset_updated: "Asset updated successfully",
            feedback_asset_removed: "Asset removed successfully",
            feedback_category_created: "Category created successfully",
            feedback_category_updated: "Category updated successfully",
            feedback_category_removed: "Category removed successfully",
            feedback_user_created: "User created successfully",
            feedback_user_updated: "User updated successfully",
            feedback_user_removed: "User removed successfully",
            feedback_department_created: "Department created successfully",
            feedback_department_updated: "Department updated successfully",
            feedback_department_removed: "Department removed successfully",
            feedback_assignment_created: "Assignment created successfully",
            feedback_assignment_updated: "Assignment updated successfully",
            feedback_assignment_removed: "Assignment removed successfully",
            feedback_asset_create_error: "Error creating asset",
            feedback_asset_update_error: "Error updating asset",
            feedback_asset_remove_error: "Error removing asset",
            feedback_category_create_error: "Error creating category",
            feedback_category_update_error: "Error updating category",
            feedback_category_remove_error: "Error removing category",
            feedback_user_create_error: "Error creating user",
            feedback_user_update_error: "Error updating user",
            feedback_user_remove_error: "Error removing user",
            feedback_department_create_error: "Error creating department",
            feedback_department_update_error: "Error updating department",
            feedback_department_remove_error: "Error removing department",
            feedback_assignment_create_error: "Error creating assignment",
            feedback_assignment_update_error: "Error updating assignment",
            feedback_assignment_remove_error: "Error removing department",
            settings_dark_theme: "Dark Theme",
            settings_dark_theme_summary: "Make the interface darker and easier on the eyes."
        }
    }
}

i18n.use(initReactI18next)
    .init({
        resources, 
        lng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;