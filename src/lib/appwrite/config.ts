// appwrite servisi ile etkileşim kurmak için gerekli yapılandırma, kimlik doğrulama

import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const appwriteConfig = {
    url: import.meta.env.VITE_APPWRITE_URL,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
    postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
    savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
};

export const client = new Client();

// client nesnesine yapılandırma bilgileri ekleniyor
client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

// appwrite servisinin farklı özellikleri ve işlevleri
export const account = new Account(client);         // kullanıcı hesapları yönetimi için 
export const databases = new Databases(client);     // veritabanı işlemleri için
export const storage = new Storage(client);         // dosya depolama için
export const avatars = new Avatars(client);