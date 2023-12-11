import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "../ui/textarea"
import FileUploader from "../shared/FileUploader"
import { Input } from "../ui/input"
import { PostValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useUserContext } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useToast } from "../ui/use-toast"
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queryAndMutations"
import Loader from "../shared/Loader"

type PostFormProps = {
    post?: Models.Document;
    action: "Oluştur" | "Güncelle";
};

const PostForm = ({ post, action }: PostFormProps) => {
    const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
    // mutateAsync - asenkron bir işlemi tetiklemek için kullanılacak bir fonksiyon, isLoading - post oluşturma işleminin yükleniyor olup olmadığını izlemek için kullanılan bir durum değişkeni
    const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();
    const { user } = useUserContext();
    const navigate = useNavigate();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            caption: post ? post?.caption : "",     // gönderi varsa gönderinin başlığı
            file: [],
            location: post ? post.location : "",
            tags: post ? post.tags.join(",") : "",
        },
    })

    async function onSubmit(values: z.infer<typeof PostValidation>) {
        if (post && action === "Güncelle") {
            const updatedPost = await updatePost({
                ...values,
                postId: post.$id,
                imageId: post.imageId,
                imageUrl: post.imageUrl,
            });

            // guncellenmis gonderi yoksa
            if (!updatedPost) {
                toast({
                    title: 'Tekrar deneyin.',
                });
            }

            // Oluşturulan gönderi basarılı bir şekilde güncellendigini gormek icin o sayfanın ayrıntılarına git
            return navigate(`/posts/${post.$id}`);
        }


        const newPost = await createPost({
            ...values,
            userId: user.id,
        });
        if (!newPost) {
            toast({
                title: 'Please try again.',
            });
        }
        navigate("/");
    }
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-9 w-full max-w-5xl">
                <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Başlık</FormLabel>
                            <FormControl>
                                <Textarea className="shad-textarea custom-scrollbar" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Fotoğraf Ekle</FormLabel>
                            <FormControl>
                                <FileUploader
                                    fieldChange={field.onChange}    // alan değişikliği - form alanından
                                    mediaUrl={post?.imageUrl}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Konum Ekle</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    className="shad-input"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Etiket Ekle (virgülle ayır " , ")</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    className="shad-input"
                                    placeholder="Sanat, İfade, Doğa"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4 items-center justify-end">
                    <Button
                        type="button"
                        className="shad-button_dark_4"
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        className="shad-button_primary whitespace-nowrap"
                        disabled={isLoadingCreate || isLoadingUpdate}>
                        {(isLoadingCreate || isLoadingUpdate) && <Loader />}
                        {action}
                    </Button>
                </div>

            </form>
        </Form >
    )
}

export default PostForm;