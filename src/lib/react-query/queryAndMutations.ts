import { INewPost, INewUser } from "@/types";
import {
    useMutation, useQuery, useQueryClient,
} from "@tanstack/react-query";
import { createPost, createUserAccount, deleteSavedPost, getCurrentUser, getRecentPosts, likePost, savePost, signInAccount, signOutAccount } from "../appwrite/api";
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
// USER QUERIES

// mevcut kullanıcı bilgilerini almak için kullanılan bir React Query hook
export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],     // özel bir kimlik anahtarıdır, 
        queryFn: getCurrentUser,                    // Sorgunun gerçekleştirileceği işlevi belirtir,
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

// bir gönderiyi beğenmek için kullanılan işlevsellikleri içerir ve bu işlevsellikleri kullanarak bir postun beğenilmesi durumunda arka planda çalışacak olan useMutation hook'unu döndürür
export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            postId,
            likesArray,
        }: {
            postId: string;
            likesArray: string[];
        }) => likePost(postId, likesArray),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

export const useSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
            savePost(userId, postId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS],
            });
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER],
            });
        },
    });
};