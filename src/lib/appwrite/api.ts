import { ID } from "appwrite";

import { account } from "./config";
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

        return newAccount;

    } catch (error) {
        console.log(error);
        return error;
    }
}