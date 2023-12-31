import { ID, Query } from "appwrite";

import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";

// ============================================================
// AUTH
// formdan çağırmak üzere olduğumuz işlevler
// ============================================================

// SIGN UP
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

// SAVE USER TO DB
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

// SIGN IN
// kullanıcının email ve parola bilgileriyle oturum açması
export async function signInAccount(user: { email: string; password: string }) {
    try {
        const session = await account.createEmailSession(user.email, user.password);

        return session;
    } catch (error) {
        console.log(error);
    }
}

// GET USER
// oturum açmış kullanıcının bilgilerini elde etmek için
export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}

// SIGN OUT
// mevcut kullanıcının oturumunu sonlandırmak ve çıkış yapmak 
export async function signOutAccount() {
    try {
        const session = await account.deleteSession("current");

        return session;
    } catch (error) {
        console.log(error);
    }
}


// ============================================================
// POSTS
// ============================================================


// CREATE POST
export async function createPost(post: INewPost) {
    try {
        // Görüntüyü depolama alanına yükleyin
        const uploadedFile = await uploadFile(post.file[0]);

        if (!uploadedFile) throw Error; // Yüklenen dosya yoksa bir hata atıp atmadığımızı kontrol etmek

        // Get file url
        const fileUrl = getFilePreview(uploadedFile.$id);

        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        // etiketleri bir diziye dönüştürmek
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // gönderiyi veritabanına kaydetmek
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags,
            }
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw Error;
        }

        return newPost;
    } catch (error) {
        console.log(error);
    }
}

//  UPLOAD FILE
export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );

        return uploadedFile;
    } catch (error) {
        console.log(error);
    }
}

// GET FILE URL
export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100
        );

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        console.log(error);
    }
}

// DELETE FILE
export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

export async function getRecentPosts() {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(20)]
            // desc -> en sonuncusu görünecek, 20 gönderi ile sınırlı
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

// LIKE / UNLIKE POST
// belirli bir gönderiyi begenen kullanıcıların listesini takip etmek icin
export async function likePost(postId: string, likesArray: string[]) {
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likesArray,
            }
        );

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

// SAVE POST
export async function savePost(userId: string, postId: string) {
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user: userId,
                post: postId,
            }
        );

        if (!updatedPost) throw Error;

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

//  DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId
        );

        if (!statusCode) throw Error;

        return { status: "ok" };
    } catch (error) {
        console.log(error);
    }
}

// GET POST BY ID
export async function getPostById(postId?: string) {
    if (!postId) throw Error;

    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );

        if (!post) throw Error;

        return post;
    } catch (error) {
        console.log(error);
    }
}

// UPDATE POST
export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file.length > 0;

    try {
        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId,
        };

        if (hasFileToUpdate) {
            // Görüntüyü depolama alanına yükleyin
            const uploadedFile = await uploadFile(post.file[0]);

            if (!uploadedFile) throw Error; // Yüklenen dosya yoksa bir hata atıp atmadığımızı kontrol etmek

            // Get new file url
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
        }

        // etiketleri bir diziye dönüştürmek
        const tags = post.tags?.replace(/ /g, "").split(",") || [];

        // gönderiyi veritabanına kaydetmek
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags,
            }
        );

        if (!updatedPost) {
            await deleteFile(post.imageId);
            throw Error;
        }

        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

export async function deletePost(postId: string, imageId: string) {
    if (!postId || !imageId) throw Error;

    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )

        return { status: 'ok' }
    } catch (error) {
        console.log(error);
    }

}

// SONSUZ GONDERİ
// bu kod parçası belirli bir imleç sonrasındaki verilerin alınmasını sağlayarak sayfalama işlemini gerçekleştirir.
// Verileri parça parça getirerek büyük veri setlerini yönetmeyi amaçlar
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    // kullanıcının hangi sayfayı almak istediğini belirler ve kullanıcı kaydırdıkça veya sayfa değiştirdikçe daha fazla veri getirmek için kullanılanilir

    const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];
    // verileri belirli bir alana göre azalan sırayla sıralamak için kullanılır. en fazla 9 öğe alınabilir.

    if (pageParam) {
        queries.push(Query.cursorAfter(pageParam.toString()));
        // belirli bir imleçten sonrasındaki verileri getirmek için kullanılır
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}

// kullanıcılar tarafından girilen bir terime göre gönderileri filtrelemek veya aramak için bu fonksiyon kullanılabilir
export async function searchPosts(searchTerm: string) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search("caption", searchTerm)]  // basliga gore arama
        );

        if (!posts) throw Error;

        return posts;
    } catch (error) {
        console.log(error);
    }
}


// ============================================================
// USER
// ============================================================

// GET USERS
// veritabanındaki kullanıcıları sorgulamak ve almak için 
export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];

    if (limit) {
        queries.push(Query.limit(limit));
    }

    try {
        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            queries
        );

        if (!users) throw Error;

        return users;
    } catch (error) {
        console.log(error);
    }
}

// GET USER BY ID
export async function getUserById(userId: string) {
    try {
        const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
        );

        if (!user) throw Error;

        return user;
    } catch (error) {
        console.log(error);
    }
}

// UPDATE USER
export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
        let image = {
            imageUrl: user.imageUrl,
            imageId: user.imageId,
        };

        if (hasFileToUpdate) {
            // Appwrite deposuna yeni dosya yükle
            const uploadedFile = await uploadFile(user.file[0]);
            if (!uploadedFile) throw Error;

            // Yeni dosya URL'sini al
            const fileUrl = getFilePreview(uploadedFile.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id);
                throw Error;
            }

            image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
        }

        //  Kullanıcıyı güncelle
        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            user.userId,
            {
                name: user.name,
                bio: user.bio,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
            }
        );

        // Güncelleme başarısız oldu
        if (!updatedUser) {
            // Yakın zamanda yüklenen yeni dosyayı silin
            if (hasFileToUpdate) {
                await deleteFile(image.imageId);
            }
            // Yeni dosya yüklenmediyse hata at
            throw Error;
        }

        // Başarılı güncellemeden sonra eski dosyayı güvenle silin
        if (user.imageId && hasFileToUpdate) {
            await deleteFile(user.imageId);
        }

        return updatedUser;
    } catch (error) {
        console.log(error);
    }
}