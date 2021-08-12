import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            home: "Home",
            scan: "Scan",
            assets: "Assets",
            users: "Users",
            assignments: "Assignments",
            settings: "Settings",
            signout: "Sign-out",
            continue: "Continue",
            cancel: "Cancel",
            confirm_signout: "Sign out?",
            confirm_signout_message: "Are you sure you want to end your session? You will need to enter your credentials again next time."
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