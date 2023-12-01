import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import * as z from "zod";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SigninValidation } from "@/lib/validation"
import Loader from "@/components/shared/Loader"
import { useToast } from "@/components/ui/use-toast";
import { useSignInAccount } from "@/lib/react-query/queryAndMutations";
import { useUserContext } from "@/context/AuthContext";

const SigninForm = () => {

    const { toast } = useToast()
    const navigate = useNavigate();
    const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

    const { mutateAsync: signInAccount } = useSignInAccount();

    // 1. form tanımlama
    const form = useForm<z.infer<typeof SigninValidation>>({
        resolver: zodResolver(SigninValidation),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    // 2. 
    async function onSubmit(values: z.infer<typeof SigninValidation>) {

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
                    Heabınıza giriş yapın
                </h3>
                <p className="text-light-3 pt-1 small-medium md:base-regular">
                    Hoşgeldiniz. Bilgilerinizi giriniz.
                </p>

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-5 w-full mt-4"
                >
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
                        {isUserLoading ? (
                            <div className="flex-center gap-2">
                                <Loader /> Loading...
                            </div>
                        ) : "Giriş Yap"}
                    </Button>

                    <p className="text-small-regular text-light-2 text-center mt-2">
                        Hesabınız yok mu?
                        <Link
                            to="/sign-up"
                            className="text-primary-500 text-small-semibld ml-1"
                        >
                            Kayıt Ol
                        </Link>
                    </p>

                </form>
            </div>
        </Form>
    )
}

export default SigninForm