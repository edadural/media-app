import * as z from "zod";

//  verileri daha sonra yeniden kullanabileceğimiz ve yönetebileceğimiz bir bileşene dönüştürmek için burası

// USER
export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır." }),
  username: z.string().min(2, { message: "Kullanıcı adı en az 2 karakter olmalıdır." }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Parola en az 8 karakter olmalıdır." }),
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Parola en az 8 karakter olmalıdır." }),
});

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır." }),
  username: z.string().min(2, { message: "Kullanıcı adı en az 2 karakter olmalıdır." }),
  email: z.string().email(),
  bio: z.string(),
});


// POST
export const PostValidation = z.object({
  caption: z.string().min(5, { message: "En az 5 karakter." }).max(2200, { message: "En fazla 2,200 karakter." }),
  file: z.custom<File[]>(),
  location: z.string().min(1, { message: "Bu alan zorunlu" }).max(1000, { message: "En fazla 1000 karakter." }),
  tags: z.string(),
});