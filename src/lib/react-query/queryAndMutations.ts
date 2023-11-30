import { INewUser } from "@/types";
import {
    useMutation,
} from "@tanstack/react-query";
import { createUserAccount, signInAccount, signOutAccount } from "../appwrite/api";

// ============================================================
// AUTH QUERIES

// bir kullanıcı hesabı oluşturmak için kullanılabilecek bir mutasyon fonksiyonu
export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user),
    });
};

// kullanıcı oturum açma işlemlerini gerçekleştirmek için bir mutasyon hook'unu döndürür
export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: {
            email: string;
            password: string
        }) => signInAccount(user),
    });
};

export const useSignOutAccount = () => {
    return useMutation({
      mutationFn: signOutAccount
    });
  };