import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"

import * as z from "zod";
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SignupValidation } from "@/lib/validation"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import Loader from "@/components/shared/Loader"
import { useToast } from "@/components/ui/use-toast";
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queryAndMutations";
import { useUserContext } from "@/context/AuthContext";

const SignupForm = () => {

    const { toast } = useToast()
    const navigate = useNavigate();
    const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

    const { mutateAsync: createUserAccount, isPending: isCreatingUser } = useCreateUserAccount();  // asenkron işlemleri yönetmek ve veri alışverişini kolaylaştırmak

    const { mutateAsync: signInAccount, isPending: isSigningIn } = useSignInAccount();

    // 1. form tanımlama
    const form = useForm<z.infer<typeof SignupValidation>>({
        resolver: zodResolver(SignupValidation),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
        },
    })

    // 2. 
    async function onSubmit(values: z.infer<typeof SignupValidation>) {
        // create user
        const newUser = await createUserAccount(values);

        if (!newUser) {
            return toast({ title: "Kayıl ol başarısız. Tekrar deneyiniz." });
        }

        const session = await signInAccount({
            email: values.email,
            password: values.password,
        })

        if (!session) {
            return toast({ title: "Giriş yap başarısız. Tekrar deneyiniz." })
        }

        const isLoggedIn = await checkAuthUser();

        if (isLoggedIn) {
            form.reset();

            navigate("/");
        } else {
            toast({ title: "Kayıl ol başarısız. Tekrar deneyiniz." })
        }
    }

    return (
        <Form {...form}>
            <div className="sm:w-420 flex-center flex-col">

                <img src="/assets/images/logo.svg" alt="logo" />
                <h3 className="h4-bold md:h3-bold pt-3 sm:pt-5">
                    Yeni bir hesap oluştur
                </h3>
                <p className="text-light-3 pt-1 small-medium md:base-regular">
                    Snapgram'ı kullanmak için bilgilerinizi giriniz
                </p>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-5 w-full mt-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ad</FormLabel>
                                <FormControl>
                                    <Input type="text" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kullanıcı adı</FormLabel>
                                <FormControl>
                                    <Input type="text" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parola</FormLabel>
                                <FormControl>
                                    <Input type="password" className="shad-input" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="shad-button_primary"
                    >
                        {isCreatingUser || isSigningIn || isUserLoading ? (
                            <div className="flex-center gap-2">
                                <Loader /> Loading...
                            </div>
                        ) : "Kayıt Ol"}
                    </Button>

                    <p className="text-small-regular text-light-2 text-center mt-2">
                        Zaten bir hesabınız var mı?
                        <Link
                            to="/sign-in"
                            className="text-primary-500 text-small-semibld ml-1"
                        >
                            Giriş Yap
                        </Link>
                    </p>

                </form>
            </div>
        </Form>
    )
}

export default SignupForm