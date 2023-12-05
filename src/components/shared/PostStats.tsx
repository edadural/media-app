import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/queryAndMutations";
import { checkIsLiked } from "@/lib/utils";
import { Models } from "appwrite"
import Loader from "@/components/shared/Loader"
import { useEffect, useState } from "react";

// postun istatistiklerini veya görselleştirmelerini oluşturmak icin bilgiler
type PostStatsProps = {
    post: Models.Document;
    userId: string;
}

const PostStats = ({ post, userId }: PostStatsProps) => {
    const likesList = post.likes.map((user: Models.Document) => user.$id);

    const [likes, setLikes] = useState(likesList);
    const [isSaved, setIsSaved] = useState(false);

    const { mutate: likePost } = useLikePost();
    const { mutate: savePost, isPending: isSavingPost } = useSavePost();
    const { mutate: deleteSavePost, isPending: isDeletingSaved } = useDeleteSavedPost();

    const { data: currentUser } = useGetCurrentUser();

    // kaydedilen gonderi sayfa yenilendiginde degismemesi icin
    const savedPostRecord = currentUser?.save.find(
        (record: Models.Document) => record.post.$id === post.$id
    );

    // bir şeyin varlığını veya yokluğunu kontrol etmek
    // {saved: true} => !savedPostedRecord => !false = true
    useEffect(() => {
        setIsSaved(!!savedPostRecord);      // savedPostRecord varsa, !!savedPostRecord true olur; yoksa false olur.
    }, [currentUser]);

    //  kullanıcının bir gönderiyi begenme veya beğeniden çıkarma islemi
    const handleLikePost = (
        e: React.MouseEvent<HTMLImageElement, MouseEvent>
    ) => {
        e.stopPropagation();

        let likesArray = [...likes];

        if (likesArray.includes(userId)) {      // dizide kullanıcı bulunuyosa
            likesArray = likesArray.filter((Id) => Id !== userId);  // diziden kullanıcı kimliği çıkarılarak beğeni kaldırılır
        } else {
            likesArray.push(userId);    // kullanıcı kimligi eklenir
        }

        setLikes(likesArray);
        likePost({ postId: post.$id, likesArray });
    };


    const handleSavePost = (
        e: React.MouseEvent<HTMLImageElement, MouseEvent>
    ) => {
        e.stopPropagation();

        if (savedPostRecord) {
            setIsSaved(false);
            return deleteSavePost(savedPostRecord.$id);
        }

        savePost({ userId: userId, postId: post.$id });
        setIsSaved(true);
    };

    return (
        <div className="flex justify-between items-center z-20">
            {/* begeni */}
            <div className="flex gap-2 mr-5">
                <img
                    src={`${checkIsLiked(likes, userId)
                        ? "/assets/icons/liked.svg"
                        : "/assets/icons/like.svg"
                        }`}
                    alt="like"
                    width={20}
                    height={20}
                    onClick={handleLikePost}
                    className="cursor-pointer"
                />
                <p className="small-medium lg:base-medium">
                    {likes.length}
                </p>
            </div>

            {/* kaydedilen */}
            <div className="flex gap-2">
                {isSavingPost || isDeletingSaved
                    ? <Loader />
                    : <img
                        src={isSaved
                            ? "/assets/icons/saved.svg"
                            : "/assets/icons/save.svg"
                        }
                        alt="share"
                        width={20}
                        height={20}
                        className="cursor-pointer"
                        onClick={handleSavePost}
                    />}
            </div>
        </div>
    )
}

export default PostStats