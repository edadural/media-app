import { INewPost, INewUser } from "@/types";
import {
    useMutation, useQuery, useQueryClient,
} from "@tanstack/react-query";
import { createPost, createUserAccount, getRecentPosts, signInAccount, signOutAccount } from "../appwrite/api";
import { QUERY_KEYS } from "./queryKeys";

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


// ============================================================
// POST QUERIES

export const useCreatePost = () => {
    // gönderi oluşturduktan sonra, mevcut tüm gönderileri de sorgulamak 
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
        }, // yeni bir gönderi oluşturduktan sonra son gönderiler için sorguyu geçersiz kılmalıyız
    });
};

// son gönderiyi al en üste aktar
export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    });
};