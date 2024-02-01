import { initializeApp, getApps, cert } from "firebase-admin/app";

import serviceAccount from "./firebaseServiceAccountKey.json"

const firebaseAdminConfig = {
  credential: cert(serviceAccount),
};

export function customInitApp() {
  if (getApps().length <= 0) {
    initializeApp(firebaseAdminConfig);
  }
}
