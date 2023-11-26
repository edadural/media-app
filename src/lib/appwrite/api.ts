import { ID } from "appwrite";

import { account, appwriteConfig, avatars, databases } from "./config";
import { INewUser } from "@/types";

// ============================================================
// AUTH
// formdan çağırmak üzere olduğumuz işlevler
// ============================================================

// ============================== SIGN UP
// kullanıcıyı oluşturmak için kimlik doğrulama işlevleri
export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),      // benzersiz kimliği sağlamak için
            user.email,
            user.password,
            user.name
        );

        if (!newAccount) throw Error;       // yeni hesap olup olmadığını kontrol etme

        const avatarUrl = avatars.getInitials(user.name);   //isimdeki bas harfler avatar 

        const newUser = await saveUserToDB({       // verilen kullanıcı bilgilerini alır,  kullanıcıyı db de kaydeder
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        });

        return newUser;


    } catch (error) {
        console.log(error);
        return error;
    }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?: string;
}) {
    try {
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        );

        return newUser;
    } catch (error) {
        console.log(error);
    }
}